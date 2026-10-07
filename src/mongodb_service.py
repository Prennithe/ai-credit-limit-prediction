import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

DATABASE_NAME = "credit_limit_system"
COLLECTION_NAME = "customers"

load_dotenv(ENV_PATH)

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI not found in .env")


class MongoDBService:
    def __init__(self):
        self.client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000
        )

        # Verify connection
        self.client.admin.command("ping")

        self.db = self.client[DATABASE_NAME]
        self.customers = self.db[COLLECTION_NAME]

    def get_customer(self, customer_id):
        """Retrieve one customer by application customer ID."""
        return self.customers.find_one(
            {"customer_id": customer_id},
            {"_id": 0}
        )

    def get_customer_count(self):
        """Return the total number of customers."""
        return self.customers.count_documents({})

    def close(self):
        """Close the MongoDB connection."""
        self.client.close()