from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .models import AdvisoryRequest, ContactSubmission, ProjectApplication, ResourceDownloadLead
from .serializers import (
    AdvisoryRequestSerializer,
    ContactSubmissionSerializer,
    ProjectApplicationSerializer,
    ResourceDownloadLeadSerializer,
)


class PublicCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = (AllowAny,)


class ContactSubmissionViewSet(PublicCreateViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer


class ProjectApplicationViewSet(PublicCreateViewSet):
    queryset = ProjectApplication.objects.all()
    serializer_class = ProjectApplicationSerializer


class AdvisoryRequestViewSet(PublicCreateViewSet):
    queryset = AdvisoryRequest.objects.all()
    serializer_class = AdvisoryRequestSerializer


class ResourceDownloadLeadViewSet(PublicCreateViewSet):
    queryset = ResourceDownloadLead.objects.all()
    serializer_class = ResourceDownloadLeadSerializer
