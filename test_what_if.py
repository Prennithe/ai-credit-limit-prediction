import json
import copy
from src.mongodb_service import MongoDBService
from src.what_if_service import WhatIfSimulationService

def main():
    customer_id = "CUST00001"
    
    print("Connecting to MongoDB...")
    mongo = MongoDBService()
    try:
        customer = mongo.get_customer(customer_id)
        if not customer:
            print("Customer CUST00001 not found!")
            return
            
        initial_customer_snapshot = copy.deepcopy(customer)
        simulator = WhatIfSimulationService()
        
        # TEST 1: Simulation with no changes
        print("Running TEST 1: No changes...")
        res1 = simulator.simulate(customer, {})
        assert res1["baseline_prediction"] == res1["simulated_prediction"], "TEST 1 FAILED: predictions should match"
        assert res1["prediction_change"] == 0.0, "TEST 1 FAILED: change should be 0"
        assert len(res1["applied_changes"]) == 0, "TEST 1 FAILED: applied_changes should be empty"
        print("TEST 1 PASSED.")

        # TEST 2: Change profile field (age)
        print("Running TEST 2: Change age...")
        res2 = simulator.simulate(customer, {"age": 50})
        assert res2["baseline_prediction"] != 0, "TEST 2 FAILED"
        assert "age" in res2["applied_changes"], "TEST 2 FAILED: age should be in applied_changes"
        assert res2["applied_changes"]["age"]["original"] == initial_customer_snapshot["profile"]["age"]
        assert res2["applied_changes"]["age"]["simulated"] == 50
        print("TEST 2 PASSED.")

        # TEST 3: Change repayment field (pay_0)
        print("Running TEST 3: Change pay_0...")
        target_pay_0 = 0 if initial_customer_snapshot["repayment_history"]["pay_0"] == 2 else 2
        res3 = simulator.simulate(customer, {"pay_0": target_pay_0})
        assert "pay_0" in res3["applied_changes"], "TEST 3 FAILED"
        assert res3["applied_changes"]["pay_0"]["simulated"] == target_pay_0
        print("TEST 3 PASSED.")

        # TEST 4: Change financial field (pay_amt_1)
        print("Running TEST 4: Change pay_amt_1...")
        res4 = simulator.simulate(customer, {"pay_amt_1": 50000})
        assert "pay_amt_1" in res4["applied_changes"], "TEST 4 FAILED"
        assert res4["applied_changes"]["pay_amt_1"]["simulated"] == 50000.0
        print("TEST 4 PASSED.")

        # TEST 5: Attempt to modify customer_id
        print("Running TEST 5: Protected field customer_id...")
        try:
            simulator.simulate(customer, {"customer_id": "CUST99999"})
            print("TEST 5 FAILED: Exception not raised")
        except ValueError as e:
            print(f"TEST 5 PASSED: Correctly caught error -> '{e}'")

        # TEST 6: Attempt to modify current_credit_limit
        print("Running TEST 6: Protected field current_credit_limit...")
        try:
            simulator.simulate(customer, {"current_credit_limit": 500000})
            print("TEST 6 FAILED: Exception not raised")
        except ValueError as e:
            print(f"TEST 6 PASSED: Correctly caught error -> '{e}'")

        # TEST 7: Attempt unknown field
        print("Running TEST 7: Unknown field...")
        try:
            simulator.simulate(customer, {"unknown_field_123": 100})
            print("TEST 7 FAILED: Exception not raised")
        except ValueError as e:
            print(f"TEST 7 PASSED: Correctly caught error -> '{e}'")

        # TEST 8: Verify MongoDB data is unchanged
        print("Running TEST 8: Verify MongoDB data is unchanged...")
        re_fetched_customer = mongo.get_customer(customer_id)
        assert re_fetched_customer["profile"]["age"] == initial_customer_snapshot["profile"]["age"], "TEST 8 FAILED: age changed in DB!"
        assert re_fetched_customer["repayment_history"]["pay_0"] == initial_customer_snapshot["repayment_history"]["pay_0"], "TEST 8 FAILED: pay_0 changed in DB!"
        assert re_fetched_customer["payment_history"]["pay_amt_1"] == initial_customer_snapshot["payment_history"]["pay_amt_1"], "TEST 8 FAILED: pay_amt_1 changed in DB!"
        print("TEST 8 PASSED: MongoDB records remained strictly intact.")

        # TEST 9: Verify complete response serialization with json.dumps()
        print("Running TEST 9: JSON serialization...")
        json_output = json.dumps(res4, indent=2)
        print("TEST 9 PASSED: Response successfully serialized to JSON:")
        print(json_output)

        print("\nALL WHAT-IF SIMULATION TESTS PASSED SUCCESSFULLY.")
    finally:
        mongo.close()

if __name__ == "__main__":
    main()
