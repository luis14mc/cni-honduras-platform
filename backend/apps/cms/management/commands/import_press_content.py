from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.cms.models import InstitutionalLink, LinkSection, News, NewsCategory, PublishStatus


HOME_LINKS = [
    (
        "guia",
        "Guía Invierte en Honduras",
        "Invest in Honduras Guide",
        "https://online.flippingbook.com/view/972979540/",
        "#29AB85",
    ),
    (
        "memoria",
        "Memoria Institucional",
        "Institutional Report",
        "https://online.flippingbook.com/view/975450084/",
        "#24436B",
    ),
    (
        "pdi",
        "Portal Digital de Inversiones",
        "Digital Investment Portal",
        "https://pdihonduras.gob.hn/consulta",
        "#0E7A7C",
    ),
    (
        "estudios",
        "Vista de Estudios CNI",
        "CNI Studies View",
        "https://cni.hn/recursos/estudios",
        "#35A963",
    ),
]

FOOTER_LINKS = [
    ("presidencia", "Presidencia", "Presidency", "https://www.presidencia.gob.hn"),
    ("cohep", "COHEP", "COHEP", "https://cohep.com"),
    ("bch", "BCH", "BCH", "https://www.bch.hn"),
    ("ine", "INE", "INE", "https://www.ine.gob.hn"),
    ("aduanas", "Aduanas", "Customs", "https://www.aduanas.gob.hn"),
    ("fedecamaras", "Fedecamaras", "Fedecamaras", "https://www.fedecamaras.com"),
    ("sde", "SDE", "SDE", "https://sde.gob.hn"),
    ("serna", "SERNA", "SERNA", "https://www.miambiente.gob.hn"),
    ("andi", "ANDI", "ANDI", "https://andi.hn"),
    ("waipa", "WAIPA", "WAIPA", "https://waipa.org"),
]

PRESS_ITEMS = [
    {
        "title": "CNI impulsa nueva ventana de inversión en energía renovable",
        "summary": "El Consejo Nacional de Inversiones presenta oportunidades en el sector energético.",
        "content": "El CNI anuncia una nueva línea de acompañamiento para proyectos de energía renovable en Honduras.",
        "category": NewsCategory.PRESS_RELEASE,
    },
    {
        "title": "Honduras refuerza su posicionamiento como hub logístico regional",
        "summary": "Nuevas iniciativas para atraer inversión en logística y transporte.",
        "content": "La plataforma institucional destaca ventajas competitivas en conectividad multimodal.",
        "category": NewsCategory.NEWS,
    },
]


class Command(BaseCommand):
    help = "Importa contenido inicial de prensa y enlaces institucionales (idempotente por slug)."

    def handle(self, *args, **options):
        for order, (icon, title_es, title_en, url, accent) in enumerate(HOME_LINKS, start=1):
            external = url.startswith("http") and "cni.hn" not in url
            InstitutionalLink.objects.update_or_create(
                section=LinkSection.HOME_INTEREST,
                icon=icon,
                defaults={
                    "title": title_es,
                    "title_es": title_es,
                    "title_en": title_en,
                    "url": url,
                    "is_external": external,
                    "accent_color": accent,
                    "order": order,
                    "is_active": True,
                },
            )

        for order, (key, title_es, title_en, url) in enumerate(FOOTER_LINKS, start=1):
            InstitutionalLink.objects.update_or_create(
                section=LinkSection.FOOTER_EXTERNAL,
                icon=key,
                defaults={
                    "title": title_es,
                    "title_es": title_es,
                    "title_en": title_en,
                    "url": url,
                    "is_external": True,
                    "order": order,
                    "is_active": True,
                },
            )

        for item in PRESS_ITEMS:
            slug = slugify(item["title"])
            News.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": item["title"],
                    "title_es": item["title"],
                    "summary": item["summary"],
                    "summary_es": item["summary"],
                    "content": item["content"],
                    "content_es": item["content"],
                    "category": item["category"],
                    "status": PublishStatus.DRAFT,
                    "source": "CNI",
                },
            )

        self.stdout.write(self.style.SUCCESS("Contenido CMS inicial importado."))
