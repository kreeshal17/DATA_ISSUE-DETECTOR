from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from datasets.models import Dataset
from .models import DatasetProfile
from .serializers import DatasetProfileSerializer


class DatasetProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):

        try:
            dataset = Dataset.objects.get(
                owner=request.user,
                slug=slug
            )

        except Dataset.DoesNotExist:
            return Response(
                {"error": "Dataset not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            profile = DatasetProfile.objects.get(
                dataset=dataset
            )

        except DatasetProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DatasetProfileSerializer(profile)

        return Response(serializer.data)