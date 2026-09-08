import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

class TemporalValidator:
    """
    Implements Time-Aware Temporal Cross-Validation for Project Records.
    Strictly forbids random shuffle splits to prevent future-data leakage.
    - Train Window: Historical project-month observations up to 2023-12-31
    - Validation Window: 2024-01-01 to 2024-12-31
    - Out-of-Time Test Window: 2025-01-01 onwards
    """

    @classmethod
    def split_temporal(cls, df: pd.DataFrame, date_column: str = "reporting_month") -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        df[date_column] = pd.to_datetime(df[date_column])
        
        train_mask = df[date_column] < pd.to_datetime("2024-01-01")
        val_mask = (df[date_column] >= pd.to_datetime("2024-01-01")) & (df[date_column] < pd.to_datetime("2025-01-01"))
        test_mask = df[date_column] >= pd.to_datetime("2025-01-01")

        train_df = df[train_mask]
        val_df = df[val_mask]
        test_df = df[test_mask]

        return train_df, val_df, test_df
