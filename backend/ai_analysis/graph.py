from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from issues.models import Issue
from .llm import llm


class AnalysisState(TypedDict):
    issue_id: int
    issue: str
    analysis: str


def load_issue(state: AnalysisState):

    issue = Issue.objects.get(
        id=state["issue_id"]
    )

    issue_text = f"""
    Issue Type: {issue.issue_type}
    Column: {issue.column}
    Row: {issue.row}
    Severity: {issue.severity}
    Description: {issue.description}
    Details: {issue.details}
    """

    return {
        "issue": issue_text
    }


def analyze_issue(state: AnalysisState):

    prompt = f"""
    You are a data quality analyst.

    Analyze the following data quality issue:

    {state["issue"]}

    Explain:
    1. Why this is a problem
    2. How serious the issue is
    3. What could have caused it
    4. What should be done to fix it

    Give a clear answer suitable for a user viewing a
    data quality dashboard.
    """

    response = llm.invoke(prompt)

    return {
        "analysis": response.content
    }


graph_builder = StateGraph(AnalysisState)


graph_builder.add_node(
    "load_issue",
    load_issue
)

graph_builder.add_node(
    "analyze_issue",
    analyze_issue
)


graph_builder.add_edge(
    START,
    "load_issue"
)

graph_builder.add_edge(
    "load_issue",
    "analyze_issue"
)

graph_builder.add_edge(
    "analyze_issue",
    END
)


graph = graph_builder.compile()