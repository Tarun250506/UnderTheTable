
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, AdminSession
from app.security import (
    generate_session_token,
    hash_session_token,
)


SESSION_DURATION_HOURS = 8


def create_admin_session(
    admin: AdminUser,
    db: Session,
) -> str:
    """Create a session and store only its token hash."""

    raw_token = generate_session_token()

    session = AdminSession(
        admin_user_id=admin.id,
        token_hash=hash_session_token(raw_token),
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(hours=SESSION_DURATION_HOURS)
        ),
    )

    db.add(session)
    db.commit()

    return raw_token


def get_authenticated_session(
    db: Session,
    raw_token: str,
):
    """Validate a session and return its administrator and session."""

    if not raw_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
        )

    token_hash = hash_session_token(raw_token)

    session = (
        db.query(AdminSession)
        .filter(AdminSession.token_hash == token_hash)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid session.",
        )

    now = datetime.now(timezone.utc)

    # Handle databases that return naive datetimes.
    expires_at = session.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if session.revoked_at is not None or expires_at <= now:
        raise HTTPException(
            status_code=401,
            detail="Session expired or revoked. Please log in again.",
        )

    admin = (
        db.query(AdminUser)
        .filter(AdminUser.id == session.admin_user_id)
        .first()
    )

    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=401,
            detail="Administrator account is inactive.",
        )

    return admin, session


def get_current_admin(
    admin_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> AdminUser:
    """FastAPI dependency for protected administrator routes."""

    admin, _ = get_authenticated_session(db, admin_session or "")
    return admin


def revoke_admin_session(
    db: Session,
    raw_token: str,
) -> None:
    """Revoke a session during logout."""

    if not raw_token:
        return

    token_hash = hash_session_token(raw_token)

    session = (
        db.query(AdminSession)
        .filter(AdminSession.token_hash == token_hash)
        .first()
    )

    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()
