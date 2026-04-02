package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.dto.*;
import com.topoship.avinestbackend.dto.grades.ScrapedGrade;
import com.topoship.avinestbackend.dto.grades.ScrapedSemesterGrades;
import com.topoship.avinestbackend.dto.marks.*;
import com.topoship.avinestbackend.dto.timetable.CourseSlot;
import com.topoship.avinestbackend.dto.timetable.DayTimetable;
import com.topoship.avinestbackend.dto.timetable.PeriodTimetable;
import com.topoship.avinestbackend.dto.timetable.SectionTimetableResponse;
import com.topoship.jooq.generated.tables.records.StudentsRecord;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.*;

import static com.topoship.jooq.generated.tables.AppUsers.APP_USERS;
import static com.topoship.jooq.generated.tables.Course.COURSE;
import static com.topoship.jooq.generated.tables.CourseOffering.COURSE_OFFERING;
import static com.topoship.jooq.generated.tables.Faculty.FACULTY;
import static com.topoship.jooq.generated.tables.GradeScale.GRADE_SCALE;
import static com.topoship.jooq.generated.tables.Semesters.SEMESTERS;
import static com.topoship.jooq.generated.tables.Students.STUDENTS;
import static com.topoship.jooq.generated.tables.StudentCatMarks.STUDENT_CAT_MARKS;
import static com.topoship.jooq.generated.tables.StudentAssignmentMarks.STUDENT_ASSIGNMENT_MARKS;
import static com.topoship.jooq.generated.tables.StudentLabMarks.STUDENT_LAB_MARKS;
import static com.topoship.jooq.generated.tables.StudentGrades.STUDENT_GRADES;
import static com.topoship.jooq.generated.tables.Timetable.TIMETABLE;

@Service
public class StudentService {

    private final DSLContext dsl;
    private final RestClient restClient;

    public StudentService(
        DSLContext dsl,
        RestClient.Builder restClientBuilder,
        @Value("${python.service.url}") String pythonServiceUrl
    ) {
        this.dsl = dsl;
        this.restClient = restClientBuilder.baseUrl(pythonServiceUrl).build();
    }

    public Optional<StudentsRecord> findOneById(Long userId) {
        return dsl.
                selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOptional();
    }

    public void syncTimetable(Long userId, String password) {
        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        var scraped = restClient.post()
                .uri("/student/timetable")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "username", student.getRegisterNumber(),
                        "password", password
                ))
                .retrieve()
                .body(ScrapedStudentTimetables.class);

        if (scraped == null || scraped.entries().isEmpty()) {
            return;
        }

        Long sectionId = student.getCurrentSectionId();

        for (ScrapedStudentTimetable s : scraped.entries()) {
            Long courseOfferingId = resolveCourseOfferingId(sectionId, s.subjectCode(), s.staffCode());
            Long courseOfferingAltId = s.alt() == null ? null :
                    resolveCourseOfferingId(sectionId, s.alt().subjectCode(), s.alt().staffCode());
            String day = DayNormalizer.normalize(s.day());

            if (courseOfferingId == null) continue;

            dsl.insertInto(TIMETABLE)
                    .set(TIMETABLE.SECTION_ID, sectionId)
                    .set(TIMETABLE.COURSE_OFFERING_ID, courseOfferingId)
                    .set(TIMETABLE.COURSE_OFFERING_ALT_ID, courseOfferingAltId)
                    .set(TIMETABLE.DAY, day)
                    .set(TIMETABLE.PERIOD_NUMBER, s.period().shortValue())
                    .onConflict(TIMETABLE.SECTION_ID, TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
                    .doUpdate()
                    .set(TIMETABLE.COURSE_OFFERING_ID, courseOfferingId)
                    .set(TIMETABLE.COURSE_OFFERING_ALT_ID, courseOfferingAltId)
                    .execute();
        }
    }

    public void syncMarks(Long userId, String password) {

        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        var scraped = restClient.post()
                .uri("/student/marks")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "username", student.getRegisterNumber(),
                        "password", password
                ))
                .retrieve()
                .body(ScrapedStudentMarks.class);

        if (scraped == null || scraped.cat() == null || scraped.cat().isEmpty()) {
            return;
        }

        Long studentId = student.getId();
        Long sectionId = student.getCurrentSectionId();

        Map<String, Long> offeringMap = resolveCourseOfferings(sectionId);


        for (var entry : scraped.cat().entrySet()) {

            String subjectCode = entry.getKey();
            Map<String, Short> cos = entry.getValue();

            Long courseOfferingId = offeringMap.get(subjectCode);
            if (courseOfferingId == null) continue;

            dsl.insertInto(STUDENT_CAT_MARKS)
                    .set(STUDENT_CAT_MARKS.STUDENT_ID, studentId)
                    .set(STUDENT_CAT_MARKS.COURSE_OFFERING_ID, courseOfferingId)
                    .set(STUDENT_CAT_MARKS.CO1, cos.get("co1"))
                    .set(STUDENT_CAT_MARKS.CO2, cos.get("co2"))
                    .set(STUDENT_CAT_MARKS.CO3, cos.get("co3"))
                    .set(STUDENT_CAT_MARKS.CO4, cos.get("co4"))
                    .set(STUDENT_CAT_MARKS.CO5, cos.get("co5"))
                    .onConflict(
                            STUDENT_CAT_MARKS.STUDENT_ID,
                            STUDENT_CAT_MARKS.COURSE_OFFERING_ID
                    )
                    .doUpdate()
                    .set(STUDENT_CAT_MARKS.CO1, cos.get("co1"))
                    .set(STUDENT_CAT_MARKS.CO2, cos.get("co2"))
                    .set(STUDENT_CAT_MARKS.CO3, cos.get("co3"))
                    .set(STUDENT_CAT_MARKS.CO4, cos.get("co4"))
                    .set(STUDENT_CAT_MARKS.CO5, cos.get("co5"))
                    .execute();
        }
    }

    public void syncGrades(Long userId, String password) {

        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        var scraped = restClient.post()
                .uri("/student/grades")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "username", student.getRegisterNumber(),
                        "password", password
                ))
                .retrieve()
                .body(new ParameterizedTypeReference<List<ScrapedSemesterGrades>>() {
                });

        if (scraped == null || scraped.isEmpty()) {
            return;
        }

        Long studentId = student.getId();
        Map<String, Long> courseMap = resolveCourses();
        Map<Integer, Long> semesterMap = resolveSemesters();

        for (ScrapedSemesterGrades sem : scraped) {

            Long semesterId = semesterMap.get(sem.semester());
            if (semesterId == null) continue;

            for (ScrapedGrade g : sem.grades()) {

                Long courseId = courseMap.get(g.courseCode());
                if (courseId == null) {
                    System.out.println("===Course Missing: " + g.courseCode());
                    continue;
                }

                dsl.insertInto(STUDENT_GRADES)
                        .set(STUDENT_GRADES.STUDENT_ID, studentId)
                        .set(STUDENT_GRADES.COURSE_ID, courseId)
                        .set(STUDENT_GRADES.SEMESTER_ID, semesterId)
                        .set(STUDENT_GRADES.GRADE, g.grade())
                        .set(STUDENT_GRADES.RESULT, g.result())
                        .onConflict(
                                STUDENT_GRADES.STUDENT_ID,
                                STUDENT_GRADES.COURSE_ID,
                                STUDENT_GRADES.SEMESTER_ID
                        )
                        .doUpdate()
                        .set(STUDENT_GRADES.GRADE, g.grade())
                        .set(STUDENT_GRADES.RESULT, g.result())
                        .execute();
            }
        }
    }

    public StudentMarksResponse getMarks(Long userId) {

        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        Long studentId = student.getId();
        Long sectionId = student.getCurrentSectionId();

        List<? extends Record> records = fetchRawMarks(studentId, sectionId);
        return buildMarksResponse(records);
    }
    public SectionTimetableResponse getTimetable(Long userId) {
        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        Long sectionId = student.getCurrentSectionId();

        List<? extends Record> records = fetchRawTimetable(sectionId);

        return buildTimetableResponse(sectionId, records);
    }
    public StudentGradebookResponse getGrades(Long userId) {

        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        List<? extends Record> records = fetchGrades(student.getId());

        return buildGradebookResponse(records);
    }

    private List<? extends Record> fetchRawTimetable(Long sectionId) {
        var CO_ALT = COURSE_OFFERING.as("co_alt");
        var COURSE_ALT = COURSE.as("course_alt");
        var FACULTY_ALT = FACULTY.as("faculty_alt");
        var APP_USERS_ALT = APP_USERS.as("app_users_alt");

        return dsl.select(
                        TIMETABLE.DAY,
                        TIMETABLE.PERIOD_NUMBER,

                        COURSE.CODE,
                        COURSE.TITLE,
                        COURSE.NATURE,

                        APP_USERS.FULL_NAME,
                        FACULTY.STAFF_CODE,

                        COURSE_ALT.CODE.as("alt_code"),
                        COURSE_ALT.TITLE.as("alt_title"),
                        COURSE_ALT.NATURE.as("alt_nature"),

                        APP_USERS_ALT.FULL_NAME.as("alt_faculty_name"),
                        FACULTY_ALT.STAFF_CODE.as("alt_faculty_code")
                )
                .from(TIMETABLE)
                .join(COURSE_OFFERING).on(COURSE_OFFERING.ID.eq(TIMETABLE.COURSE_OFFERING_ID))
                .join(COURSE).on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
                .join(FACULTY).on(FACULTY.ID.eq(COURSE_OFFERING.FACULTY_ID))
                .join(APP_USERS).on(APP_USERS.ID.eq(FACULTY.USER_ID))
                .leftJoin(CO_ALT)
                .on(CO_ALT.ID.eq(TIMETABLE.COURSE_OFFERING_ALT_ID))
                .leftJoin(COURSE_ALT)
                .on(COURSE_ALT.ID.eq(CO_ALT.COURSE_ID))
                .leftJoin(FACULTY_ALT)
                .on(FACULTY_ALT.ID.eq(CO_ALT.FACULTY_ID))
                .leftJoin(APP_USERS_ALT)
                .on(APP_USERS_ALT.ID.eq(FACULTY_ALT.USER_ID))

                .where(TIMETABLE.SECTION_ID.eq(sectionId))
                .orderBy(TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
                .fetch();
    }
    private SectionTimetableResponse buildTimetableResponse(Long sectionId, List<? extends Record> records) {
        Map<String, List<PeriodTimetable>> byDay = new LinkedHashMap<>();
        for (Record r : records) {
            String day = r.get(TIMETABLE.DAY);
            short period = r.get(TIMETABLE.PERIOD_NUMBER);

            CourseSlot primary = new CourseSlot(
                    r.get(COURSE.CODE),
                    r.get(COURSE.TITLE),
                    r.get(COURSE.NATURE),
                    r.get(APP_USERS.FULL_NAME),
                    r.get(FACULTY.STAFF_CODE)
            );

            CourseSlot alt = null;
            if (r.get("alt_code") != null) {
                alt = new CourseSlot(
                        r.get("alt_code", String.class),
                        r.get("alt_title", String.class),
                        r.get("alt_nature", String.class),
                        r.get("alt_faculty_name", String.class),
                        r.get("alt_faculty_code", String.class)
                );
            }

            PeriodTimetable periodSlot =
                    new PeriodTimetable(period, primary, alt);

            byDay.computeIfAbsent(day, d -> new ArrayList<>())
                    .add(periodSlot);
        }

        List<DayTimetable> days = byDay.entrySet().stream()
                .map(e -> new DayTimetable(e.getKey(), e.getValue()))
                .toList();

        return new SectionTimetableResponse(sectionId, days);
    }
    private Long resolveCourseOfferingId(Long sectionId, String subjectCode, String staffCode) {
        Long courseId = dsl.select(COURSE.ID).from(COURSE)
                .where(COURSE.CODE.eq(subjectCode))
                .fetchOneInto(Long.class);

        Long facultyId = dsl.select(FACULTY.ID).from(FACULTY)
                .where(FACULTY.STAFF_CODE.eq(staffCode))
                .fetchOneInto(Long.class);

        if (courseId == null || facultyId == null) {
            return null;
        }

        return dsl.select(COURSE_OFFERING.ID).from(COURSE_OFFERING)
                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .and(COURSE_OFFERING.COURSE_ID.eq(courseId))
                .and(COURSE_OFFERING.FACULTY_ID.eq(facultyId))
                .fetchOneInto(Long.class);
    }
    public List<EnrolledCoursesDto> getEnrolledCourses(Long sectionId) {
        return dsl.select(
            COURSE.CODE,
            COURSE.TITLE,
            COURSE.NATURE,
            COURSE.CREDITS
        )
                .from(COURSE_OFFERING)
                .join(COURSE).on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .fetch(record -> new EnrolledCoursesDto(
                        record.get(COURSE.CODE),
                        record.get(COURSE.TITLE),
                        record.get(COURSE.NATURE),
                        record.get(COURSE.CREDITS)
                ));
    }

    private List<? extends Record> fetchRawMarks(Long studentId, Long sectionId) {

        return dsl.select(
                        COURSE.CODE,
                        COURSE.TITLE,
                        COURSE.NATURE,
                        COURSE_OFFERING.ID.as("co_id"),

                        // CAT
                        STUDENT_CAT_MARKS.CO1,
                        STUDENT_CAT_MARKS.CO2,
                        STUDENT_CAT_MARKS.CO3,
                        STUDENT_CAT_MARKS.CO4,
                        STUDENT_CAT_MARKS.CO5,

                        // ASSIGNMENT
                        STUDENT_ASSIGNMENT_MARKS.A1,
                        STUDENT_ASSIGNMENT_MARKS.A2,
                        STUDENT_ASSIGNMENT_MARKS.A3,
                        STUDENT_ASSIGNMENT_MARKS.A4,
                        STUDENT_ASSIGNMENT_MARKS.A5,

                        // LAB (UPDATED)
                        STUDENT_LAB_MARKS.ID
//                        STUDENT_LAB_MARKS.CYCLE_TEST1,
//                        STUDENT_LAB_MARKS.CYCLE_TEST2,
//                        STUDENT_LAB_MARKS.CYCLE_TEST3,
//                        STUDENT_LAB_MARKS.FINAL_MARKS
                )
                .from(COURSE_OFFERING)
                .join(COURSE).on(COURSE_OFFERING.COURSE_ID.eq(COURSE.ID))

                .leftJoin(STUDENT_CAT_MARKS)
                .on(STUDENT_CAT_MARKS.COURSE_OFFERING_ID.eq(COURSE_OFFERING.ID)
                        .and(STUDENT_CAT_MARKS.STUDENT_ID.eq(studentId)))

                .leftJoin(STUDENT_ASSIGNMENT_MARKS)
                .on(STUDENT_ASSIGNMENT_MARKS.COURSE_OFFERING_ID.eq(COURSE_OFFERING.ID)
                        .and(STUDENT_ASSIGNMENT_MARKS.STUDENT_ID.eq(studentId)))

                .leftJoin(STUDENT_LAB_MARKS)
                .on(STUDENT_LAB_MARKS.COURSE_OFFERING_ID.eq(COURSE_OFFERING.ID)
                        .and(STUDENT_LAB_MARKS.STUDENT_ID.eq(studentId)))

                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .fetch();
    }
    private StudentMarksResponse buildMarksResponse(List<? extends Record> records) {

        List<SubjectMarksDTO> subjects = new ArrayList<>();

        for (var r : records) {

            String courseCode = r.get(COURSE.CODE);
            String courseName = r.get(COURSE.TITLE);
            String nature = r.get(COURSE.NATURE);

            // CAT
            Map<String, Short> cat = new HashMap<>();

            Short co1 = r.get(STUDENT_CAT_MARKS.CO1);
            Short co2 = r.get(STUDENT_CAT_MARKS.CO2);
            Short co3 = r.get(STUDENT_CAT_MARKS.CO3);
            Short co4 = r.get(STUDENT_CAT_MARKS.CO4);
            Short co5 = r.get(STUDENT_CAT_MARKS.CO5);

            cat.put("co1", co1);
            cat.put("co2", co2);
            cat.put("co3", co3);
            cat.put("co4", co4);
            cat.put("co5", co5);

            // Assignment
            Map<String, Short> assignment = new HashMap<>();

            Short a1 = r.get(STUDENT_ASSIGNMENT_MARKS.A1);
            Short a2 = r.get(STUDENT_ASSIGNMENT_MARKS.A2);
            Short a3 = r.get(STUDENT_ASSIGNMENT_MARKS.A3);
            Short a4 = r.get(STUDENT_ASSIGNMENT_MARKS.A4);
            Short a5 = r.get(STUDENT_ASSIGNMENT_MARKS.A5);

            assignment.put("a1", a1);
            assignment.put("a2", a2);
            assignment.put("a3", a3);
            assignment.put("a4", a4);
            assignment.put("a5", a5);

            // LAB
            Map<String, Integer> lab = new HashMap<>();

            Short cycle1 = r.get(STUDENT_ASSIGNMENT_MARKS.A1);
            Short cycle2 = r.get(STUDENT_ASSIGNMENT_MARKS.A2);
            Short cycle3 = r.get(STUDENT_ASSIGNMENT_MARKS.A3);

            assignment.put("cycle1", cycle1);
            assignment.put("cycle2", cycle2);
            assignment.put("cycle3", cycle3);


            subjects.add(new SubjectMarksDTO(
                    courseCode,
                    courseName,
                    nature,
                    cat,
                    assignment,
                    lab
            ));
        }

        return new StudentMarksResponse(subjects);
    }
    private Map<String, Long> resolveCourseOfferings(Long sectionId) {
        return dsl.select(COURSE.CODE, COURSE_OFFERING.ID)
                .from(COURSE_OFFERING)
                .join(COURSE).on(COURSE_OFFERING.COURSE_ID.eq(COURSE.ID))
                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .fetchMap(COURSE.CODE, COURSE_OFFERING.ID);
    }

    private List<? extends Record> fetchGrades(Long studentId) {
        return dsl.select(
                        STUDENT_GRADES.SEMESTER_ID,
                        SEMESTERS.NUMBER.as("sem_no"),

                        COURSE.ID,
                        COURSE.CODE,
                        COURSE.TITLE,
                        COURSE.CREDITS,

                        STUDENT_GRADES.GRADE,
                        GRADE_SCALE.POINTS,
                        STUDENT_GRADES.RESULT
                )
                .from(STUDENT_GRADES)
                .join(COURSE).on(STUDENT_GRADES.COURSE_ID.eq(COURSE.ID))
                .join(GRADE_SCALE).on(STUDENT_GRADES.GRADE.eq(GRADE_SCALE.GRADE))
                .join(SEMESTERS).on(STUDENT_GRADES.SEMESTER_ID.eq(SEMESTERS.ID))
                .where(STUDENT_GRADES.STUDENT_ID.eq(studentId))
                .orderBy(SEMESTERS.NUMBER.asc())
                .fetch();
    }
    private StudentGradebookResponse buildGradebookResponse(List<? extends Record> records) {

        Map<Integer, SemesterDTO> map = new LinkedHashMap<>();

        double totalScore = 0;
        int totalCredits = 0;
        int totalArrears = 0;

        for (var r : records) {

            Integer semNo = r.get("sem_no", Integer.class);

            SemesterDTO sem = map.get(semNo);

            if (sem == null) {
                sem = new SemesterDTO(semNo);
                map.put(semNo, sem);
            }

            String grade = r.get(STUDENT_GRADES.GRADE);
            String result = r.get(STUDENT_GRADES.RESULT);
            Short points = r.get(GRADE_SCALE.POINTS);
            BigDecimal credits = r.get(COURSE.CREDITS);

            // course dto
            CourseGradeDTO course = new CourseGradeDTO(
                    r.get(COURSE.ID),
                    r.get(COURSE.CODE),
                    r.get(COURSE.TITLE),
                    credits,
                    grade,
                    points,
                    result
            );

            sem.courses.add(course);
            sem.score += points * credits.intValueExact();
            sem.credits += credits.intValueExact();

            totalScore += points * credits.intValueExact();
            totalCredits += credits.intValueExact();

            if (result.equals("ARREAR")) {
                sem.arrears++;
                totalArrears++;

            }
        }

        // compute GPA per semester
        for (SemesterDTO sem : map.values()) {
            if (sem.credits > 0) {
                sem.gpa = round((double) sem.score / sem.credits, 2);
            }
        }

        double cgpa = totalCredits == 0 ? 0 : round(totalScore / totalCredits, 2);

        return new StudentGradebookResponse(
                cgpa,
                totalArrears,
                new ArrayList<>(map.values())
        );
    }
    private double round(double value, int scale) {
        return Math.round(value * Math.pow(10, scale)) / Math.pow(10, scale);
    }
    private Map<String, Long> resolveCourses() {

        return dsl.select(COURSE.CODE, COURSE.ID)
                .from(COURSE)
                .fetchMap(COURSE.CODE, COURSE.ID);
    }
    private Map<Integer, Long> resolveSemesters() {

        return dsl.select(SEMESTERS.NUMBER, SEMESTERS.ID)
                .from(SEMESTERS)
                .fetchMap(SEMESTERS.NUMBER, SEMESTERS.ID);
    }


    //    public TimetableResponseDto getStudentTimetable(Long studentId) {
//
//        Long sectionId = dsl
//                .select(STUDENTS.CURRENT_SECTION_ID)
//                .from(STUDENTS)
//                .where(STUDENTS.USER_ID.eq(studentId))
//                .fetchOneInto(Long.class);
//
//        var records = dsl
//                .select(
//                        TIMETABLE.DAY,
//                        TIMETABLE.PERIOD_NUMBER,
//
//                        COURSE.TITLE,
//                        COURSE.CODE,
//
//                        COURSE.TITLE.as("alt_title"),
//                        COURSE.CODE.as("alt_code"),
//
//                        PROGRAMS.DEGREE_LEVEL,
//                        PROGRAMS.NAME,
//                        SEMESTERS.NUMBER,
//                        SECTIONS.NAME
//                )
//                .from(TIMETABLE)
//                .join(COURSE_OFFERING)
//                .on(COURSE_OFFERING.ID.eq(TIMETABLE.COURSE_OFFERING_ID))
//                .join(COURSE)
//                .on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
//                .leftJoin(COURSE_OFFERING.as("co_alt"))
//                .on(DSL.field("co_alt.id", Long.class)
//                        .eq(TIMETABLE.COURSE_OFFERING_ALT_ID))
//                .leftJoin(COURSE.as("course_alt"))
//                .on(DSL.field("course_alt.id", Long.class)
//                        .eq(DSL.field("co_alt.course_id", Long.class)))
//                .join(SECTIONS)
//                .on(SECTIONS.ID.eq(TIMETABLE.SECTION_ID))
//                .join(PROGRAMS)
//                .on(PROGRAMS.ID.eq(SECTIONS.PROGRAM_ID))
//                .join(SEMESTERS)
//                .on(SEMESTERS.ID.eq(SECTIONS.SEMESTER_ID))
//                .where(TIMETABLE.SECTION_ID.eq(sectionId))
//                .orderBy(TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
//                .fetch();
//
//        String sectionLabel = records.isEmpty()
//                ? ""
//                : records.get(0).get(PROGRAMS.DEGREE_LEVEL)
//                + " " + records.get(0).get(PROGRAMS.NAME)
//                + "/" + records.get(0).get(SEMESTERS.NUMBER)
//                + "/" + records.get(0).get(SECTIONS.NAME);
//
//        List<TimetableSlotDto> slots = records.stream()
//                .map(r -> new TimetableSlotDto(
//                        r.get(TIMETABLE.DAY).name(),
//                        r.get(TIMETABLE.PERIOD_NUMBER),
//                        new TimetableCourseDto(
//                                r.get(COURSE.TITLE),
//                                r.get(COURSE.CODE)
//                        ),
//                        r.get("alt_title") != null
//                                ? new TimetableCourseDto(
//                                r.get("alt_title", String.class),
//                                r.get("alt_code", String.class)
//                        )
//                                : null
//                ))
//                .toList();
//
//        return new TimetableResponseDto(
//                sectionLabel,
//                7,
//                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
//                slots
//        );
//    }
}
