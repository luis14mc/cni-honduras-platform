from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from apps.cms.models import SiteBanner, BannerPlacement, PublishStatus
from apps.cms.viewsets import SiteBannerViewSet


class BannerWindowTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_active_banner_in_window(self):
        now = timezone.now()
        SiteBanner.objects.create(
            title="Activo",
            title_es="Activo",
            placement=BannerPlacement.SITE_TOP,
            status=PublishStatus.PUBLISHED,
            published_at=now,
            starts_at=now - timezone.timedelta(hours=1),
            ends_at=now + timezone.timedelta(hours=1),
        )
        request = self.factory.get("/api/v1/cms/banners/?placement=site_top")
        view = SiteBannerViewSet.as_view({"get": "list"})
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
