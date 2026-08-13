from rest_framework import serializers

from .models import Issue


class IssueSerializer(serializers.ModelSerializer):

    class Meta:
        model = Issue

        fields = [
            "id",
            "dataset",
            "issue_type",
            "column",
            "row",
            "severity",
            "description",
            "details",
            "ai_explanation",
            "ai_root_cause",
            "ai_recommendation",
            "ai_confidence",
            "created_at",
        ]