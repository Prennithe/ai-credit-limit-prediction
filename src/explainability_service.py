from pathlib import Path

import joblib
import shap
import pandas as pd

from src.feature_engineering import (
    customer_document_to_dataframe,
    engineer_features
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent

PREPROCESSOR_PATH = PROJECT_ROOT / "models" / "preprocessor.joblib"
MODEL_PATH = PROJECT_ROOT / "models" / "tuned_xgboost.joblib"


class CreditLimitExplainabilityService:

    def __init__(self):
        self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        self.model = joblib.load(MODEL_PATH)

        self.explainer = shap.TreeExplainer(self.model)

    def explain(self, customer):

        # Convert MongoDB document to dataframe
        raw_df = customer_document_to_dataframe(customer)

        # Apply the exact training feature engineering
        featured_df = engineer_features(raw_df)

        # Apply the exact saved preprocessing
        processed_features = self.preprocessor.transform(
            featured_df
        )

        # Get feature names after preprocessing
        feature_names = self.preprocessor.get_feature_names_out()

        # Convert to dense dataframe
        if hasattr(processed_features, "toarray"):
            processed_features = processed_features.toarray()

        processed_df = pd.DataFrame(
            processed_features,
            columns=feature_names
        )

        # Calculate SHAP values
        shap_values = self.explainer(processed_df)

        values = shap_values.values[0]

        # base_values[0] is the model's expected output over the training set.
        # It is the starting point of the waterfall decomposition:
        #   base_value + sum(shap_values) ≈ model.predict(processed_df)[0]
        base_value = float(shap_values.base_values[0])

        # Create explanation dataframe
        explanation_df = pd.DataFrame({
            "feature": feature_names,
            "shap_value": values,
            "feature_value": processed_df.iloc[0].values
        })

        # Absolute importance
        explanation_df["absolute_shap"] = (
            explanation_df["shap_value"].abs()
        )

        # Sort by importance
        explanation_df = explanation_df.sort_values(
            "absolute_shap",
            ascending=False
        )

        return explanation_df.reset_index(drop=True), base_value