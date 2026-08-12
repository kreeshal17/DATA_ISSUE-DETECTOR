from django.urls import path
from .views import DatasetProfileView


urlpatterns = [
    path(
        "<slug:slug>/profile/",
        DatasetProfileView.as_view(),
        name="dataset-profile"
    ),
]