from rest_framework import serializers

from .models import DatasetProfile


class DatasetProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = DatasetProfile
        fields = [
            "id",
            "dataset",
            "row_count",
            "column_count",
            "duplicate_count",
            "columns_info",
            "created_at",
            "updated_at",
        ]