@echo off
call venv\Scripts\activate

set FLASK_APP=run.py

cd backend
flask run
