from src.mongodb_service import MongoDBService
from src.explainability_service import (
    CreditLimitExplainabilityService
)


def main():

    customer_id = "CUST00001"

    mongo = MongoDBService()
    explainer = CreditLimitExplainabilityService()

    try:

        customer = mongo.get_customer(customer_id)

        if customer is None:
            print(f"Customer {customer_id} was not found.")
            return

        print(
            f"Customer {customer_id} retrieved successfully."
        )

        explanation = explainer.explain(customer)

        print("\n==========================================")
        print("TOP SHAP FEATURES")
        print("==========================================")

        for _, row in explanation.head(10).iterrows():

            direction = (
                "increased"
                if row["shap_value"] > 0
                else "decreased"
            )

            print(
                f"{row['feature']}: "
                f"{direction} prediction "
                f"(SHAP = {row['shap_value']:.2f})"
            )

        print("==========================================")

    finally:
        mongo.close()


if __name__ == "__main__":
    main()