from pathlib import Path

import joblib

from src.feature_engineering import (
    customer_document_to_dataframe,
    engineer_features
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent

PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.joblib"
MODEL_PATH = PROJECT_ROOT / "models" / "tuned_xgboost.joblib"


class CreditLimitPredictionService:

    def __init__(self):
        self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        self.model = joblib.load(MODEL_PATH)

    def predict(self, customer):

        raw_df = customer_document_to_dataframe(customer)

        featured_df = engineer_features(raw_df)

        processed_features = self.preprocessor.transform(
            featured_df
        )

        prediction = self.model.predict(
            processed_features
        )[0]

        return {
            "predicted_credit_limit": round(float(prediction), 2)
        }