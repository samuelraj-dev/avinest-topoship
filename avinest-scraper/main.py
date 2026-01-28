from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import asyncio
from typing import Optional
import aiofiles
from pathlib import Path
import time
import re
from collections import OrderedDict
from typing import List, Dict, Tuple

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/media",
    StaticFiles(directory="uploads"),
    name="media",
)

# Portal URLs
PORTAL_LOGIN_URL = "https://ims.ritchennai.edu.in/login"
PORTAL_HOME_URL = "https://ims.ritchennai.edu.in/admin"
PORTAL_CSRF_URL = "https://ims.ritchennai.edu.in/admin/grade/student/mark/report"
LOGIN_FAILURE_MSG = "These credentials do not match our records."

FACULTY_SUBJECTS_URL = "https://ims.ritchennai.edu.in/admin/staff-subjects/index"
STUDENT_TIMETABLE_URL = "https://ims.ritchennai.edu.in/admin/student-time-table/2938"

class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfileResponse(BaseModel):
    username: str
    full_name: str
    email: str
    phone: str
    role: str  # STUDENT or FACULTY
    avatar_url: Optional[str] = None
    profile_href: str
    student: Optional[object] = None
    faculty: Optional[object] = None

class ScrapingError(BaseModel):
    error: str
    detail: str

async def fetch_csrf_token(client: httpx.AsyncClient, url: str) -> str:
    """Fetch CSRF token from a page"""
    try:
        response = await client.get(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=120.0
        )
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        token_element = soup.select_one("input[name=_token]")
        
        if not token_element:
            raise HTTPException(status_code=500, detail="Unable to fetch CSRF token")
        
        return token_element.get("value", "")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch CSRF token: {str(e)}")
    
def extract_name_code(text: str):
    """
    Extract 'Name (CODE)' → ('Name', 'CODE')
    Fallbacks safely if format changes.
    """
    if not text:
        return text, None

    match = re.match(r"(.+?)\s*\(([^)]+)\)", text)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    return text.strip(), None


async def perform_login(client: httpx.AsyncClient, username: str, password: str, csrf_token: str) -> bool:
    """Perform login to the portal"""
    try:
        login_data = {
            "email": username,
            "password": password,
            "_token": csrf_token
        }
        
        response = await client.post(
            PORTAL_LOGIN_URL,
            data=login_data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": PORTAL_LOGIN_URL
            },
            timeout=120.0
        )
        
        # Check for login failure message
        if LOGIN_FAILURE_MSG in response.text:
            return False
        
        # Additional checks for successful login
        if response.status_code not in [200, 302]:
            return False
            
        return True
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Login request failed: {str(e)}")

async def fetch_home_page(client: httpx.AsyncClient) -> BeautifulSoup:
    """Fetch the home page after login"""
    try:
        response = await client.get(
            PORTAL_HOME_URL,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=120.0
        )
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch home page: {str(e)}")

def extract_profile_href(soup: BeautifulSoup) -> str:
    """Extract profile URL from home page"""
    profile_element = soup.select_one("a.dropdown-item:contains('My Profile')")
    
    if not profile_element:
        raise HTTPException(status_code=500, detail="Unable to find profile link")
    
    href = profile_element.get("href", "")
    if not href:
        raise HTTPException(status_code=500, detail="Profile link is empty")
    
    return href

def determine_role(profile_href: str) -> str:
    """Determine user role from profile URL"""
    if "students" in profile_href.lower():
        return "STUDENT"
    else:
        return "FACULTY"

async def download_image(client: httpx.AsyncClient, image_url: str, upload_dir: str = "uploads") -> Optional[str]:
    """Download and save profile image"""
    try:
        # Skip if image URL is empty or invalid
        if not image_url or not image_url.strip():
            return None
        
        # Fix relative URLs - add base URL if needed
        if image_url.startswith("/"):
            image_url = "https://ims.ritchennai.edu.in" + image_url
        elif not image_url.startswith(("http://", "https://")):
            image_url = "https://ims.ritchennai.edu.in/" + image_url
        
        # Create upload directory if it doesn't exist
        Path(upload_dir).mkdir(exist_ok=True)
        
        # Extract filename and add timestamp
        original_filename = image_url.split("/")[-1].split("?")[0]  # Remove query params
        base_name = original_filename.rsplit(".", 1)[0] if "." in original_filename else original_filename
        extension = "." + original_filename.rsplit(".", 1)[1] if "." in original_filename else ".jpg"
        
        timestamp = str(int(time.time() * 1000))
        filename = f"{base_name}_{timestamp}{extension}"
        filepath = Path(upload_dir) / filename
        
        # Download image
        response = await client.get(image_url, timeout=120.0)
        response.raise_for_status()
        
        # Save to file
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(response.content)
        
        return filename
        
    except Exception as e:
        print(f"Failed to download image from {image_url}: {str(e)}")
        return None
    
def get_value_by_label(soup, label_text: str) -> str:
    label = soup.find("label", string=label_text)
    if not label:
        return ""

    form_group = label.find_parent("div", class_="form-group")
    if not form_group:
        return ""

    input_el = form_group.find("input")
    return input_el.get("value", "").strip() if input_el else ""


async def extract_profile_details(
    client: httpx.AsyncClient, 
    profile_href: str, 
    username: str
) -> UserProfileResponse:
    """Extract user profile details"""
    try:
        # Fix profile href if it's relative
        if profile_href.startswith("/"):
            profile_href = "https://ims.ritchennai.edu.in" + profile_href
        elif not profile_href.startswith(("http://", "https://")):
            profile_href = "https://ims.ritchennai.edu.in/" + profile_href
        
        response = await client.get(
            profile_href,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=120.0
        )
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract role
        role = determine_role(profile_href)
        
        # Extract full name
        name_element = soup.select_one("h5.user-name")
        full_name = name_element.text.strip() if name_element else username
        
        # Extract email
        email_element = soup.select_one("input[type=email]")
        email = email_element.get("value", "").strip() if email_element else ""

        # Extract phone
        phone_element = soup.select_one("input[name=mobile_number]")
        phone = phone_element.get("value", "").strip() if phone_element else ""
        
        # Extract and download profile image
        image_element = soup.select_one("img.uploaded_img")
        image_url = image_element.get("src", "").strip() if image_element else ""
        
        avatar_filename = None
        if image_url:
            print(f"Attempting to download image from: {image_url}")
            avatar_filename = await download_image(client, image_url)
            print(f"Downloaded avatar: {avatar_filename}")

        student = None
        faculty = None

        if role == "STUDENT":
            student = {}

            register_number_element = soup.select_one("input[name=register_number]")
            register_number = register_number_element.get("value", "").strip() if register_number_element else ""

            hosteler_element = soup.select_one("input[name=hosteler]")
            hosteler = hosteler_element.get("value", "").strip() if hosteler_element else ""
            hosteler = False if hosteler.lower() == "no" else True

            lateral_entry_element = soup.select_one("input[name=late_entry]")
            lateral_entry = lateral_entry_element.get("value", "").strip() if lateral_entry_element else ""
            lateral_entry = False if lateral_entry.lower() == "no" else True
            
            dob_element = soup.select_one("input[name=dob]")
            dob = dob_element.get("value", "").strip() if dob_element else ""

            gender_element = soup.select_one("input[name=gender]")
            gender = gender_element.get("value", "").strip().upper() if gender_element else ""

            student['register_number'] = register_number
            student['hosteler'] = hosteler
            student['lateral_entry'] = lateral_entry
            student['dob'] = dob
            student['gender'] = gender

            enrollment_details_element = soup.select_one("h6.user-email")
            enrollment_details = enrollment_details_element.text.strip() if enrollment_details_element else ""

            parts = [p.strip() for p in enrollment_details.split("/")]

            if len(parts) != 5:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected enrollment format: {enrollment_details}"
                )

            batch_str, program_str, academic_year_str, semester_str, section_str = parts

            batch_start, batch_end = map(int, batch_str.split("-"))
            ay_start, ay_end = map(int, academic_year_str.split("-"))
            semester_number = int(semester_str)
            section_name = section_str.upper()

            program = program_str.strip()
            degree_level, program_name = program.split(". ", 1)
            degree_level += "."
            program_name = program_name.strip()

            student['program_name'] = program_name
            student['program_degree_level'] = degree_level
            student['batch_start_year'] = batch_start
            student['batch_end_year'] = batch_end
            student['academic_year_start'] = ay_start
            student['academic_year_end'] = ay_end
            student['semester_number'] = semester_number
            student['section_name'] = section_name

        elif role == "FACULTY":
            faculty = {}
        
            staff_code_element = soup.select_one("input[name=StaffCode]")
            staff_code = staff_code_element.get("value", "").strip() if staff_code_element else ""

            designation = get_value_by_label(soup, "Designation")
            department = get_value_by_label(soup, "Department")

            biometric_id_element = soup.select_one("input[name=BiometricID]")
            biometric_id = biometric_id_element.get("value", "").strip() if biometric_id_element else ""

            anna_university_code_element = soup.select_one("input[name=au_card_no]")
            anna_university_code = anna_university_code_element.get("value", "").strip() if anna_university_code_element else ""

            date_of_joining_element = soup.select_one("input[name=DOJ]")
            date_of_joining = date_of_joining_element.get("value", "").strip() if date_of_joining_element else ""

            dob_element = soup.select_one("input[name=dob]")
            dob = dob_element.get("value", "").strip() if dob_element else ""

            gender_element = soup.select_one("input[name=gender]")
            gender = gender_element.get("value", "").strip().upper() if gender_element else ""
        
            faculty['staff_code'] = staff_code
            faculty['designation'] = designation
            faculty['department'] = department
            faculty['biometric_id'] = biometric_id
            faculty['anna_university_code'] = anna_university_code
            faculty['date_of_joining'] = date_of_joining
            faculty['dob'] = dob
            faculty['gender'] = gender
        
        return UserProfileResponse(
            username=username,
            full_name=full_name,
            email=email,
            phone=phone,
            role=role,
            avatar_url=avatar_filename,
            profile_href=profile_href,
            student=student,
            faculty=faculty,
        )
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch profile: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse profile: {str(e)}")

def parse_faculty_subjects(html: str) -> List[Dict]:
    soup = BeautifulSoup(html, "lxml")

    table = soup.find("table")
    if not table or not table.tbody:
        raise HTTPException(status_code=500, detail="Subjects table not found")

    subjects = []

    for row in table.tbody.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) < 3:
            continue

        class_name = cols[1].get_text(strip=True)
        subject_text = cols[2].get_text(strip=True)

        # Parse class name: Program/Semester/Section
        try:
            program_raw, sem, section = class_name.rsplit("/", 2)
            semester = int(sem)
        except Exception:
            continue

        # Parse subject: Title (CODE)
        match = re.match(r"(.+?)\s*\(([^)]+)\)", subject_text)
        if not match:
            continue

        subjects.append({
            "program_raw": program_raw.strip(),
            "semester": semester,
            "section": section.strip(),
            "course_title": match.group(1).strip(),
            "course_code": match.group(2).strip(),
        })

    return subjects

def parse_student_timetable(html: str) -> List[Dict]:
    soup = BeautifulSoup(html, "lxml")
    forms = soup.select("form.period_form")

    timetable = []

    for form in forms:
        def get_input(name):
            inp = form.find("input", {"name": name})
            return inp["value"].strip() if inp else None

        day = get_input("day")
        period = get_input("period")
        subject_id = get_input("subject_id")
        staff_id = get_input("user_name_id")

        if not day or not period or not subject_id:
            continue

        bolds = form.find_all("b", class_="text-primary")
        if len(bolds) < 2:
            continue

        subject_text = bolds[0].get_text(strip=True)
        staff_text = bolds[1].get_text(strip=True)

        subject_name, subject_code = extract_name_code(subject_text)
        staff_name, staff_code = extract_name_code(staff_text)

        timetable.append({
            "day": day.lower(),
            "period": int(period),
            "subject_id": int(subject_id),
            "subject_name": subject_name,
            "subject_code": subject_code,
            "staff_id": int(staff_id) if staff_id else None,
            "staff_name": staff_name,
            "staff_code": staff_code,
        })

    return timetable

def normalize_timetable(entries: List[Dict]) -> List[Dict]:
    slots: Dict[Tuple[str, int], Dict] = OrderedDict()

    for e in entries:
        key = (e["day"], e["period"])

        if key not in slots:
            # first (primary) subject
            slots[key] = {
                "day": e["day"],
                "period": e["period"],
                "subject_code": e["subject_code"],
                "staff_code": e["staff_code"],
            }
        else:
            # second subject → alt
            slot = slots[key]

            # guard: do not overwrite if alt already exists
            if "alt" in slot:
                continue  # ignore 3rd+ entries (rare, but safe)

            slot["alt"] = {}

            slot["alt"].update({
                "subject_code": e["subject_code"],
                "staff_code": e["staff_code"],
            })

    return list(slots.values())


@app.post("/auth/scrape-login", response_model=UserProfileResponse)
async def scrape_login(request: LoginRequest):
    """
    Authenticate user by scraping the portal and return profile data
    """
    username = request.username.upper()
    
    # Create HTTP client with cookie handling
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=120.0,
        cookies=httpx.Cookies()
    ) as client:
        
        # Step 1: Fetch CSRF token from login page
        csrf_token = await fetch_csrf_token(client, PORTAL_LOGIN_URL)
        
        # Step 2: Perform login
        login_success = await perform_login(client, username, request.password, csrf_token)
        
        if not login_success:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Step 3: Fetch home page
        home_soup = await fetch_home_page(client)
        
        # Step 4: Extract profile URL
        profile_href = extract_profile_href(home_soup)
        
        # Step 5: Fetch and parse profile details
        user_profile = await extract_profile_details(client, profile_href, username)
        
        return user_profile
    
@app.post("/faculty/subjects")
async def scrape_faculty_subjects(request: LoginRequest):
    """
    Scrape faculty 'My Subjects' page and return teaching assignments
    """
    username = request.username.upper()

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=120.0,
        cookies=httpx.Cookies()
    ) as client:

        # 1️⃣ Login
        csrf_token = await fetch_csrf_token(client, PORTAL_LOGIN_URL)
        login_success = await perform_login(client, username, request.password, csrf_token)

        if not login_success:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 2️⃣ Fetch subjects page
        response = await client.get(
            FACULTY_SUBJECTS_URL,
            headers={"User-Agent": "Mozilla/5.0"}
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Failed to load faculty subjects page"
            )

        # 3️⃣ Parse subjects
        subjects = parse_faculty_subjects(response.text)

        if not subjects:
            return {"subjects": []}

        return {"subjects": subjects}


@app.post("/auth/debug-scrape")
async def debug_scrape(request: LoginRequest):
    """Debug endpoint to see scraped data without downloading images"""
    username = request.username.upper()
    
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=120.0,
        cookies=httpx.Cookies()
    ) as client:
        csrf_token = await fetch_csrf_token(client, PORTAL_LOGIN_URL)
        login_success = await perform_login(client, username, request.password, csrf_token)
        
        if not login_success:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        home_soup = await fetch_home_page(client)
        profile_href = extract_profile_href(home_soup)
        
        # Fetch profile page
        response = await client.get(profile_href, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract image URL
        image_element = soup.select_one("img.uploaded_img")
        image_url = image_element.get("src", "") if image_element else "NOT FOUND"
        
        return {
            "profile_href": profile_href,
            "image_url": image_url,
            "image_url_fixed": (
                "https://ims.ritchennai.edu.in" + image_url 
                if image_url.startswith("/") 
                else image_url
            )
        }
    
@app.post("/student/timetable")
async def scrape_student_timetable(request: LoginRequest):
    """
    Scrape student timetable
    """
    username = request.username.upper()

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=120.0,
        cookies=httpx.Cookies()
    ) as client:

        # 1️⃣ Login
        csrf_token = await fetch_csrf_token(client, PORTAL_LOGIN_URL)
        login_success = await perform_login(client, username, request.password, csrf_token)

        if not login_success:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 2️⃣ Fetch timetable page
        response = await client.get(
            STUDENT_TIMETABLE_URL,
            headers={"User-Agent": "Mozilla/5.0"}
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Failed to load timetable page"
            )

        # 3️⃣ Parse timetable
        timetable = parse_student_timetable(response.text)
        n_timetable = normalize_timetable(timetable)

        return {
            "entries": n_timetable
        }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "portal-scraper"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run('main:app', host="0.0.0.0", port=5000, reload=True)