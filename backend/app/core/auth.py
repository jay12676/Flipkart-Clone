from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User

_google_request = google_requests.Request()


def _upsert_user(db: Session, firebase_uid: str, email: str | None) -> int:
    user = db.scalar(select(User).where(User.firebase_uid == firebase_uid))
    if user is None:
        user = User(firebase_uid=firebase_uid, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user.id

    if email and user.email != email:
        user.email = email
        db.commit()
    return user.id


def current_user_id(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> int:
    settings = get_settings()

    if not settings.FIREBASE_PROJECT_ID:
        return settings.DEFAULT_USER_ID

    if not authorization:
        return settings.DEFAULT_USER_ID

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be a Bearer token",
        )

    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = id_token.verify_firebase_token(
            token,
            _google_request,
            audience=settings.FIREBASE_PROJECT_ID,
        )
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {exc}",
        ) from exc

    firebase_uid = claims.get("sub") or claims.get("user_id")
    if not firebase_uid:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Token has no subject",
        )

    return _upsert_user(db, firebase_uid, claims.get("email"))
