@echo off
cd /d "%~dp0"

echo Installing backend dependencies...
pip install -r requirements.txt

echo Installing frontend dependencies...
cd frontend
call npm install

echo Building frontend...
call npm run build

echo Starting combined server on http://localhost:8000 ...
cd ..
uvicorn main:app --reload
pause
