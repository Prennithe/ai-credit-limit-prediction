from typing import Dict, Any
from src.prediction_service import CreditLimitPredictionService

class FinancialTrendService:
    def __init__(self):
        # Do not duplicate model logic; reuse the existing prediction service
        self.prediction_service = CreditLimitPredictionService()

    def get_financial_trends(self, customer: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate financial trends from an existing customer document.
        Handles missing fields safely by raising errors.
        Returns a clean JSON-serializable structure.
        """
        try:
            customer_id = customer["customer_id"]
            billing_history = customer["billing_history"]
            payment_history = customer["payment_history"]
            repayment_history = customer["repayment_history"]
            credit_history = customer["credit_history"]
        except KeyError as e:
            raise ValueError(f"Missing required customer data field: {e}")

        bill_payment_trend = []
        payment_to_bill_ratio = []
        repayment_delay_trend = []

        for i in range(1, 7):
            month_label = f"Month {i}"
            
            bill_key = f"bill_amt_{i}"
            pay_key = f"pay_amt_{i}"
            
            # The original dataset has PAY_0 instead of PAY_1
            delay_key = "pay_0" if i == 1 else f"pay_{i}"
            
            if bill_key not in billing_history:
                raise ValueError(f"Missing {bill_key} in billing_history")
            if pay_key not in payment_history:
                raise ValueError(f"Missing {pay_key} in payment_history")
            if delay_key not in repayment_history:
                raise ValueError(f"Missing {delay_key} in repayment_history")

            bill_amt = float(billing_history[bill_key])
            pay_amt = float(payment_history[pay_key])
            delay_val = int(repayment_history[delay_key])

            # 1. Bill vs Payment Trend
            bill_payment_trend.append({
                "month": month_label,
                "bill_amount": bill_amt,
                "payment_amount": pay_amt
            })

            # 2. Payment-to-Bill Ratio Trend
            # If bill amount is 0, safe behavior is to define ratio as 0.
            if bill_amt == 0:
                ratio = 0.0
            else:
                ratio = pay_amt / bill_amt
                
            payment_to_bill_ratio.append({
                "month": month_label,
                "payment_to_bill_ratio": round(ratio, 4)
            })

            # 3. Repayment Delay Trend
            repayment_delay_trend.append({
                "month": month_label,
                "payment_delay": delay_val
            })

        # 4. Historical vs Predicted Credit Limit
        if "current_credit_limit" not in credit_history:
            raise ValueError("Missing current_credit_limit in credit_history")
            
        historical_credit_limit = float(credit_history["current_credit_limit"])
        
        prediction_result = self.prediction_service.predict(customer)
        predicted_credit_limit = prediction_result["predicted_credit_limit"]

        return {
            "customer_id": customer_id,
            "bill_payment_trend": bill_payment_trend,
            "payment_to_bill_ratio": payment_to_bill_ratio,
            "repayment_delay_trend": repayment_delay_trend,
            "credit_limit_comparison": {
                "historical_credit_limit": historical_credit_limit,
                "predicted_credit_limit": predicted_credit_limit
            }
        }
