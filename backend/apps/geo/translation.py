from modeltranslation.translator import TranslationOptions, translator

from .models import RoadCorridor


class RoadCorridorTranslationOptions(TranslationOptions):
    fields = ("name", "description")


translator.register(RoadCorridor, RoadCorridorTranslationOptions)
