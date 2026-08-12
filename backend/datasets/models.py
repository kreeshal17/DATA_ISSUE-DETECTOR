from django.conf import settings
from django.db import models

from django.utils.text import slugify
class Dataset(models.Model):

    class Status(models.TextChoices):
        UPLOADED = "UPLOADED", "Uploaded"
        PROCESSING = "PROCESSING", "Processing"
        ANALYZED = "ANALYZED", "Analyzed"
        FAILED = "FAILED", "Failed"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datasets"
    )
    slug = models.SlugField(
    null=True,
    blank=True
)
    name = models.CharField(max_length=255)

    file = models.FileField(upload_to="datasets/")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED
    )

    row_count = models.PositiveIntegerField(default=0)

    column_count = models.PositiveIntegerField(default=0)

    quality_score = models.FloatField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)
    
    
    def save(self,*args, **kwargs):
        if not self.slug:
            self.slug=slugify(self.name)
            super().save(*args,**kwargs)
    def __str__(self):
        return self.name
    
    