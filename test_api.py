from fastapi.testclient import TestClient
from src.api.main import app
import json

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_customer():
    response = client.get("/customers/CUST00001")
    assert response.status_code == 200
    customer = response.json()
    assert customer["customer_id"] == "CUST00001"
    # Ensure json serializable
    json.dumps(customer)

def test_get_prediction():
    response = client.get("/customers/CUST00001/prediction")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_credit_limit" in data

def test_financial_trends():
    response = client.get("/customers/CUST00001/financial-trends")
    assert response.status_code == 200
    data = response.json()
    assert "bill_payment_trend" in data
    assert "payment_to_bill_ratio" in data
    assert "repayment_delay_trend" in data
    assert "credit_limit_comparison" in data

def test_explanation():
    response = client.get("/customers/CUST00001/explanation")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert "base_value" in data
    assert isinstance(data["features"], list)

def test_simulate():
    overrides = {
        "age": 40,
        "pay_amt_1": 50000
    }
    response = client.post("/customers/CUST00001/simulate", json=overrides)
    assert response.status_code == 200
    data = response.json()
    assert "baseline_prediction" in data
    assert "simulated_prediction" in data

def test_decision():
    decision_payload = {
        "decision": "ACCEPT",
        "final_credit_limit": 70000.0,
        "reason": "API integration test",
        "officer_id": "API_TEST_OFFICER"
    }
    response = client.post("/customers/CUST00001/decision", json=decision_payload)
    assert response.status_code == 200

def test_get_decisions():
    response = client.get("/customers/CUST00001/decisions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_recent_audit():
    response = client.get("/audit/recent")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_invalid_customer():
    response = client.get("/customers/INVALID_CUSTOMER")
    assert response.status_code == 404

def test_invalid_simulate():
    overrides = {
        "customer_id": "CUST99999" # invalid override
    }
    response = client.post("/customers/CUST00001/simulate", json=overrides)
    assert response.status_code == 400

def test_run_all():
    print("Running API integration tests...")
    
    test_health()
    print("1. test_health: PASSED")
    
    test_get_customer()
    print("2. test_get_customer: PASSED")
    
    test_get_prediction()
    print("3. test_get_prediction: PASSED")
    
    test_financial_trends()
    print("4. test_financial_trends: PASSED")
    
    test_explanation()
    print("5. test_explanation: PASSED")
    
    test_simulate()
    print("6. test_simulate: PASSED")
    
    test_decision()
    print("7. test_decision: PASSED")
    
    test_get_decisions()
    print("8. test_get_decisions: PASSED")
    
    test_recent_audit()
    print("9. test_recent_audit: PASSED")
    
    test_invalid_customer()
    print("10. test_invalid_customer: PASSED")
    
    test_invalid_simulate()
    print("11. test_invalid_simulate: PASSED")
    
    # 12. Verify JSON serializability is inherently tested by FastAPI's TestClient response.json()
    # 13. Verify what-if doesn't modify mongodb:
    res = client.get("/customers/CUST00001")
    customer_state = res.json()
    assert customer_state["profile"]["age"] != 40, "MongoDB modified by simulation!"
    print("12 & 13. MongoDB unmodified & JSON valid: PASSED")

    print("\nALL API TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    test_run_all()
