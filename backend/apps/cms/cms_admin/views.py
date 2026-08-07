"""CMS-admin views: session auth, identity, and dashboard.

Authentication model: Django session + HttpOnly cookie + CSRF. No tokens are
issued and no passwords are ever returned or logged. Access is limited to
``is_active`` staff users.
"""

from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.cms.models import Document, News, PublishStatus, SiteBanner
from apps.investment.models import (
    InvestmentOpportunity,
    OpportunityStatus,
    Sector,
    SuccessStory,
)

from .permissions import IsCMSStaff
from .serializers import CMSUserSerializer, LoginSerializer


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
                "recent_activity": self._recent_activity(),
                "generated_at": timezone.now().isoformat(),
            }
        )

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

        events.sort(key=lambda e: e["updated_at"], reverse=True)
        return events[:10]
