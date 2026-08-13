from typing import TypedDict

from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END

from issues.models import Issue
from .llm import llm


class AIAnalysis(BaseModel):
    explanation: str = Field(
        description="Explain the data quality issue clearly"
    )

    root_cause: str = Field(
        description="Likely reason why this issue occurred"
    )

    recommendation: str = Field(
        description="Recommended action to fix or handle the issue"
    )

    confidence: float = Field(
        description="Confidence in the analysis between 0 and 1"
    )


class AnalysisState(TypedDict):
    issue_id: int
    issue: str
    analysis: AIAnalysis | None


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

    structured_llm = llm.with_structured_output(
        AIAnalysis
    )

    prompt = f"""
    You are a data quality analyst.

    Analyze this data quality issue:

    {state["issue"]}

    Provide:
    1. A clear explanation
    2. The likely root cause
    3. A recommendation to fix it
    4. Your confidence from 0 to 1
    """

    response = structured_llm.invoke(prompt)

    return {
        "analysis": response
    }


def save_analysis(state: AnalysisState):

    issue = Issue.objects.get(
        id=state["issue_id"]
    )

    analysis = state["analysis"]

    issue.ai_explanation = analysis.explanation
    issue.ai_root_cause = analysis.root_cause
    issue.ai_recommendation = analysis.recommendation
    issue.ai_confidence = analysis.confidence

    issue.save()

    return {}


graph_builder = StateGraph(AnalysisState)


graph_builder.add_node(
    "load_issue",
    load_issue
)

graph_builder.add_node(
    "analyze_issue",
    analyze_issue
)

graph_builder.add_node(
    "save_analysis",
    save_analysis
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
    "save_analysis"
)

graph_builder.add_edge(
    "save_analysis",
    END
)


graph = graph_builder.compile()