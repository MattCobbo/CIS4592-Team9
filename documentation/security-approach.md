Django Possesses a built in security for the use of logging
and password protection. All passwords are encrypted with a hashing
algorithm before being stored.

1. Password Hashing
Password Storage: Django does not store plaintext passwords. Instead, it uses strong hashing algorithms (e.g. PBKDF2 by default) with a salt. This means that even if your database is somehow compromised, attackers cannot easily retrieve users’ actual passwords.

Algorithm Configurability: You can configure the hashing algorithm used in the PASSWORD_HASHERS setting (common choices include PBKDF2, bcrypt, Argon2, or scrypt). PBKDF2 is typically the default in a new Django project.

python
Copy
Edit
# settings.py
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    # 'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    # 'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    # 'django.contrib.auth.hashers.ScryptPasswordHasher',
]


2. Session-Based Authentication
Session Cookies: When a user logs in, Django creates a session entry in the database (or in another session store) and sends a session cookie to the browser. This cookie contains only the session ID (not the user’s password).

Cookie Security: In production, you typically set cookie flags such as HttpOnly=True, secure=True, and samesite to reduce XSS and CSRF risks.

HttpOnly=True prevents JavaScript from reading the cookie value.

secure=True ensures the cookie is only sent over HTTPS.

samesite helps mitigate some CSRF attacks by restricting cross-site sending of cookies.

python
Copy
Edit
# settings.py
SESSION_COOKIE_SECURE = True      # Only transmit session cookie over HTTPS
SESSION_COOKIE_HTTPONLY = True    # Disallow JavaScript access to the session cookie
SESSION_COOKIE_SAMESITE = 'None'  # (or 'Strict' / 'Lax' depending on your needs)


3. CSRF Protection
CSRF Tokens: Django’s default login form (and any Django form) automatically includes a CSRF token. 
This helps protect against cross-site request forgery by ensuring the request to log in must come from your site’s form, 
not a malicious third-party.

Middleware: django.middleware.csrf.CsrfViewMiddleware is enabled by default in settings.py. 
Whenever a user submits a form, Django verifies that the token is valid before proceeding.

4. Login Throttle

The LoginThrottle class is a custom throttle derived from Django REST Framework’s SimpleRateThrottle. 
It’s designed to limit how many times any user (or IP address) can attempt to log in within a specified time window.

In this specific example, all login requests share the same throttle key ("global"). 
After enough login attempts reach the configured cap, further requests are throttled and receive an HTTP 429 “Too Many Requests” response.

Why It’s Important
Brute Force Mitigation: Throttling prevents malicious actors from making unlimited login attempts to guess or brute-force a user’s password.

Resource Protection: It ensures that repeated login failures don’t exhaust server resources or create denial-of-service conditions.

How It Works
Cache Key: When a POST request is made to the login endpoint, get_cache_key returns a string ('global') appended to the throttle’s scope. 
That means all login attempts count toward the same rate limit.

Rate Limit Configuration: In settings.py, the rate limit is defined under DEFAULT_THROTTLE_RATES. 
For example, "login": "2/minute" means that only two login attempts are allowed each minute across all clients. 
After two attempts, every further attempt (within that minute) receives a 429 TOO MANY REQUESTS response.

Reset Mechanism: 
After the throttle’s time window expires (e.g., one minute), the user (or in this case, any request) can attempt to log in again without being blocked, because the cached counter resets.