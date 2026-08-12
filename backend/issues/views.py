from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from datasets.models import Dataset
from .models import Issue
from .serializers import IssueSerializers


class DatasetIssueView(APIView):

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

        issues = Issue.objects.filter(
            dataset=dataset
        )

        serializer = IssueSerializers(
            issues,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )