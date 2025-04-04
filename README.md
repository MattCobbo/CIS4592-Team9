# CIS4592-Team9
Social Networking platform - Capstone Repository for Team 9

# Sprint 2 Deliverables
- Recording link :: https://drive.google.com/file/d/1BeO43CNx0qrEPNe_5tcndLyF72eify_S/view?usp=sharing

# Dev Build - Backend DRF - MUST USE Django Virtual Environment
- Initialize virtual environment first in outer folder using ${pip -m venv venv}
- then launch virtual environment ${.\venv\Scripts\activate}
- Change directory to backend folder ${cd .\backend\} 
- Run DRF server with ${py manage.py runserver}

# Frontend
- Open second terminal
- Change to frontend folder ${cd .\frontend\}
- Launch React script for local browser ${npm start build}

# DRF Admin Panel
Use admin credentials - (Username:admin, Password:admin)
- Initial login  ::   /api/token/
- Admin overview ::   /admin
- View user data ::   /api/user_data/<username>/
- View posts     ::   /api/posts/<username>/

# Dependencies
These dependencies are required for the backend virtual environment
- pip install django
- pip install djangorestframework
- pip install django-cors-headers
- pip install djangorestframework-simplejwt
- pip install Pillow

# Testing
Run the "cd .\backend\" command into the backend and then run the "python manage.py test" 
command which will run automated tests of the backend.

# Documentation
- [Testing Documentation](./documentation/test-coverage.txt)
- [Security Documentation](./documentation/security-approach.txt)