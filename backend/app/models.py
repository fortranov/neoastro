from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from .database import Base


class PlanType(str, enum.Enum):
    trial = "trial"
    basic = "basic"
    pro = "pro"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    plan_type = Column(SAEnum(PlanType), default=PlanType.trial)
    google_id = Column(String, nullable=True, unique=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Settings(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False, default="")
