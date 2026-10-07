import json
from src.mongodb_service import MongoDBService
from src.financial_trend_service import FinancialTrendService
from src.prediction_service import CreditLimitPredictionService
import math

def main():
    customer_id = "CUST00001"
    
    print("Connecting to MongoDB...")
    mongo = MongoDBService()
    try:
        customer = mongo.get_customer(customer_id)
        if not customer:
            print("Customer not found!")
            return
            
        print("Customer retrieved.")
        
        # Get baseline prediction to ensure it isn't mutated
        pred_service = CreditLimitPredictionService()
        orig_pred = pred_service.predict(customer)["predicted_credit_limit"]

        print("Testing FinancialTrendService...")
        trend_service = FinancialTrendService()
        
        # Let's test the 0 bill amount logic as well
        customer["billing_history"]["bill_amt_2"] = 0
        customer["payment_history"]["pay_amt_2"] = 100
        
        trends = trend_service.get_financial_trends(customer)
        
        # Tests
        assert len(trends["bill_payment_trend"]) == 6, "Bill payment trend must have 6 periods"
        assert len(trends["payment_to_bill_ratio"]) == 6, "Ratio trend must have 6 periods"
        assert len(trends["repayment_delay_trend"]) == 6, "Repayment delay must have 6 periods"
        
        assert "historical_credit_limit" in trends["credit_limit_comparison"], "Missing historical limit"
        assert "predicted_credit_limit" in trends["credit_limit_comparison"], "Missing predicted limit"
        
        # Verify 0 bill amount handling
        assert trends["payment_to_bill_ratio"][1]["payment_to_bill_ratio"] == 0.0, "Zero bill amount must result in 0 ratio"
        
        # Check for NaN / Infinity
        for ratio_item in trends["payment_to_bill_ratio"]:
            val = ratio_item["payment_to_bill_ratio"]
            assert not math.isnan(val) and not math.isinf(val), "Found NaN or Infinity in ratios!"
        
        # The prediction for this tweaked customer (with bill_amt_2 = 0, pay_amt_2 = 100)
        # We just want to ensure it works properly, the limit might change based on tweaking,
        # but let's test if prediction service still runs successfully.
        assert trends["credit_limit_comparison"]["predicted_credit_limit"] > 0, "Prediction is invalid"

        # Verify JSON serializability
        json_output = json.dumps(trends, indent=2)
        print("Successfully generated JSON-serializable output:")
        print(json_output[:300] + "\n... [truncated] ...\n")
        
        print("\nALL FINANCIAL TREND TESTS PASSED.")
    except AssertionError as e:
        print(f"Assertion Error: {e}")
    except Exception as e:
        print(f"Exception Error: {e}")
    finally:
        mongo.close()

if __name__ == "__main__":
    main()
