import re

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

        issues.extend(
            self.detect_anomalies()
        )

        issues.extend(
            self.detect_invalid_formats()
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

    def detect_anomalies(self):

        issues = []

        numeric_columns = self.df.select_dtypes(
            include="number"
        ).columns

        for column in numeric_columns:

            values = self.df[column].dropna()

            if values.empty:
                continue

            q1 = values.quantile(0.25)
            q3 = values.quantile(0.75)

            iqr = q3 - q1

            if iqr == 0:
                continue

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            anomaly_rows = self.df[
                (self.df[column] < lower_bound)
                | (self.df[column] > upper_bound)
            ].index.tolist()

            for row in anomaly_rows:

                value = self.df.loc[row, column]

                issue = Issue.objects.create(
                    dataset=self.dataset,
                    issue_type=Issue.IssueType.ANOMALY,
                    column=column,
                    row=row,
                    severity=Issue.Severity.HIGH,
                    description=f"Anomalous value detected in {column}",
                    details={
                        "column": column,
                        "value": value,
                        "lower_bound": lower_bound,
                        "upper_bound": upper_bound
                    }
                )

                issues.append(issue)

        return issues

    def detect_invalid_formats(self):

        issues = []

        for column in self.df.columns:

            column_name = column.lower().strip()

            if "email" not in column_name:
                continue

            for row, value in self.df[column].items():

                if pd.isna(value):
                    continue

                value = str(value).strip()

                if not self.is_valid_email(value):

                    issue = Issue.objects.create(
                        dataset=self.dataset,
                        issue_type=Issue.IssueType.INVALID_FORMAT,
                        column=column,
                        row=row,
                        severity=Issue.Severity.MEDIUM,
                        description=f"Invalid email format detected in {column}",
                        details={
                            "column": column,
                            "original_value": value
                        }
                    )

                    issues.append(issue)

        return issues

    @staticmethod
    def is_valid_email(value):

        pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

        return bool(
            re.match(pattern, value)
        )