from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Department
from .serializers import departments_feature_collection


class DepartmentListView(APIView):
    def get(self, request):
        qs = Department.objects.filter(is_active=True).order_by("name")
        return Response(departments_feature_collection(qs))


class DepartmentDetailView(APIView):
    def get(self, request, slug: str):
        dept = get_object_or_404(Department, slug=slug, is_active=True)
        return Response(departments_feature_collection([dept]))

