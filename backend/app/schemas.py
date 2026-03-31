from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import PlanType


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmailVerify(BaseModel):
    token: str


# User schemas
class UserBase(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    is_blocked: bool
    is_admin: bool
    plan_type: PlanType
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    plan_type: Optional[PlanType] = None
    is_blocked: Optional[bool] = None
    is_admin: Optional[bool] = None


# Settings schemas
class SettingsUpdate(BaseModel):
    settings: Dict[str, str]


# Service schemas
class NatalChartRequest(BaseModel):
    name: str
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM
    birth_place: str
    latitude: float
    longitude: float


class ForecastRequest(BaseModel):
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM
    birth_place: str
    period: str  # daily, weekly, monthly


class TarotRequest(BaseModel):
    question: str
    spread_type: str  # one_card, three_card, celtic_cross


# Response wrapper
class APIResponse(BaseModel):
    data: Any = None
    message: str = "Success"
