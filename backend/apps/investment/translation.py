from modeltranslation.translator import TranslationOptions, translator

from .models import Sector, SuccessStory


class SectorTranslationOptions(TranslationOptions):
    fields = ("name", "short_description", "description")


class SuccessStoryTranslationOptions(TranslationOptions):
    fields = ("title", "summary", "content", "testimonial_quote", "testimonial_author")


translator.register(Sector, SectorTranslationOptions)
translator.register(SuccessStory, SuccessStoryTranslationOptions)
