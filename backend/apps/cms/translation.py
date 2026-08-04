from modeltranslation.translator import TranslationOptions, translator

from .models import Document, InstitutionalLink, News, Page, SiteBanner


class PageTranslationOptions(TranslationOptions):
    fields = ("title", "content", "excerpt", "seo_title", "seo_description")


class NewsTranslationOptions(TranslationOptions):
    fields = ("title", "summary", "content", "seo_title", "seo_description")


class DocumentTranslationOptions(TranslationOptions):
    fields = ("title", "description", "seo_title", "seo_description")


class InstitutionalLinkTranslationOptions(TranslationOptions):
    fields = ("title", "description")


class SiteBannerTranslationOptions(TranslationOptions):
    fields = ("title", "body", "cta_label")


translator.register(Page, PageTranslationOptions)
translator.register(News, NewsTranslationOptions)
translator.register(Document, DocumentTranslationOptions)
translator.register(InstitutionalLink, InstitutionalLinkTranslationOptions)
translator.register(SiteBanner, SiteBannerTranslationOptions)
