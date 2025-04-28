# CIS4592-TEAM9 – Project File‑Map & Architectural Guide

A file‑by‑file description of the Django + React code‑base and how each part fits together.

---

## 1  Repository Layout

| Path | Purpose |
|------|---------|
| `/backend/` | Django 5.1 project (“backend”). |
| `/frontend/` | React application (Create‑React‑App scaffold). |
| `/venv/` | Python virtual environment (local, not committed). |

---

## 2  Django Project — `backend/`

### 2.1  Core package `backend/backend/`

| File | Responsibility | Referenced by |
|------|---------------|--------------|
| **`settings.py`** | Global config: DB, secret key, CORS, DRF, custom user (`AUTH_USER_MODEL = "base.MyUser"`). | Imported automatically by Django; read indirectly everywhere. |
| **`urls.py`** | Root router; mounts `/admin/` and `/api/`. | Django request dispatcher. |
| **`asgi.py`** | Exposes `application` for async servers (Daphne, Uvicorn). | ASGI process managers. |
| **`wsgi.py`** | Same for WSGI servers (Gunicorn, mod_wsgi). | `runserver` in dev or prod WSGI hosts. |

### 2.2  CLI helper

| File | Responsibility |
|------|---------------|
| **`manage.py`** | Entry‑point for `migrate`, `test`, `runserver`, etc. |

---

## 3  Django App — `backend/base/`

| File | Role | Key connections |
|------|------|----------------|
| **`apps.py`** | Declares `BaseConfig`; enables signal discovery. | Auto‑loaded via `INSTALLED_APPS`. |
| **`models.py`** | Defines `MyUser`, `Organization`, `Post`, `orgPost`, `Event`, `Job`, etc. | Used by serializers, views, admin, tests. |
| **`admin.py`** | Registers models with Django admin; adds list filters. | Loaded when `/admin/` is visited. |
| **`authenticate.py`** | `CookiesAuthentication` – pulls JWT from `access_token` cookie. | Listed in DRF settings. |
| **`throttling.py`** | Custom DRF throttles (`LoginThrottle`, `TokenRefreshRateThrottle`, `OrganizationJoinThrottle`). | Referenced in DRF settings; unit‑tested. |
| **`serializers.py`** | ORM ↔ JSON marshaling for all domain objects. | Called by every API view. |
| **`views.py`** | Business logic: registration, auth, follow/like, org, jobs, events. | Routed by *base/urls.py*. |
| **`urls.py`** | Declares ~30 `/api/` routes. | Included by project router. |
| **`tests.py`** | Unit & API tests hitting every model and throttle. | Executed via `manage.py test`. |

**Request flow:**  
`/api/login/` → *views.py* `CustomTokenObtainPairView` → sets cookies → later requests pass through `CookiesAuthentication` → throttles → controller → serializers → DB.

---

## 4  Runtime Entry‑Points

| Protocol | Entry file | Used when |
|----------|-----------|-----------|
| WSGI | `backend/backend/wsgi.py` | Dev `runserver` or Gunicorn. |
| ASGI | `backend/backend/asgi.py` | Uvicorn/Daphne, WebSocket deployments. |

---

## 5  React Front‑End — `frontend/public/src/`

* `api/` – Fetch helpers (`credentials:"include"`).  
* `components/` – UI widgets (PostCard, OrgCard, JobForm…).  
* `context/` – React Contexts (auth, organisations).  
* `routes/` – React‑Router config.  
* `_tests_/` – Jest + RTL suites.

All XHR calls hit `/api/**`; authentication relies on the cookies issued by Django.

---

## 6  Virtual Environment

Activate with:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 7  Boot Sequence

1. **Backend** – `python manage.py runserver` loads settings and mounts *base* app.  
2. **Frontend** – `npm start` serves React on `localhost:3000`; API on `localhost:8000/api/`.  
3. **Auth** – `/api/login/` sets `access_token` & `refresh_token` cookies handled by `CookiesAuthentication`.  
4. **Persistence** – Views call ORM, serializers return JSON, React updates UI.

---

## 8  Why this map?

* **On‑boarding** – trace any feature front‑to‑back in minutes.  
* **DevOps** – know whether to reference ASGI or WSGI application in deployment.  
* **Security & QA** – see exactly where JWTs are consumed and throttles enforced.  
