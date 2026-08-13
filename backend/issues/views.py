from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Issue
from .serializers import IssueSerializer
from datasets.models import Dataset
from ai_analysis.graph import graph


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

        serializer = IssueSerializer(
            issues,
            many=True
        )

        return Response(serializer.data)


class AnalyzeIssueView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, issue_id):

        try:
            issue = Issue.objects.get(
                id=issue_id,
                dataset__owner=request.user
            )

        except Issue.DoesNotExist:
            return Response(
                {"error": "Issue not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        result = graph.invoke({
            "issue_id": issue.id,
            "issue": "",
            "analysis": None
        })

        issue.refresh_from_db()

        serializer = IssueSerializer(issue)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )