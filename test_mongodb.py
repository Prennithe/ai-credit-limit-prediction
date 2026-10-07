import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")

if not uri:
    print("ERROR: MONGODB_URI not found in .env")
    exit()

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    client.admin.command("ping")

    print("MongoDB connection successful!")
    print("Connected to your Atlas cluster.")

    client.close()

except Exception as e:
    print("MongoDB connection failed!")
    print("Error:", e)