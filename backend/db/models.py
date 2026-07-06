from sqlalchemy import Column, Integer, String, JSON
from db.database import Base


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