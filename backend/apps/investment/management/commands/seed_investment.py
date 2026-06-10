from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.geo.models import CNIRegion, Department
from apps.investment.models import (
    InvestmentOpportunity,
    InvestmentProject,
    OpportunityStatus,
    ProjectStage,
    Sector,
    SuccessStory,
)


SECTORS = [
    {
        "name": "Agroindustria",
        "slug": "agroindustria",
        "short_description": "Transformación y exportación de productos agrícolas.",
        "description": (
            "Honduras ofrece ventajas comparativas en cultivos tropicales, "
            "procesamiento de alimentos y cadenas de valor agroexportadoras "
            "con acceso a mercados regionales e internacionales."
        ),
        "color_hex": "#2E7D32",
        "order": 1,
    },
    {
        "name": "Turismo",
        "slug": "turismo",
        "short_description": "Destinos naturales, culturales y de negocios.",
        "description": (
            "El sector turístico combina islas del Caribe, patrimonio maya, "
            "ecoturismo y eventos corporativos, con oportunidades en hotelería, "
            "operadores y servicios complementarios."
        ),
        "color_hex": "#0077B6",
        "order": 2,
    },
    {
        "name": "Energía",
        "slug": "energia",
        "short_description": "Generación renovable y eficiencia energética.",
        "description": (
            "Proyectos de energía solar, eólica e hidroeléctrica, junto con "
            "soluciones de almacenamiento y modernización de redes, impulsan "
            "la transición energética del país."
        ),
        "color_hex": "#F9A825",
        "order": 3,
    },
    {
        "name": "Manufactura",
        "slug": "manufactura",
        "short_description": "Industria liviana, textil y ensamble.",
        "description": (
            "La manufactura aprovecha proximidad logística, mano de obra "
            "competitiva y tratados comerciales para exportación de bienes "
            "industriales y componentes."
        ),
        "color_hex": "#5E35B1",
        "order": 4,
    },
    {
        "name": "Infraestructura",
        "slug": "infraestructura",
        "short_description": "Obras públicas, logística y conectividad.",
        "description": (
            "Inversión en carreteras, puertos, aeropuertos, parques industriales "
            "y telecomunicaciones para mejorar la competitividad territorial."
        ),
        "color_hex": "#546E7A",
        "order": 5,
    },
]

OPPORTUNITIES = [
    {
        "title": "Planta de procesamiento de palma africana",
        "slug": "planta-procesamiento-palma-africana",
        "sector_slug": "agroindustria",
        "region_slug": "region-norte",
        "summary": "Instalación de planta para aceite y subproductos con mercado de exportación.",
        "description": (
            "Oportunidad para desarrollar una planta de procesamiento de palma africana "
            "con capacidad inicial de 50 toneladas diarias, integrando proveedores locales "
            "y certificaciones de exportación."
        ),
        "estimated_investment": Decimal("12000000.00"),
        "estimated_jobs": 180,
    },
    {
        "title": "Resort eco-turístico en la costa norte",
        "slug": "resort-eco-turistico-costa-norte",
        "sector_slug": "turismo",
        "region_slug": "region-norte",
        "summary": "Desarrollo hotelero sostenible orientado a turismo de naturaleza.",
        "description": (
            "Proyecto de resort boutique con enfoque ambiental, actividades marinas "
            "y alianzas con operadores locales para posicionar la marca Honduras "
            "en el segmento premium regional."
        ),
        "estimated_investment": Decimal("8500000.00"),
        "estimated_jobs": 120,
    },
    {
        "title": "Parque solar fotovoltaico regional",
        "slug": "parque-solar-fotovoltaico-regional",
        "sector_slug": "energia",
        "region_slug": "region-sur",
        "summary": "Generación de energía renovable para abastecimiento industrial.",
        "description": (
            "Desarrollo de parque solar de 40 MW con contratos de compra de energía "
            "y potencial de expansión para satisfacer demanda industrial creciente."
        ),
        "estimated_investment": Decimal("32000000.00"),
        "estimated_jobs": 90,
    },
    {
        "title": "Centro de manufactura textil de exportación",
        "slug": "centro-manufactura-textil-exportacion",
        "sector_slug": "manufactura",
        "region_slug": "region-oriente",
        "summary": "Planta textil integrada para mercados de Estados Unidos y Centroamérica.",
        "description": (
            "Inversión en centro de manufactura con líneas de corte, confección "
            "y acabado, aprovechando regímenes preferenciales y cadena de suministro regional."
        ),
        "estimated_investment": Decimal("15000000.00"),
        "estimated_jobs": 450,
    },
    {
        "title": "Modernización de corredor logístico interdepartamental",
        "slug": "modernizacion-corredor-logistico",
        "sector_slug": "infraestructura",
        "region_slug": "region-centro",
        "summary": "Mejora de conectividad vial y nodos logísticos para comercio exterior.",
        "description": (
            "Proyecto de infraestructura para rehabilitar tramos críticos, "
            "construir centros de transferencia y digitalizar operaciones aduaneras."
        ),
        "estimated_investment": Decimal("45000000.00"),
        "estimated_jobs": 320,
    },
]

PROJECTS = [
    {
        "title": "Expansión de planta agroindustrial en Sula",
        "slug": "expansion-planta-agroindustrial-sula",
        "sector_slug": "agroindustria",
        "region_slug": "region-norte",
        "summary": "Ampliación de capacidad productiva para exportación de alimentos procesados.",
        "description": (
            "Proyecto demo en etapa de promoción que contempla nueva línea de empaque "
            "y certificación internacional para mercados centroamericanos."
        ),
        "investment_amount": Decimal("6500000.00"),
        "estimated_jobs": 95,
    },
    {
        "title": "Hotel de convenciones en Tegucigalpa",
        "slug": "hotel-convenciones-tegucigalpa",
        "sector_slug": "turismo",
        "region_slug": "region-centro",
        "summary": "Infraestructura hotelera para turismo de negocios y eventos.",
        "description": (
            "Desarrollo de hotel con salones de convenciones, conectividad a aeropuerto "
            "y alianzas con cámaras empresariales para atraer congresos internacionales."
        ),
        "investment_amount": Decimal("11000000.00"),
        "estimated_jobs": 140,
    },
    {
        "title": "Parque industrial logístico del oriente",
        "slug": "parque-industrial-logistico-oriente",
        "sector_slug": "infraestructura",
        "region_slug": "region-oriente",
        "summary": "Zona industrial con servicios logísticos para empresas exportadoras.",
        "description": (
            "Proyecto de parque industrial con bodegas, servicios aduaneros "
            "y conectividad vial hacia la frontera, orientado a nearshoring regional."
        ),
        "investment_amount": Decimal("28000000.00"),
        "estimated_jobs": 210,
    },
]

SUCCESS_STORIES = [
    {
        "title": "Agroexportadora del Atlántico",
        "slug": "agroexportadora-del-atlantico",
        "company_name": "Agroexportadora del Atlántico S.A.",
        "sector_slug": "agroindustria",
        "summary": "De productor local a exportador regional de productos tropicales.",
        "content": (
            "La empresa consolidó una cadena de valor integrada con más de 300 productores "
            "asociados, logrando certificaciones internacionales y presencia en tres mercados "
            "centroamericanos en menos de cinco años."
        ),
        "country_origin": "Honduras",
        "investment_amount": Decimal("4200000.00"),
        "jobs_generated": 260,
    },
    {
        "title": "Textiles del Valle",
        "slug": "textiles-del-valle",
        "company_name": "Textiles del Valle",
        "sector_slug": "manufactura",
        "summary": "Maquila textil que escaló producción con estándares de exportación.",
        "content": (
            "Con inversión en maquinaria y capacitación técnica, la compañía incrementó "
            "su capacidad productiva y diversificó clientes en Estados Unidos, generando "
            "empleo formal especializado en la región oriente."
        ),
        "country_origin": "Estados Unidos",
        "investment_amount": Decimal("7800000.00"),
        "jobs_generated": 520,
    },
    {
        "title": "Energía Solar Copán",
        "slug": "energia-solar-copan",
        "company_name": "Energía Solar Copán",
        "sector_slug": "energia",
        "summary": "Proyecto renovable que abastece industria local con energía limpia.",
        "content": (
            "La iniciativa instaló capacidad fotovoltaica para abastecer plantas industriales "
            "cercanas, reduciendo costos energéticos y posicionando a la región occidente "
            "como polo de transición energética."
        ),
        "country_origin": "España",
        "investment_amount": Decimal("12500000.00"),
        "jobs_generated": 75,
    },
]


def _optional_region(slug: str | None) -> CNIRegion | None:
    if not slug:
        return None
    return CNIRegion.objects.filter(slug=slug, is_active=True).first()


def _optional_department() -> Department | None:
    return Department.objects.filter(is_active=True).order_by("name").first()


class Command(BaseCommand):
    help = "Carga o actualiza datos demo de inversión CNI (idempotente)."

    def handle(self, *args, **options):
        sectors_created = 0
        sectors_updated = 0
        opportunities_created = 0
        opportunities_updated = 0
        projects_created = 0
        projects_updated = 0
        stories_created = 0
        stories_updated = 0

        self.stdout.write("Sectores:")
        sectors_by_slug: dict[str, Sector] = {}
        for data in SECTORS:
            defaults = {
                "name": data["name"],
                "short_description": data["short_description"],
                "description": data["description"],
                "color_hex": data["color_hex"],
                "is_featured": True,
                "is_active": True,
                "order": data["order"],
            }
            obj, was_created = Sector.objects.update_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            sectors_by_slug[obj.slug] = obj
            if was_created:
                sectors_created += 1
                status = "creado"
            else:
                sectors_updated += 1
                status = "actualizado"
            self.stdout.write(f"  [{status}] {obj.name} (slug={obj.slug})")

        department = _optional_department()
        if department:
            self.stdout.write(f"\nDepartamento de referencia disponible: {department.name}")
        else:
            self.stdout.write("\nSin departamentos en base de datos (se omite asignación).")

        self.stdout.write("\nOportunidades:")
        for data in OPPORTUNITIES:
            sector = sectors_by_slug[data["sector_slug"]]
            defaults = {
                "title": data["title"],
                "summary": data["summary"],
                "description": data["description"],
                "sector": sector,
                "region": _optional_region(data.get("region_slug")),
                "department": department,
                "estimated_investment": data.get("estimated_investment"),
                "estimated_jobs": data.get("estimated_jobs"),
                "status": OpportunityStatus.OPEN,
                "is_public": True,
                "is_featured": True,
            }
            obj, was_created = InvestmentOpportunity.objects.update_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            if was_created:
                opportunities_created += 1
                status = "creada"
            else:
                opportunities_updated += 1
                status = "actualizada"
            self.stdout.write(f"  [{status}] {obj.title} (slug={obj.slug})")

        self.stdout.write("\nProyectos:")
        for data in PROJECTS:
            sector = sectors_by_slug[data["sector_slug"]]
            defaults = {
                "title": data["title"],
                "summary": data["summary"],
                "description": data["description"],
                "sector": sector,
                "region": _optional_region(data.get("region_slug")),
                "department": department,
                "investment_amount": data.get("investment_amount"),
                "estimated_jobs": data.get("estimated_jobs"),
                "project_stage": ProjectStage.PROMOTION,
                "is_public": True,
                "is_featured": True,
            }
            obj, was_created = InvestmentProject.objects.update_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            if was_created:
                projects_created += 1
                status = "creado"
            else:
                projects_updated += 1
                status = "actualizado"
            self.stdout.write(f"  [{status}] {obj.title} (slug={obj.slug})")

        self.stdout.write("\nCasos de éxito:")
        for data in SUCCESS_STORIES:
            sector = sectors_by_slug.get(data.get("sector_slug"))
            defaults = {
                "title": data["title"],
                "company_name": data["company_name"],
                "sector": sector,
                "summary": data["summary"],
                "content": data["content"],
                "country_origin": data["country_origin"],
                "investment_amount": data.get("investment_amount"),
                "jobs_generated": data.get("jobs_generated"),
                "is_public": True,
                "is_featured": True,
            }
            obj, was_created = SuccessStory.objects.update_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            if was_created:
                stories_created += 1
                status = "creado"
            else:
                stories_updated += 1
                status = "actualizado"
            self.stdout.write(f"  [{status}] {obj.title} (slug={obj.slug})")

        self.stdout.write(
            self.style.SUCCESS(
                "\nSeed de inversión finalizado.\n"
                f"  Sectores:       creados={sectors_created} actualizados={sectors_updated} "
                f"total_activos={Sector.objects.filter(is_active=True).count()}\n"
                f"  Oportunidades:  creadas={opportunities_created} "
                f"actualizadas={opportunities_updated} "
                f"total_publicas={InvestmentOpportunity.objects.filter(is_public=True).count()}\n"
                f"  Proyectos:      creados={projects_created} actualizados={projects_updated} "
                f"total_publicos={InvestmentProject.objects.filter(is_public=True).count()}\n"
                f"  Casos de éxito: creados={stories_created} actualizados={stories_updated} "
                f"total_publicos={SuccessStory.objects.filter(is_public=True).count()}"
            )
        )
