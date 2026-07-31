from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.cms.models import InstitutionalLink, LinkSection, News, NewsCategory, PublishStatus


HOME_LINKS = [
    ("guia", "Guía Invierte en Honduras", "https://online.flippingbook.com/view/972979540/", "#29AB85"),
    ("memoria", "Memoria Institucional", "https://online.flippingbook.com/view/975450084/", "#24436B"),
    ("pdi", "Portal Digital de Inversión", "https://pdihonduras.gob.hn/consulta", "#0E7A7C"),
    ("estudios", "Estudios CNI", "/recursos/estudios", "#35A963"),
]

FOOTER_LINKS = [
    ("Presidencia", "https://www.presidencia.gob.hn"),
    ("COHEP", "https://cohep.com"),
    ("BCH", "https://www.bch.hn"),
    ("INE", "https://www.ine.gob.hn"),
    ("Aduanas", "https://www.aduanas.gob.hn"),
    ("Fedecamaras", "https://www.fedecamaras.com"),
    ("SDE", "https://sde.gob.hn"),
    ("SERNA", "https://www.miambiente.gob.hn"),
    ("ANDI", "https://andi.hn"),
    ("WAIPA", "https://waipa.org"),
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
        for order, (icon, title, url, accent) in enumerate(HOME_LINKS, start=1):
            external = url.startswith("http")
            InstitutionalLink.objects.update_or_create(
                section=LinkSection.HOME_INTEREST,
                title=title,
                defaults={
                    "title_es": title,
                    "title_en": title,
                    "url": url if external else f"https://cni.hn{url}",
                    "is_external": external,
                    "icon": icon,
                    "accent_color": accent,
                    "order": order,
                    "is_active": True,
                },
            )

        for order, (title, url) in enumerate(FOOTER_LINKS, start=1):
            InstitutionalLink.objects.update_or_create(
                section=LinkSection.FOOTER_EXTERNAL,
                title=title,
                defaults={
                    "title_es": title,
                    "title_en": title,
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
