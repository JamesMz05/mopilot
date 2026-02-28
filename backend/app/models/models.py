"""Database models for MoPilot."""
import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(str, enum.Enum):
    ENDKUNDE = "endkunde"
    STATIONSPATE = "stationspate"
    HOTLINE = "hotline"
    BETREIBER = "betreiber"
    FLOTTENMANAGEMENT = "flottenmanagement"
    FAHRZEUGBETREUER = "fahrzeugbetreuer"
    PLATTFORM_SUPPORT = "plattform_support"
    PROJEKTTRAEGER = "projekttraeger"
    FAHRZEUGSTELLER = "fahrzeugsteller"
    VALIDIERUNGSSTELLE = "validierungsstelle"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    operator = Column(String(100), default="zeo")  # zeo or cc (Car&RideSharing Community)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    city = Column(String(100))
    operator = Column(String(100))  # zeo or cc
    latitude = Column(String(20))
    longitude = Column(String(20))
    vehicles_count = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    model = Column(String(255), nullable=False)
    manufacturer = Column(String(255))
    vehicle_type = Column(String(50))  # "BEV", "PHEV"
    station_id = Column(Integer, ForeignKey("stations.id"))
    operator = Column(String(100))
    range_km = Column(Integer)
    seats = Column(Integer, default=5)


class Tariff(Base):
    __tablename__ = "tariffs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    operator = Column(String(100))
    base_fee_monthly = Column(String(50))
    price_per_km = Column(String(50))
    price_per_hour = Column(String(50))
    description = Column(Text)


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100))
    operator = Column(String(100))  # zeo, cc, or general
    target_role = Column(String(50))  # which roles this is relevant for
