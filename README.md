# CIS4592-Team9
Social Networking platform - Capstone Repository for Team 9

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