import pandas as pd

from .models import DatasetProfile


class ProfilerService:

    def __init__(self, dataset):
        self.dataset = dataset

    def run(self):

        df = pd.read_csv(self.dataset.file.path)

        profile = {
            "rows": len(df),
            "columns": len(df.columns),
            "columns_info": self.profile_columns(df),
            "duplicate_count": int(df.duplicated().sum()),
        }
        self.dataset.row_count = profile["rows"]
        self.dataset.column_count = profile["columns"]
        self.dataset.save(
        update_fields=["row_count", "column_count"]
    )
        

        dataset_profile, _ = DatasetProfile.objects.update_or_create(
            dataset=self.dataset,
            defaults={
                "row_count": profile["rows"],
                "column_count": profile["columns"],
                "duplicate_count": profile["duplicate_count"],
                "columns_info": profile["columns_info"],
            }
        )

        return dataset_profile

    def profile_columns(self, df):

        columns_info = {}

        for column in df.columns:

            series = df[column]

            columns_info[column] = {
                "dtype": str(series.dtype),
                "missing": int(series.isna().sum()),
                "missing_percentage": float(
                    series.isna().mean() * 100
                ),
                "unique": int(series.nunique()),
            }

        return columns_info