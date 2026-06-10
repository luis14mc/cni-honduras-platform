from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# Registrar viewsets de formularios aquí (contacto, postulación, asesoría), p. ej.:
# router.register(r"contact", ContactSubmissionViewSet, basename="forms-contact")
# router.register(r"project-applications", ProjectApplicationViewSet, basename="forms-project-application")

urlpatterns = router.urls
