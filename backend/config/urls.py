from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # Versioned API
    path("api/v1/", include("config.api_v1")),
    # Legacy (no eliminar): rutas existentes mantenidas por compatibilidad
    path("api/cms/", include("apps.cms.api_urls")),
    path("api/geo/", include("apps.geo.api_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
