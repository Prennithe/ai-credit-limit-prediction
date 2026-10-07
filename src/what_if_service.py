import copy
from typing import Dict, Any
from src.prediction_service import CreditLimitPredictionService

# Mapping allowed flat field names to their location in the customer document
FIELD_MAP = {
    # Profile
    "age": ("profile", "age"),
    "sex": ("profile", "sex"),
    "education": ("profile", "education"),
    "marriage": ("profile", "marriage"),
    
    # Repayment history
    "pay_0": ("repayment_history", "pay_0"),
    "pay_2": ("repayment_history", "pay_2"),
    "pay_3": ("repayment_history", "pay_3"),
    "pay_4": ("repayment_history", "pay_4"),
    "pay_5": ("repayment_history", "pay_5"),
    "pay_6": ("repayment_history", "pay_6"),
    
    # Billing history
    "bill_amt_1": ("billing_history", "bill_amt_1"),
    "bill_amt_2": ("billing_history", "bill_amt_2"),
    "bill_amt_3": ("billing_history", "bill_amt_3"),
    "bill_amt_4": ("billing_history", "bill_amt_4"),
    "bill_amt_5": ("billing_history", "bill_amt_5"),
    "bill_amt_6": ("billing_history", "bill_amt_6"),
    
    # Payment history
    "pay_amt_1": ("payment_history", "pay_amt_1"),
    "pay_amt_2": ("payment_history", "pay_amt_2"),
    "pay_amt_3": ("payment_history", "pay_amt_3"),
    "pay_amt_4": ("payment_history", "pay_amt_4"),
    "pay_amt_5": ("payment_history", "pay_amt_5"),
    "pay_amt_6": ("payment_history", "pay_amt_6"),
}

PROTECTED_FIELDS = {
    "customer_id",
    "current_credit_limit",
    "default.payment.next.month",
    "record_source",
    "_id"
}


class WhatIfSimulationService:
    def __init__(self):
        # Reuse existing prediction service
        self.prediction_service = CreditLimitPredictionService()

    def simulate(self, customer: Dict[str, Any], overrides: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate changes to customer financial/repayment profile in-memory
        and calculate predicted credit limit delta.
        """
        if not isinstance(overrides, dict):
            raise ValueError("Overrides must be a dictionary.")

        # 1. Validate overrides
        for field, value in overrides.items():
            if field in PROTECTED_FIELDS:
                raise ValueError(f"Modification of protected field '{field}' is strictly prohibited.")
            if field not in FIELD_MAP:
                raise ValueError(f"Unknown or unsupported simulation field '{field}'.")
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError(f"Value for '{field}' must be numeric.")

        # 2. Get baseline prediction (using deepcopy to prevent any accidental side effects)
        baseline_result = self.prediction_service.predict(copy.deepcopy(customer))
        baseline_pred = float(baseline_result["predicted_credit_limit"])

        # 3. Create deep copy for simulation
        simulated_customer = copy.deepcopy(customer)
        applied_changes = {}

        # 4. Apply overrides
        for field, new_val in overrides.items():
            section, key = FIELD_MAP[field]
            orig_val = simulated_customer[section][key]

            # Convert to numeric appropriately
            if isinstance(orig_val, int):
                numeric_new_val = int(new_val)
            else:
                numeric_new_val = float(new_val)

            if orig_val != numeric_new_val:
                simulated_customer[section][key] = numeric_new_val
                applied_changes[field] = {
                    "original": orig_val,
                    "simulated": numeric_new_val
                }

        # 5. Run prediction on simulated customer copy
        simulated_result = self.prediction_service.predict(simulated_customer)
        simulated_pred = float(simulated_result["predicted_credit_limit"])

        # 6. Calculate delta
        prediction_change = round(simulated_pred - baseline_pred, 2)
        if baseline_pred == 0:
            prediction_change_pct = 0.0
        else:
            prediction_change_pct = round((prediction_change / baseline_pred) * 100, 2)

        return {
            "customer_id": customer.get("customer_id", "UNKNOWN"),
            "baseline_prediction": round(baseline_pred, 2),
            "simulated_prediction": round(simulated_pred, 2),
            "prediction_change": prediction_change,
            "prediction_change_percentage": prediction_change_pct,
            "applied_changes": applied_changes
        }
