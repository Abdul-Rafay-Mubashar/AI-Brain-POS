import os
from dotenv import load_dotenv

load_dotenv()
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_DB_URL")

client = AsyncIOMotorClient(MONGO_URI)
DB_NAME = os.getenv("DB_NAME")
db = client[DB_NAME]
products_collection = db["products"]