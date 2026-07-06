from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User
from models.auth import (
    Token,
    UserLogin,
    UserProfile,
    UserProfileUpdate,
    UserRegister,
)
from services.auth_service import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# tokenUrl is only used by Swagger's "Authorize" button; login itself accepts JSON, not form data.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = decode_access_token(token)
    if email is None:
        raise credentials_error
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_error
    return user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        blood_group=payload.blood_group,
        medical_conditions=payload.medical_conditions,
        emergency_contact_name=payload.emergency_contact_name,
        emergency_contact_phone=payload.emergency_contact_phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.email)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=user.email)
    return Token(access_token=token)


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfile)
def update_me(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/checklist")
def get_checklist(current_user: User = Depends(get_current_user)):
    """Return the list of checked preparedness item IDs for the current user."""
    return {"checked_ids": current_user.checklist_progress or []}


@router.patch("/me/checklist")
def update_checklist(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Replace the user's checklist progress with the supplied list.
    Body: { "checked_ids": ["w1", "f2", ...] }
    """
    checked_ids = payload.get("checked_ids")
    if not isinstance(checked_ids, list):
        raise HTTPException(status_code=422, detail="checked_ids must be a list")
    current_user.checklist_progress = checked_ids
    db.commit()
    return {"ok": True, "saved": len(checked_ids)}