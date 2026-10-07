from src.mongodb_service import MongoDBService


def main():
    mongo = MongoDBService()

    try:
        count = mongo.get_customer_count()

        print(f"Total customers in MongoDB: {count:,}")

        customer_id = "CUST00001"

        customer = mongo.get_customer(customer_id)

        if customer is None:
            print(f"\nCustomer {customer_id} was not found.")
            return

        print(f"\nCustomer {customer_id} retrieved successfully!\n")
        print(customer)

    finally:
        mongo.close()


if __name__ == "__main__":
    main()