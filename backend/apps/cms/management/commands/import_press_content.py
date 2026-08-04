from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.cms.models import News, NewsCategory, PublishStatus

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
    help = "Importa borradores de prensa de ejemplo para desarrollo (no usar en arranque de producción)."

    def handle(self, *args, **options):
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

        self.stdout.write(self.style.SUCCESS("Borradores de prensa de ejemplo importados."))
