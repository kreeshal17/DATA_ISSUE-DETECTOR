from django.urls import path

from .views import DatasetIssueView


urlpatterns = [
    path(
        "<slug:slug>/issues/",
        DatasetIssueView.as_view(),
        name="dataset-issues"
    ),
]