from django.urls import path

from .views import (
    DatasetIssueView,
    AnalyzeIssueView,
    IssueAnalysisView,
    DatasetIssueSummaryView,
)


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

    path(
        "<int:issue_id>/analysis/",
        IssueAnalysisView.as_view(),
        name="issue-analysis"
    ),

    path(
        "<slug:slug>/summary/",
        DatasetIssueSummaryView.as_view(),
        name="dataset-issue-summary"
    ),
]