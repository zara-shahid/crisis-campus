from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import HelpPost, User
from models.help_board import HelpCategory, HelpPostCreate, HelpPostOut, HelpPostStatus
from routers.auth import get_current_user
from services.auth_service import decode_access_token

router = APIRouter(prefix="/api/help-posts", tags=["help-board"])

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def get_optional_user(
    token: Annotated[str | None, Depends(oauth2_scheme_optional)],
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    email = decode_access_token(token)
    if email is None:
        return None
    return db.query(User).filter(User.email == email).first()


def _ensure_utc(dt: datetime) -> datetime:
    """Naive datetimes from the DB are treated as UTC for correct client display."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _serialize_post(post: HelpPost, current_user: User | None) -> HelpPostOut:
    return HelpPostOut(
        id=post.id,
        category=post.category,
        title=post.title,
        description=post.description,
        location=post.location,
        contact_phone=post.contact_phone,
        status=post.status,
        author_name=post.author.name,
        author_id=post.user_id,
        created_at=_ensure_utc(post.created_at),
        is_mine=current_user is not None and post.user_id == current_user.id,
    )


@router.get("", response_model=list[HelpPostOut])
def list_help_posts(
    category: HelpCategory | None = Query(default=None),
    status_filter: HelpPostStatus | None = Query(default=HelpPostStatus.open, alias="status"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    query = db.query(HelpPost).order_by(HelpPost.created_at.desc())
    if category:
        query = query.filter(HelpPost.category == category.value)
    if status_filter:
        query = query.filter(HelpPost.status == status_filter.value)
    posts = query.all()
    return [_serialize_post(post, current_user) for post in posts]


@router.post("", response_model=HelpPostOut, status_code=status.HTTP_201_CREATED)
def create_help_post(
    payload: HelpPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = HelpPost(
        user_id=current_user.id,
        category=payload.category.value,
        title=payload.title.strip(),
        description=payload.description.strip(),
        location=payload.location.strip() if payload.location else None,
        contact_phone=payload.contact_phone.strip() if payload.contact_phone else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post, current_user)


@router.patch("/{post_id}/fulfill", response_model=HelpPostOut)
def fulfill_help_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(HelpPost).filter(HelpPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own posts")
    post.status = HelpPostStatus.fulfilled.value
    db.commit()
    db.refresh(post)
    return _serialize_post(post, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_help_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(HelpPost).filter(HelpPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    db.delete(post)
    db.commit()
