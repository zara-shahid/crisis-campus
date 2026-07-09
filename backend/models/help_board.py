from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class HelpCategory(str, Enum):
    water = "water"
    food = "food"
    shelter = "shelter"
    rides = "rides"


class HelpPostStatus(str, Enum):
    open = "open"
    fulfilled = "fulfilled"


class HelpPostCreate(BaseModel):
    category: HelpCategory
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=10, max_length=1000)
    location: str | None = Field(default=None, max_length=200)
    contact_phone: str | None = Field(default=None, max_length=30)


class HelpPostOut(BaseModel):
    id: int
    category: HelpCategory
    title: str
    description: str
    location: str | None = None
    contact_phone: str | None = None
    status: HelpPostStatus
    author_name: str
    author_id: int
    created_at: datetime
    is_mine: bool = False

    model_config = {"from_attributes": True}
