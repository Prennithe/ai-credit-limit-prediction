import copy
from src.mongodb_service import MongoDBService
from src.prediction_service import CreditLimitPredictionService
from src.explainability_service import CreditLimitExplainabilityService
from src.audit_service import AuditService
from src.feature_engineering import customer_document_to_dataframe, engineer_features

def main():
    customer_id = "CUST00001"
    
    print("Testing MongoDB Retrieval...")
    mongo = MongoDBService()
    customer = mongo.get_customer(customer_id)
    if customer is None:
        print("MongoDB Retrieval FAILED: Customer not found.")
        return
    print("MongoDB Retrieval OK.")
    
    print("\nTesting Inference Preprocessing Consistency...")
    # modify customer to test normalization
    test_customer = copy.deepcopy(customer)
    test_customer["profile"]["education"] = 5
    test_customer["profile"]["marriage"] = 4
    
    raw_df = customer_document_to_dataframe(test_customer)
    featured_df = engineer_features(raw_df)
    
    ed_val = featured_df["EDUCATION"].iloc[0]
    mar_val = featured_df["MARRIAGE"].iloc[0]
    
    if ed_val == 4 and mar_val == 3:
        print(f"Preprocessing Consistency OK (EDUCATION normalized to {ed_val}, MARRIAGE normalized to {mar_val}).")
    else:
        print(f"Preprocessing Consistency FAILED (EDUCATION={ed_val}, MARRIAGE={mar_val}).")

    print("\nTesting Prediction Service...")
    predictor = CreditLimitPredictionService()
    pred = predictor.predict(customer)
    print(f"Prediction OK: {pred}")
    
    print("\nTesting SHAP Service...")
    explainer = CreditLimitExplainabilityService()
    shap_df = explainer.explain(customer)
    print(f"SHAP Service OK: Returned {len(shap_df)} feature importances.")
    
    print("\nTesting Audit Service...")
    audit = AuditService()
    decision = audit.save_decision(
        customer_id=customer_id,
        model_prediction=pred["predicted_credit_limit"],
        decision="OVERRIDE",
        final_credit_limit=200000.0,
        reason="Customer has strong recent payment history.",
        officer_id="EMP_999"
    )
    
    retrieved = audit.get_customer_decisions(customer_id)
    if len(retrieved) > 0 and retrieved[0]["officer_id"] == "EMP_999":
        print(f"Audit Service OK: Saved and retrieved decision for {customer_id}.")
    else:
        print("Audit Service FAILED to retrieve correct decision.")
        
    mongo.close()
    audit.close()
    print("\nALL TESTS COMPLETED.")

if __name__ == "__main__":
    main()
