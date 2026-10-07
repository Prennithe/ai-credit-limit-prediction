import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

DATABASE_NAME = "credit_limit_system"
COLLECTION_NAME = "audit_logs"

load_dotenv(ENV_PATH)

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI not found in .env")


class AuditService:
    def __init__(self):
        self.client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000
        )

        # Verify connection
        self.client.admin.command("ping")

        self.db = self.client[DATABASE_NAME]
        self.audit_logs = self.db[COLLECTION_NAME]
        
        # Create an appropriate index for customer_id and timestamp
        self.audit_logs.create_index([("customer_id", 1), ("timestamp", -1)])

    def save_decision(
        self,
        customer_id: str,
        model_prediction: float,
        decision: str,
        final_credit_limit: float,
        reason: str,
        officer_id: str
    ):
        """Save a new decision log."""
        record = {
            "customer_id": customer_id,
            "model_prediction": float(model_prediction),
            "decision": decision,
            "final_credit_limit": float(final_credit_limit),
            "reason": reason,
            "officer_id": officer_id,
            "timestamp": datetime.now(timezone.utc)
        }
        self.audit_logs.insert_one(record)
        return record

    def get_customer_decisions(self, customer_id: str):
        """Get all decisions for a specific customer."""
        return list(self.audit_logs.find(
            {"customer_id": customer_id},
            {"_id": 0}
        ).sort("timestamp", -1))

    def get_recent_decisions(self, limit: int = 10):
        """Get most recent decisions across all customers."""
        return list(self.audit_logs.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit))

    def close(self):
        """Close the MongoDB connection."""
        self.client.close()
