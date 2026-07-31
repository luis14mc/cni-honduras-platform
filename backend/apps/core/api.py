"""Shared DRF utilities for localized read-only APIs."""

from django.utils import translation
from rest_framework.viewsets import GenericViewSet


def resolve_lang(request) -> str:
    lang = request.query_params.get("lang", "es")
    return lang if lang in {"es", "en"} else "es"


class LocalizedViewSetMixin(GenericViewSet):
    """Activate Django translation for the request locale before serialization."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        translation.activate(resolve_lang(request))
