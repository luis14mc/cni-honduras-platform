from modeltranslation.translator import TranslationOptions, translator

from .models import (
    InvestmentOpportunity,
    OpportunityFundUse,
    OpportunityMetric,
    Sector,
    SuccessStory,
)


class SectorTranslationOptions(TranslationOptions):
    fields = ("name", "short_description", "description")


class SuccessStoryTranslationOptions(TranslationOptions):
    fields = ("title", "summary", "content", "testimonial_quote", "testimonial_author")


class InvestmentOpportunityTranslationOptions(TranslationOptions):
    fields = (
        "title",
        "summary",
        "description",
        "target_customer",
        "market_demand",
        "value_proposition",
    )


class OpportunityMetricTranslationOptions(TranslationOptions):
    fields = ("label", "value", "note")


class OpportunityFundUseTranslationOptions(TranslationOptions):
    fields = ("component", "description")


translator.register(Sector, SectorTranslationOptions)
translator.register(SuccessStory, SuccessStoryTranslationOptions)
translator.register(InvestmentOpportunity, InvestmentOpportunityTranslationOptions)
translator.register(OpportunityMetric, OpportunityMetricTranslationOptions)
translator.register(OpportunityFundUse, OpportunityFundUseTranslationOptions)
