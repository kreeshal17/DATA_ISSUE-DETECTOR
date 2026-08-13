from django.urls import path

from .views import DatasetIssueView, AnalyzeIssueView


urlpatterns = [
    path(
        "<slug:slug>/issues/",
        DatasetIssueView.as_view(),
        name="dataset-issues"
    ),

    path(
        "<int:issue_id>/analyze/",
        AnalyzeIssueView.as_view(),
        name="analyze-issue"
    ),
]