from django.core.management.base import BaseCommand

from apps.geo.models import CNIRegion


REGIONS = [
    {
        "name": "Región Norte",
        "slug": "region-norte",
        "description": (
            "Zona estratégica con vocación agroindustrial, logística portuaria "
            "y conexión con mercados centroamericanos."
        ),
        "color_hex": "#1565C0",
    },
    {
        "name": "Región Centro",
        "slug": "region-centro",
        "description": (
            "Corredor urbano-industrial con mayor concentración de servicios, "
            "manufactura liviana y talento técnico."
        ),
        "color_hex": "#2E7D32",
    },
    {
        "name": "Región Sur",
        "slug": "region-sur",
        "description": (
            "Región con potencial en energía renovable, agroexportación "
            "y desarrollo de polos productivos emergentes."
        ),
        "color_hex": "#F9A825",
    },
    {
        "name": "Región Occidente",
        "slug": "region-occidente",
        "description": (
            "Área con tradición cafetalera, turismo de naturaleza "
            "y oportunidades en cadenas de valor rurales."
        ),
        "color_hex": "#6A1B9A",
    },
    {
        "name": "Región Oriente",
        "slug": "region-oriente",
        "description": (
            "Frontera dinámica con vocación textil, maquila y proyectos "
            "de infraestructura binacional."
        ),
        "color_hex": "#C62828",
    },
]


class Command(BaseCommand):
    help = "Carga o actualiza las regiones CNI iniciales (idempotente)."

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for data in REGIONS:
            defaults = {
                "name": data["name"],
                "description": data["description"],
                "color_hex": data["color_hex"],
                "is_active": True,
            }
            obj, was_created = CNIRegion.objects.update_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            if was_created:
                created += 1
                status = "creada"
            else:
                updated += 1
                status = "actualizada"

            self.stdout.write(f"  [{status}] {obj.name} (slug={obj.slug})")

        total = CNIRegion.objects.filter(is_active=True).count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeed de regiones finalizado. "
                f"creadas={created} actualizadas={updated} total_activas={total}"
            )
        )
