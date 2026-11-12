
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    report_type = Column(String(30), nullable=False, index=True)

    violation = Column(String(150), nullable=True)
    authority = Column(String(150), nullable=True)
    consequence = Column(String(150), nullable=True)

    violation_amount_demanded = Column(Float, nullable=True)
    violation_amount_paid = Column(Float, nullable=True)
    fine = Column(Float, nullable=True)

    department = Column(String(150), nullable=True)
    service = Column(String(250), nullable=True)

    service_amount_demanded = Column(Float, nullable=True)
    service_amount_paid = Column(Float, nullable=True)
    official_fee = Column(Float, nullable=True)

    state = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)

    incident_date = Column(Date, nullable=True)
    outcome = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)

    publication_consent = Column(Boolean, default=False, nullable=False)
    moderation_status = Column(
        String(30), default="pending", nullable=False, index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id = Column(Integer, primary_key=True, index=True)

    admin_user_id = Column(
        Integer,
        ForeignKey("admin_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    token_hash = Column(String(64), unique=True, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)


class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(Integer, primary_key=True, index=True)

    admin_user_id = Column(
        Integer,
        ForeignKey("admin_users.id"),
        nullable=False,
        index=True,
    )

    report_id = Column(
        Integer,
        ForeignKey("reports.id"),
        nullable=False,
        index=True,
    )

    action = Column(String(30), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)



class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    identifier_hash = Column(String(64), unique=True, nullable=False, index=True)
    failed_attempts = Column(Integer, default=0, nullable=False)
    window_started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
