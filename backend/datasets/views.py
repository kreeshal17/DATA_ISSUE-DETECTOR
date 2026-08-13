from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from issues.models import Issue
from issues.services import IssueDetector

from .models import Dataset
from .serializers import DatasetSerializer

from profiling.services import ProfilerService

from ai_analysis.graph import graph


class DatasetView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = DatasetSerializer(
            data=request.data
        )

        if serializer.is_valid():

            dataset = serializer.save(
                owner=request.user
            )

            ProfilerService(dataset).run()

            IssueDetector(dataset).run()

            return Response(
                DatasetSerializer(dataset).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):

        datasets = Dataset.objects.filter(
            owner=request.user
        )

        serializer = DatasetSerializer(
            datasets,
            many=True
        )

        return Response(serializer.data)


class AnalyzeDatasetView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, slug):

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

        if not issues.exists():

            return Response(
                {
                    "error": "No issues found for this dataset"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        analyzed = []

        for issue in issues:

            try:

                graph.invoke({
                    "issue_id": issue.id,
                    "issue": "",
                    "analysis": None
                })

            except Exception as error:

                return Response(
                    {
                        "error": "AI analysis failed",
                        "issue_id": issue.id,
                        "details": str(error)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            issue.refresh_from_db()

            analyzed.append({
                "issue_id": issue.id,
                "ai_explanation": issue.ai_explanation,
                "ai_root_cause": issue.ai_root_cause,
                "ai_recommendation": issue.ai_recommendation,
                "ai_confidence": issue.ai_confidence,
            })

        return Response({
            "dataset": dataset.name,
            "analyzed_count": len(analyzed),
            "issues": analyzed
        })