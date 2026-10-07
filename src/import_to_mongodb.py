
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = PROJECT_ROOT / "data" / "UCI_Credit_Card.csv"
ENV_PATH = PROJECT_ROOT / ".env"

DATABASE_NAME = "credit_limit_system"
COLLECTION_NAME = "customers"
BATCH_SIZE = 1000

# Load MongoDB credentials
load_dotenv(ENV_PATH)
MONGODB_URI = os.getenv("MONGODB_URI")

# Required source columns
REQUIRED_COLUMNS = [
    "ID", "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE",
    "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6",
    "BILL_AMT1", "BILL_AMT2", "BILL_AMT3",
    "BILL_AMT4", "BILL_AMT5", "BILL_AMT6",
    "PAY_AMT1", "PAY_AMT2", "PAY_AMT3",
    "PAY_AMT4", "PAY_AMT5", "PAY_AMT6",
]


def number(value):
    """Convert a CSV numeric value into a regular Python number."""
    if pd.isna(value):
        raise ValueError("The dataset contains a missing numeric value.")

    value = float(value)
    return int(value) if value.is_integer() else value


def create_customer_document(row):
    """Convert one dataset row into a simulated bank customer."""

    source_id = number(row["ID"])

    if not float(source_id).is_integer():
        raise ValueError(f"Invalid customer source ID: {source_id}")

    customer_id = f"CUST{int(source_id):05d}"

    return {
        "customer_id": customer_id,

        "profile": {
            "age": number(row["AGE"]),
            "sex": number(row["SEX"]),
            "education": number(row["EDUCATION"]),
            "marriage": number(row["MARRIAGE"]),
        },

        "credit_history": {
            # Historical assigned limit; display/comparison only.
            "current_credit_limit": number(row["LIMIT_BAL"]),
        },

        "billing_history": {
            f"bill_amt_{i}": number(row[f"BILL_AMT{i}"])
            for i in range(1, 7)
        },

        "payment_history": {
            f"pay_amt_{i}": number(row[f"PAY_AMT{i}"])
            for i in range(1, 7)
        },

        "repayment_history": {
            "pay_0": number(row["PAY_0"]),
            **{
                f"pay_{i}": number(row[f"PAY_{i}"])
                for i in range(2, 7)
            },
        },

        "record_source": "simulated_bank_dataset",
    }


def main():
    if not MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is missing. Check the .env file."
        )

    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {CSV_PATH}"
        )

    # Read and validate the source dataset.
    print("Reading the original dataset...")
    df = pd.read_csv(CSV_PATH)

    missing = sorted(set(REQUIRED_COLUMNS) - set(df.columns))
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    if df.empty:
        raise ValueError("The source dataset is empty.")

    if df["ID"].isna().any() or df["ID"].duplicated().any():
        raise ValueError("Source IDs must be present and unique.")

    # Validate numeric data before connecting and importing.
    numeric_columns = REQUIRED_COLUMNS
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="raise")

    print(f"Source records: {len(df):,}")

    client = None

    try:
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,
        )

        # Verify the connection before writing anything.
        client.admin.command("ping")
        print("MongoDB Atlas connection successful.")

        db = client[DATABASE_NAME]
        customers = db[COLLECTION_NAME]

        # Ensure customer IDs cannot be duplicated.
        customers.create_index(
            "customer_id",
            unique=True,
        )

        imported_or_updated = 0

        # Upserts make rerunning this script safe:
        # existing customer IDs are updated, not duplicated.
        for start in range(0, len(df), BATCH_SIZE):
            batch = df.iloc[start:start + BATCH_SIZE]

            operations = [
                UpdateOne(
                    {"customer_id": document["customer_id"]},
                    {"$set": document},
                    upsert=True,
                )
                for document in (
                    create_customer_document(row)
                    for _, row in batch.iterrows()
                )
            ]

            customers.bulk_write(operations, ordered=False)
            imported_or_updated += len(operations)

            print(
                f"Processed {imported_or_updated:,}"
                f" / {len(df):,} records"
            )

        # Verify the imported collection.
        total = customers.count_documents({})
        sample = customers.find_one(
            {"customer_id": "CUST00001"},
            {"_id": 0, "customer_id": 1, "profile": 1,
             "credit_history": 1},
        )

        print("\nImport completed successfully.")
        print(f"Database: {DATABASE_NAME}")
        print(f"Collection: {COLLECTION_NAME}")
        print(f"Customers processed: {imported_or_updated:,}")
        print(f"Total documents in collection: {total:,}")
        print(f"Sample customer found: {sample is not None}")

        if sample:
            print("Sample customer:", sample)

        if total != len(df):
            print(
                "WARNING: Collection count differs from the "
                "CSV row count. Check for pre-existing records."
            )

    finally:
        if client is not None:
            client.close()


if __name__ == "__main__":
    main()