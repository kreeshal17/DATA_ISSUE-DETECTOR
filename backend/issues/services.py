import pandas as pd

from .models import Issue


class IssueDetector:

    def __init__(self, dataset):

        self.dataset = dataset

        self.df = pd.read_csv(
            dataset.file.path
        )

    def run(self):

        issues = []

        issues.extend(
            self.detect_missing_values()
        )

        issues.extend(
            self.detect_duplicates()
        )

        return issues

    def detect_missing_values(self):

        issues = []

        for column in self.df.columns:

            missing_rows = self.df[
                self.df[column].isna()
            ].index.tolist()

            for row in missing_rows:

                issue = Issue.objects.create(
                    dataset=self.dataset,
                    issue_type=Issue.IssueType.MISSING_VALUE,
                    column=column,
                    row=row,
                    severity=Issue.Severity.MEDIUM,
                    description=f"Missing value detected in {column}",
                    details={
                        "column": column,
                        "original_value": None
                    }
                )

                issues.append(issue)

        return issues

    def detect_duplicates(self):

        issues = []

        duplicate_rows = self.df[
            self.df.duplicated()
        ].index.tolist()

        for row in duplicate_rows:

            issue = Issue.objects.create(
                dataset=self.dataset,
                issue_type=Issue.IssueType.DUPLICATE,
                row=row,
                severity=Issue.Severity.MEDIUM,
                description="Duplicate row detected",
                details={
                    "duplicate_row": row
                }
            )

            issues.append(issue)

        return issues