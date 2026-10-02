from django.core.management.base import BaseCommand

from apps.cms.models import PublishStatus
from apps.investment.demo_slugs import DEMO_INVESTMENT_SLUGS
from apps.investment.models import InvestmentOpportunity, InvestmentProject, SuccessStory


class Command(BaseCommand):
    help = (
        "Retira del sitio público los registros demo de seed_investment "
        "(idempotente; no borra filas)."
    )

    def handle(self, *args, **options):
        slugs = list(DEMO_INVESTMENT_SLUGS)

        opportunities = InvestmentOpportunity.all_objects.filter(slug__in=slugs)
        opp_updated = opportunities.exclude(status=PublishStatus.DRAFT).update(
            status=PublishStatus.DRAFT
        )

        projects = InvestmentProject.objects.filter(slug__in=slugs)
        proj_updated = projects.filter(is_public=True).update(is_public=False)

        stories = SuccessStory.all_objects.filter(slug__in=slugs)
        story_updated = stories.exclude(status=PublishStatus.DRAFT).update(
            status=PublishStatus.DRAFT
        )

        self.stdout.write(
            "retire_demo_investment: "
            f"oportunidades_a_draft={opp_updated} "
            f"proyectos_no_publicos={proj_updated} "
            f"casos_a_draft={story_updated}"
        )
