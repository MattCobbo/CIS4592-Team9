# CIS4592-Team9
Social Networking platform - Capstone Repository for Team 9

# Sprint 3 Deliverables

# Dev Build - Backend DRF - MUST USE Django Virtual Environment
- Initialize virtual environment first in outer folder using ${pip -m venv venv}
- then launch virtual environment ${.\venv\Scripts\activate}
- Change directory to backend folder ${cd .\backend\}
- Initialize Backend database ${python manage.py makemigrations}
- Migrate Models into database ${python manage.py migrate}
- Start with superadmin for backend access and to have starter account for frontend ${python create superuser}
- Run DRF server with ${py manage.py runserver}

# Frontend
- Open second terminal
- Change to frontend folder ${cd .\frontend}
- Launch React script for local browser ${npm start build}
- Sign in to website with superadmin from backend

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
# Backend Testing
Use the Python DRF testing framework for backend test runs
 .\venv\Scripts\activate
 cd .\backend\
 python manage.py test -v 2

Model Tests:
- MyUserModelTest: Tests user creation, validation, and follower relationships
- PostModelTest: Tests post creation, likes, and timestamp functionality
- OrganizationModelTest: Tests organization creation, validation, and membership
- OrgPostModelTest: Tests organization post creation and relationships
- EventModelTest: Tests event creation, attributes, and attendance
- JobModelTest: Tests job creation and application relationships
API Endpoint Tests:
- AuthenticationTest: Tests login, registration, token refresh, and auth check
- OrganizationAPITest: Tests organization CRUD, membership, and search functionality
- PostAPITest: Tests post creation, retrieval, and like functionality
- JobAPITest: Tests job creation, application, and retrieval
- EventAPITest: Tests event creation and RSVP functionality
Serializer Tests:
- Tests for all serializers to ensure they produce correct output
- Includes serializers for users, posts, organizations, events, jobs, and applications
Throttling Tests:
- LoginThrottleTest: Tests rate limiting for login attempts

# Frontend Testing
Component Tests:
- Post: Tests rendering, like functionality, and profile data loading
- UserOrganizations: Tests organization list display and toggling
- CreateJobForm: Tests form validation and submission
- JobCard: Tests job display and owner actions
- PendingRequests: Tests request rendering and acceptance
- ApplicationsList: Tests application display and interaction
Route Tests:
- Login: Tests form rendering, input handling, and login submission
- Register: Tests form validation and registration
- JobBoard: Tests job listing, tab switching, and pagination
Context Tests:
- useAuth: Tests authentication state, login process, and path-based auth checking

# Documentation
- [Testing Documentation](./documentation/test-coverage.md)
- [Security Documentation](./documentation/security-approach.md)
- [File Mapping](./documentation/project_file_map.md)