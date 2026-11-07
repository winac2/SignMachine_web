
from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    client,
    db,
    initialize_database
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Startup
    await initialize_database()

    app.state.db = db

    yield

    # Shutdown
    await client.close()


app = FastAPI(
    title="Sign Machine Community API",
    description="Community Data Collection Platform",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        frontend_url,
        ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/")
async def home():
    return {
        "project": "Sign Machine Community",
        "message": "API is running!"
    }


@app.get("/health")
async def health(request: Request):

    await request.app.state.db.command("ping")

    return {
        "status": "healthy",
        "database": "connected"
    }


@app.get("/api/gestures")
async def get_gestures(request: Request):

    cursor = request.app.state.db.gestures.find(
        {"is_active": True},
        {
            "_id": 0,
            "name": 1,
            "description": 1
        }
    )

    gestures = await cursor.to_list(length=100)

    return {
        "total": len(gestures),
        "gestures": gestures
    }

import uuid
import math

from datetime import datetime, timezone
from fastapi import HTTPException

from app.schemas import (
    CreateSessionRequest,
    SubmitSamplesRequest
)

# Giả định database.py export biến db
from app.database import db


# ==========================================
# CREATE CONTRIBUTION SESSION
# ==========================================

@app.post("/api/sessions")
async def create_session(data: CreateSessionRequest):

    gesture = await db.gestures.find_one({
        "name": data.gesture_name
    })

    if not gesture:
        raise HTTPException(
            status_code=404,
            detail="Gesture not found"
        )

    contributor_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())

    contributor_name = (
        data.contributor_name.strip()
        or "Prefer not to say"
    )

    now = datetime.now(timezone.utc)

    await db.contributors.insert_one({
        "contributor_id": contributor_id,
        "contributor_name": contributor_name,
        "created_at": now
    })

    await db.collection_sessions.insert_one({
        "session_id": session_id,
        "contributor_id": contributor_id,
        "gesture_name": data.gesture_name,
        "status": "collecting",
        "sample_count": 0,
        "created_at": now
    })

    return {
        "session_id": session_id,
        "contributor_id": contributor_id,
        "gesture_name": data.gesture_name,
        "contributor_name": contributor_name,
        "status": "collecting"
    }


# ==========================================
# SUBMIT LANDMARK SAMPLES
# ==========================================

@app.post("/api/sessions/{session_id}/samples")
async def submit_samples(
    session_id: str,
    data: SubmitSamplesRequest
):

    session = await db.collection_sessions.find_one({
        "session_id": session_id,
        "status": "collecting"
    })

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or closed"
        )

    documents = []
    now = datetime.now(timezone.utc)

    for sample in data.samples:

        landmarks = [
            point.model_dump()
            for point in sample.landmarks
        ]

        # Reject NaN and Infinity
        for point in landmarks:
            if not all(
                math.isfinite(point[key])
                for key in ("x", "y", "z")
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid landmark values"
                )

        # x and y are normalized image coordinates
        for point in landmarks:
            if not (
                0 <= point["x"] <= 1
                and 0 <= point["y"] <= 1
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid normalized coordinates"
                )

        documents.append({
            "session_id": session_id,
            "contributor_id": session["contributor_id"],
            "gesture_name": session["gesture_name"],
            "handedness": sample.handedness,
            "landmarks": landmarks,
            "feature_schema": data.feature_schema,
            "review_status": "pending",
            "created_at": now
        })

    if documents:
        await db.samples.insert_many(documents)

        await db.collection_sessions.update_one(
            {"session_id": session_id},
            {"$inc": {"sample_count": len(documents)}}
        )

    return {
        "success": True,
        "received": len(documents)
    }
    
@app.post("/api/sessions/{session_id}/complete")
async def complete_session(session_id: str):

    result = await db.collection_sessions.update_one(
        {
            "session_id": session_id,
            "status": "collecting"
        },
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Active session not found"
        )

    return {"success": True, "status": "completed"}