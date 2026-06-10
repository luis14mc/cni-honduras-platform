"""API v1 aggregator.

Espacio de nombres versionado bajo ``/api/v1/`` que agrupa los routers de cada
app de dominio. Las rutas legacy ``/api/cms/`` y ``/api/geo/`` se mantienen
intactas en ``config/urls.py``; aquí se exponen las mismas (y nuevas) bajo v1.
"""

from django.urls import include, path

app_name = "api-v1"

urlpatterns = [
    path("cms/", include("apps.cms.api_urls")),
    path("geo/", include("apps.geo.api_urls")),
    path("investment/", include("apps.investment.api_urls")),
    path("forms/", include("apps.forms.api_urls")),
    path("integrations/", include("apps.integrations.api_urls")),
]
