from rest_framework import serializers

from .models import Dataset


class DatasetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dataset

        fields = [
            "id",
            "owner",
            "slug",
            "name",
            "file",
            "status",
            "row_count",
            "column_count",
            "quality_score",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "slug",
            "status",
            "row_count",
            "column_count",
            "quality_score",
            "created_at",
            "updated_at",
        ]