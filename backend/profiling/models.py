from django.db import models
from datasets.models import Dataset


class DatasetProfile(models.Model):

    dataset = models.OneToOneField(
        Dataset,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    row_count = models.PositiveIntegerField(default=0)

    column_count = models.PositiveIntegerField(default=0)

    duplicate_count = models.PositiveIntegerField(default=0)

    columns_info = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.dataset.name}"