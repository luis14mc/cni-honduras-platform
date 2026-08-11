"""CMS-admin views: session auth, identity, and dashboard.

Authentication model: Django session + HttpOnly cookie + CSRF. No tokens are
issued and no passwords are ever returned or logged. Access is limited to
``is_active`` staff users.
"""

from __future__ import annotations

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db.models import Q
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.cms.models import Document, InstitutionalLink, News, Page, PublishStatus, SiteBanner
from apps.investment.models import (
    InvestmentOpportunity,
    OpportunityStatus,
    Sector,
    SuccessStory,
)

from .permissions import IsCMSStaff
from .serializers import CMSUserSerializer, LoginSerializer

User = get_user_model()

SEARCH_LIMIT = 5


@method_decorator(ensure_csrf_cookie, name="get")
class CSRFView(APIView):
    """Set the CSRF cookie and return the token for cross-origin SPAs.

    The browser stores the cookie on the API host; the SPA reads ``csrfToken``
    from this JSON body (not ``document.cookie``) and sends it as
    ``X-CSRFToken`` on unsafe requests. Public by design — no identity data.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


@method_decorator(csrf_protect, name="post")
class LoginView(APIView):
    """Authenticate a staff user and open a Django session.

    Rejects non-staff / inactive users with 403 without opening a session.
    Rate limited by the ``cms_login`` scope to blunt credential stuffing.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "cms_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=username, password=password)
        if user is None:
            # Same message for unknown user and bad password (no enumeration).
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not (user.is_active and user.is_staff):
            return Response(
                {"detail": "Esta cuenta no tiene acceso al CMS."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        return Response(CMSUserSerializer(user).data)


@method_decorator(csrf_protect, name="post")
class LogoutView(APIView):
    """Terminate the current session."""

    permission_classes = [IsCMSStaff]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """Return the authenticated staff user's identity and permissions."""

    permission_classes = [IsCMSStaff]

    def get(self, request):
        return Response(CMSUserSerializer(request.user).data)


class DashboardView(APIView):
    """Real content counts and recent editorial activity for the dashboard."""

    permission_classes = [IsCMSStaff]

    def get(self, request):
        published = PublishStatus.PUBLISHED
        draft = PublishStatus.DRAFT

        def split(model):
            qs = model.all_objects.all()
            return {
                "total": qs.count(),
                "published": qs.filter(status=published).count(),
                "draft": qs.filter(status=draft).count(),
            }

        counts = {
            "news": split(News),
            "documents": split(Document),
            "banners": split(SiteBanner),
            "success_stories": split(SuccessStory),
            "pages": split(Page),
            "sectors": {
                "total": Sector.objects.count(),
                "active": Sector.objects.filter(is_active=True).count(),
            },
            "opportunities": {
                "total": InvestmentOpportunity.objects.count(),
                "open": InvestmentOpportunity.objects.filter(
                    status=OpportunityStatus.OPEN
                ).count(),
            },
        }

        return Response(
            {
                "counts": counts,
                "pending": self._pending_content(),
                "recent_activity": self._recent_activity(),
                "generated_at": timezone.now().isoformat(),
            }
        )

    def _pending_content(self) -> dict:
        draft = PublishStatus.DRAFT
        editorial_models = (News, Document, SiteBanner, SuccessStory, Page)

        drafts = sum(m.all_objects.filter(status=draft).count() for m in editorial_models)

        def missing_en(model, fields: tuple[str, ...]) -> int:
            q = model.all_objects.filter(status__in=[draft, PublishStatus.PUBLISHED])
            en_q = Q()
            for field in fields:
                en_q |= Q(**{f"{field}_en": ""}) | Q(**{f"{field}_en__isnull": True})
            return q.filter(en_q).count()

        # Documents are language rows — missing EN = ES resource_key without EN sibling.
        editorial_statuses = [draft, PublishStatus.PUBLISHED]
        es_keys = set(
            Document.all_objects.filter(
                language="es", status__in=editorial_statuses
            ).values_list("resource_key", flat=True)
        )
        en_keys = set(
            Document.all_objects.filter(
                language="en", status__in=editorial_statuses
            ).values_list("resource_key", flat=True)
        )
        missing_document_en = len(es_keys - en_keys)

        missing_translation = (
            missing_en(News, ("title", "summary"))
            + missing_document_en
            + missing_en(SuccessStory, ("title", "summary"))
            + missing_en(Page, ("title", "content"))
        )

        missing_image = (
            News.all_objects.filter(status=draft, featured_image__isnull=True).count()
            + Document.all_objects.filter(status=draft, cover_image__isnull=True).count()
            + Page.all_objects.filter(status=draft, featured_image__isnull=True).count()
            + SuccessStory.all_objects.filter(status=draft, logo__isnull=True, image="").count()
        )

        documents_without_resource = Document.all_objects.filter(status=draft).filter(
            Q(file="") | Q(file__isnull=True),
        ).filter(
            Q(external_url="") | Q(external_url__isnull=True),
        ).count()

        incomplete_opportunities = InvestmentOpportunity.objects.filter(
            Q(summary="") | Q(summary__isnull=True)
            | Q(description="") | Q(description__isnull=True)
        ).count()

        return {
            "drafts": drafts,
            "missing_translation_en": missing_translation,
            "missing_image": missing_image,
            "documents_without_resource": documents_without_resource,
            "incomplete_opportunities": incomplete_opportunities,
        }

    def _recent_activity(self) -> list[dict]:
        """Derive activity from ``updated_at`` on existing models — no new table.

        Never fabricates entries; only surfaces records that actually exist.
        """

        events: list[dict] = []

        def collect(qs, kind, label_attr="title"):
            for obj in qs:
                events.append(
                    {
                        "type": kind,
                        "id": obj.id,
                        "label": getattr(obj, label_attr, str(obj)),
                        "status": getattr(obj, "status", None),
                        "updated_at": obj.updated_at.isoformat(),
                    }
                )

        collect(News.all_objects.order_by("-updated_at")[:10], "news")
        collect(Document.all_objects.order_by("-updated_at")[:10], "document")
        collect(SiteBanner.all_objects.order_by("-updated_at")[:10], "banner")
        collect(SuccessStory.all_objects.order_by("-updated_at")[:10], "success_story")
        collect(Page.all_objects.order_by("-updated_at")[:10], "page")
        for obj in Sector.objects.order_by("-updated_at")[:10]:
            events.append(
                {
                    "type": "sector",
                    "id": obj.id,
                    "label": obj.name,
                    "status": "active" if obj.is_active else "inactive",
                    "updated_at": obj.updated_at.isoformat(),
                }
            )
        for obj in InvestmentOpportunity.objects.select_related("sector").order_by("-updated_at")[:10]:
            events.append(
                {
                    "type": "opportunity",
                    "id": obj.id,
                    "label": obj.title,
                    "status": obj.status,
                    "updated_at": obj.updated_at.isoformat(),
                }
            )

        events.sort(key=lambda e: e["updated_at"], reverse=True)
        return events[:15]


class SearchView(APIView):
    """Global CMS search across editorial models."""

    permission_classes = [IsCMSStaff]

    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        empty = {
            "news": [],
            "documents": [],
            "banners": [],
            "success_stories": [],
            "sectors": [],
            "opportunities": [],
            "pages": [],
        }
        if not q:
            return Response(empty)

        def search_model(qs, fields, label_attr="title"):
            filter_q = Q()
            for field in fields:
                filter_q |= Q(**{f"{field}__icontains": q})
            results = []
            for obj in qs.filter(filter_q).order_by("-updated_at")[:SEARCH_LIMIT]:
                results.append(
                    {
                        "id": obj.id,
                        "label": getattr(obj, label_attr, str(obj)),
                        "status": getattr(obj, "status", None),
                        "updated_at": obj.updated_at.isoformat(),
                    }
                )
            return results

        return Response(
            {
                "news": search_model(
                    News.all_objects.all(),
                    ("title", "title_es", "title_en", "slug"),
                ),
                "documents": search_model(
                    Document.all_objects.all(),
                    ("title", "title_es", "title_en", "slug"),
                ),
                "banners": search_model(
                    SiteBanner.all_objects.all(),
                    ("title", "title_es", "title_en"),
                ),
                "success_stories": search_model(
                    SuccessStory.all_objects.all(),
                    ("title", "title_es", "title_en", "company_name"),
                ),
                "sectors": search_model(
                    Sector.objects.all(),
                    ("name", "name_es", "name_en", "slug"),
                    label_attr="name",
                ),
                "opportunities": search_model(
                    InvestmentOpportunity.objects.all(),
                    ("title", "slug", "summary"),
                ),
                "pages": search_model(
                    Page.all_objects.all(),
                    ("title", "title_es", "title_en", "slug"),
                ),
            }
        )
