"""Production-oriented settings used by ``wsgi.py`` / ``asgi.py`` inside Docker."""

from .base import *  # noqa: F401,F403

DEBUG = False

# Serve collected static files (Django Admin CSS/JS) from the app container.
_whitenoise_middleware = "whitenoise.middleware.WhiteNoiseMiddleware"
if _whitenoise_middleware not in MIDDLEWARE:  # noqa: F405
    security_index = MIDDLEWARE.index("django.middleware.security.SecurityMiddleware")  # noqa: F405
    MIDDLEWARE.insert(security_index + 1, _whitenoise_middleware)  # noqa: F405

SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

SESSION_COOKIE_SECURE = env.bool("DJANGO_SESSION_COOKIE_SECURE", default=False)  # noqa: F405
CSRF_COOKIE_SECURE = env.bool("DJANGO_CSRF_COOKIE_SECURE", default=False)

# The CMS frontend (Vercel) and this API (Render) live on different sites, so the
# session/CSRF cookies must be sent on cross-site XHR. Set these to "None" in
# production (which requires Secure=True). Defaults to "Lax" for same-site setups.
SESSION_COOKIE_SAMESITE = env.str("DJANGO_SESSION_COOKIE_SAMESITE", default="Lax")  # noqa: F405
CSRF_COOKIE_SAMESITE = env.str("DJANGO_CSRF_COOKIE_SAMESITE", default="Lax")  # noqa: F405
# The SPA reads the CSRF token from the cookie to echo it in X-CSRFToken, so the
# CSRF cookie must not be HttpOnly.
CSRF_COOKIE_HTTPONLY = False

if env.bool("DJANGO_USE_SECURE_PROXY_HEADERS", default=False):  # noqa: F405
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=False)
else:
    SECURE_SSL_REDIRECT = False

SECURE_REDIRECT_EXEMPT = [
    # Health checks placed behind proxies without TLS terminated at Django can exempt paths here later.
]
