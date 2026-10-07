from src.mongodb_service import MongoDBService
from src.prediction_service import CreditLimitPredictionService


def main():

    customer_id = "CUST00001"

    mongo = MongoDBService()
    predictor = CreditLimitPredictionService()

    try:

        print("Connecting to MongoDB...")

        customer = mongo.get_customer(customer_id)

        if customer is None:
            print(f"Customer {customer_id} was not found.")
            return

        print(f"Customer {customer_id} retrieved successfully.")

        result = predictor.predict(customer)

        print("\n===================================")
        print("CREDIT LIMIT PREDICTION")
        print("===================================")

        print(
            f"Customer ID: {customer_id}"
        )

        print(
            f"Current Historical Credit Limit: "
            f"{customer['credit_history']['current_credit_limit']}"
        )

        print(
            f"Predicted Credit Limit: "
            f"{result['predicted_credit_limit']}"
        )

        print("===================================")

    finally:
        mongo.close()


if __name__ == "__main__":
    main()