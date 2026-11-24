from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.db import DatabaseError, connection
from django.http import JsonResponse
from django.urls import include, path
from django.views.decorators.http import require_safe


@require_safe
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except DatabaseError:
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health/", health, name="health"),
    path("admin/", admin.site.urls),
    # Versioned API
    path("api/v1/", include("config.api_v1")),
    # Legacy (no eliminar): rutas existentes mantenidas por compatibilidad
    path("api/cms/", include("apps.cms.api_urls")),
    path("api/geo/", include("apps.geo.api_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
