from django.urls import path
from .views import DatasetView


urlpatterns = [
    path("", DatasetView.as_view(), name="datasets"),
]