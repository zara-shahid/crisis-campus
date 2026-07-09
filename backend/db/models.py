from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from db.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    blood_group = Column(String, nullable=True)
    medical_conditions = Column(JSON, default=list)  # list[str], includes free-text "other" entries

    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)

    # Preparedness checklist — stores list of checked item IDs e.g. ["w1", "f2", "m3"]
    checklist_progress = Column(JSON, default=list)

    help_posts = relationship("HelpPost", back_populates="author", cascade="all, delete-orphan")


class HelpPost(Base):
    __tablename__ = "help_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    status = Column(String, default="open", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    author = relationship("User", back_populates="help_posts")