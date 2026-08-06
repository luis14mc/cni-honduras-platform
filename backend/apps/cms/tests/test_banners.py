from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory

from apps.cms.models import BannerPlacement, PublishStatus, SiteBanner
from apps.cms.viewsets import SiteBannerViewSet


class SiteBannerModelTests(TestCase):
    def test_valid_date_range(self):
        now = timezone.now()
        banner = SiteBanner(
            title="Rango válido",
            title_es="Rango válido",
            placement=BannerPlacement.HOME_HERO,
            starts_at=now,
            ends_at=now + timezone.timedelta(days=1),
        )
        banner.full_clean()

    def test_invalid_date_range(self):
        now = timezone.now()
        banner = SiteBanner(
            title="Rango inválido",
            title_es="Rango inválido",
            placement=BannerPlacement.HOME_HERO,
            starts_at=now + timezone.timedelta(days=1),
            ends_at=now,
        )
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def test_starts_at_without_ends_at(self):
        now = timezone.now()
        banner = SiteBanner(
            title="Solo inicio",
            title_es="Solo inicio",
            placement=BannerPlacement.SITE_TOP,
            starts_at=now - timezone.timedelta(hours=1),
        )
        banner.full_clean()

    def test_ends_at_without_starts_at(self):
        now = timezone.now()
        banner = SiteBanner(
            title="Solo fin",
            title_es="Solo fin",
            placement=BannerPlacement.SITE_TOP,
            ends_at=now + timezone.timedelta(hours=1),
        )
        banner.full_clean()

    def test_cta_label_without_url_is_invalid(self):
        banner = SiteBanner(
            title="CTA incoherente",
            title_es="CTA incoherente",
            placement=BannerPlacement.HOME_HERO,
            cta_label="Ver más",
        )
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def _banner(self, **kwargs):
        defaults = {
            "title": "Banner",
            "title_es": "Banner",
            "placement": BannerPlacement.HOME_HERO,
        }
        defaults.update(kwargs)
        return SiteBanner(**defaults)

    def test_internal_cta_valid(self):
        banner = self._banner(link_url="/es/recursos", link_external=False)
        banner.full_clean()

    def test_external_cta_valid(self):
        banner = self._banner(link_url="https://example.com/path", link_external=True)
        banner.full_clean()

    def test_internal_without_leading_slash_invalid(self):
        banner = self._banner(link_url="es/recursos", link_external=False)
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def test_protocol_relative_internal_invalid(self):
        banner = self._banner(link_url="//example.com/path", link_external=False)
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def test_javascript_scheme_invalid(self):
        banner = self._banner(link_url="javascript:alert(1)", link_external=False)
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def test_malformed_external_url_invalid(self):
        banner = self._banner(link_url="not-a-valid-url", link_external=True)
        with self.assertRaises(ValidationError):
            banner.full_clean()

    def test_external_http_scheme_valid(self):
        banner = self._banner(link_url="http://example.com", link_external=True)
        banner.full_clean()


class SiteBannerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.factory = APIRequestFactory()
        self.now = timezone.now()

    def _published(self, **kwargs):
        defaults = {
            "status": PublishStatus.PUBLISHED,
            "published_at": self.now,
        }
        defaults.update(kwargs)
        return SiteBanner.objects.create(**defaults)

    def _get_banners(self, placement="site_top", lang="es"):
        return self.client.get(
            f"/api/v1/cms/banners/?placement={placement}&lang={lang}",
        )

    def test_active_banner_visible(self):
        self._published(
            title="Activo",
            title_es="Activo",
            placement=BannerPlacement.SITE_TOP,
            starts_at=self.now - timezone.timedelta(hours=1),
            ends_at=self.now + timezone.timedelta(hours=1),
        )
        response = self._get_banners()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 1)
        self.assertEqual(response.json()["results"][0]["title"], "Activo")

    def test_draft_banner_hidden(self):
        SiteBanner.objects.create(
            title="Borrador",
            title_es="Borrador",
            placement=BannerPlacement.SITE_TOP,
            status=PublishStatus.DRAFT,
        )
        response = self._get_banners()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_archived_banner_hidden(self):
        self._published(
            title="Archivado",
            title_es="Archivado",
            placement=BannerPlacement.SITE_TOP,
            status=PublishStatus.ARCHIVED,
        )
        response = self._get_banners()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_future_banner_hidden(self):
        self._published(
            title="Futuro",
            title_es="Futuro",
            placement=BannerPlacement.SITE_TOP,
            starts_at=self.now + timezone.timedelta(days=1),
        )
        response = self._get_banners()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_expired_banner_hidden(self):
        self._published(
            title="Vencido",
            title_es="Vencido",
            placement=BannerPlacement.SITE_TOP,
            starts_at=self.now - timezone.timedelta(days=2),
            ends_at=self.now - timezone.timedelta(hours=1),
        )
        response = self._get_banners()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["results"]), 0)

    def test_starts_at_only_visible_when_started(self):
        self._published(
            title="Sin fin",
            title_es="Sin fin",
            placement=BannerPlacement.HOME_HERO,
            starts_at=self.now - timezone.timedelta(minutes=5),
        )
        response = self._get_banners(placement="home_hero")
        self.assertEqual(len(response.json()["results"]), 1)

    def test_ends_at_only_visible_before_end(self):
        self._published(
            title="Sin inicio",
            title_es="Sin inicio",
            placement=BannerPlacement.HOME_HERO,
            ends_at=self.now + timezone.timedelta(hours=2),
        )
        response = self._get_banners(placement="home_hero")
        self.assertEqual(len(response.json()["results"]), 1)

    def test_placement_filter(self):
        self._published(
            title="Top",
            title_es="Top",
            placement=BannerPlacement.SITE_TOP,
        )
        self._published(
            title="Hero",
            title_es="Hero",
            placement=BannerPlacement.HOME_HERO,
        )
        top = self._get_banners(placement="site_top")
        hero = self._get_banners(placement="home_hero")
        self.assertEqual(len(top.json()["results"]), 1)
        self.assertEqual(top.json()["results"][0]["title"], "Top")
        self.assertEqual(len(hero.json()["results"]), 1)
        self.assertEqual(hero.json()["results"][0]["title"], "Hero")

    def test_lang_en_returns_english_title(self):
        self._published(
            title="ES",
            title_es="Título ES",
            title_en="Title EN",
            placement=BannerPlacement.SITE_TOP,
        )
        response = self._get_banners(lang="en")
        self.assertEqual(response.json()["results"][0]["title"], "Title EN")

    def test_priority_ordering(self):
        self._published(
            title="Bajo",
            title_es="Bajo",
            placement=BannerPlacement.HOME_HERO,
            priority=1,
        )
        self._published(
            title="Alto",
            title_es="Alto",
            placement=BannerPlacement.HOME_HERO,
            priority=10,
        )
        response = self._get_banners(placement="home_hero")
        titles = [item["title"] for item in response.json()["results"]]
        self.assertEqual(titles, ["Alto", "Bajo"])

    def test_serializer_aliases(self):
        self._published(
            title="Alias",
            title_es="Alias",
            placement=BannerPlacement.SITE_TOP,
            link_url="https://example.com/path",
            link_external=True,
            priority=7,
        )
        response = self._get_banners()
        item = response.json()["results"][0]
        self.assertEqual(item["cta_url"], "https://example.com/path")
        self.assertTrue(item["open_in_new_tab"])
        self.assertEqual(item["order"], 7)

    def test_internal_cta_url_in_api(self):
        self._published(
            title="Interno",
            title_es="Interno",
            placement=BannerPlacement.HOME_HERO,
            link_url="/es/prensa",
            link_external=False,
            cta_label="Ver prensa",
        )
        response = self._get_banners(placement="home_hero")
        item = response.json()["results"][0]
        self.assertEqual(item["cta_url"], "/es/prensa")
        self.assertFalse(item["open_in_new_tab"])

    def test_viewset_list_via_factory(self):
        self._published(
            title="Activo",
            title_es="Activo",
            placement=BannerPlacement.SITE_TOP,
        )
        request = self.factory.get("/api/v1/cms/banners/?placement=site_top")
        view = SiteBannerViewSet.as_view({"get": "list"})
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
