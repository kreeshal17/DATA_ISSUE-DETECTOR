from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from issues.services import IssueDetector
from .models import Dataset
from .serializers import DatasetSerializer
from profiling.services import ProfilerService


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