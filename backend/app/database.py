
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "signmachine_community"
)

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not configured!")

# Create MongoDB client
client = AsyncMongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=15000
)

# Select database
db = client[MONGODB_DATABASE]


async def initialize_database():
    # Check connection
    await client.admin.command("ping")

    print("Connected to MongoDB successfully!")

    # Create indexes
    await db.contributors.create_index(
        "contributor_id",
        unique=True
    )

    await db.gestures.create_index(
        "name",
        unique=True
    )

    await db.collection_sessions.create_index(
        "session_id",
        unique=True
    )

    await db.collection_sessions.create_index(
        "contributor_id"
    )

    await db.samples.create_index([
        ("session_id", 1),
        ("created_at", 1)
    ])

    await db.samples.create_index([
        ("gesture_name", 1),
        ("review_status", 1)
    ])

    await db.samples.create_index(
        "contributor_id"
    )

    await db.dataset_versions.create_index(
        "version",
        unique=True
    )

    # Initialize default gestures
    default_gestures = [
        ("drink", "Drink gesture"),
        ("hello", "Hello gesture"),
        ("hot", "Hot gesture"),
        ("iced", "Iced gesture"),
        ("thanks", "Thanks gesture")
    ]

    for name, description in default_gestures:
        await db.gestures.update_one(
            {"name": name},
            {
                "$setOnInsert": {
                    "name": name,
                    "description": description,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )

    print("Database collections initialized!")

"""
Code	Chức năng
AsyncMongoClient	Kết nối MongoDB bất đồng bộ
client[DATABASE]	Chọn database
create_index()	Tạo index để tối ưu truy vấn
update_one()	Thêm hoặc cập nhật gesture
upsert=True	Không có thì tạo mới
$setOnInsert	Chỉ thiết lập dữ liệu khi document được tạo"""