python -m venv .venv

source .venv/bin/activate

pip install fastapi uvicorn beautifulsoup4 httpx

pip freeze > requirements.txt

pip install -r requirements.txt


uvicorn main:app --reload --port 5000
