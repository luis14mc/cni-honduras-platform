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

if env.bool("DJANGO_USE_SECURE_PROXY_HEADERS", default=False):  # noqa: F405
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=False)
else:
    SECURE_SSL_REDIRECT = False

SECURE_REDIRECT_EXEMPT = [
    # Health checks placed behind proxies without TLS terminated at Django can exempt paths here later.
]
