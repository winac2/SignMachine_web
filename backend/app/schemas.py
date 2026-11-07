from pydantic import BaseModel, Field
from typing import Literal


class CreateSessionRequest(BaseModel):
    gesture_name: str = Field(min_length=1, max_length=50)
    contributor_name: str = Field(
        default="Prefer not to say",
        max_length=60
    )


class Landmark(BaseModel):
    x: float
    y: float
    z: float


class Sample(BaseModel):
    handedness: Literal["Left", "Right"]
    landmarks: list[Landmark] = Field(
        min_length=21,
        max_length=21
    )


class SubmitSamplesRequest(BaseModel):
    feature_schema: Literal["mediapipe_21_xyz_v1"]
    samples: list[Sample] = Field(
        min_length=1,
        max_length=50
    )