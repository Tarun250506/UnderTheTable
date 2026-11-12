
import os
from pathlib import Path
from datetime import datetime, timezone
import hashlib
from datetime import timedelta
from app.models import LoginAttempt

from dotenv import load_dotenv

# Load environment variables before importing application modules.
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Report, AdminUser, ModerationLog
from app.schemas import ReportCreate, ModerationUpdate, AdminLogin
from app.auth import (
    create_admin_session,
    get_current_admin,
    revoke_admin_session,
)
from app.security import (
    verify_password,
    password_needs_rehash,
    hash_password,
)


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ADMIN_COOKIE_NAME = "admin_session"

ADMIN_COOKIE_SECURE = (
    os.getenv("ADMIN_COOKIE_SECURE", "false").lower() == "true"
)

ADMIN_SESSION_HOURS = 8

ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "ADMIN_ALLOWED_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]


app = FastAPI(
    title="UnderTheTable API",
    description="API for citizen-reported unofficial payment experiences.",
    version="0.5.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)


# --------------------------------------------------
# SECURITY HELPERS
# --------------------------------------------------

def require_trusted_origin(request: Request):
    """
    Reject browser requests from origins not explicitly trusted.

    This is used for cookie-authenticated state-changing requests.
    """

    origin = request.headers.get("origin", "").rstrip("/")

    if not origin or origin not in ALLOWED_ORIGINS:
        raise HTTPException(
            status_code=403,
            detail="Request origin is not permitted.",
        )


def set_admin_cookie(response: Response, token: str):
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        max_age=ADMIN_SESSION_HOURS * 60 * 60,
        httponly=True,
        secure=ADMIN_COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def clear_admin_cookie(response: Response):
    response.delete_cookie(
        key=ADMIN_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=ADMIN_COOKIE_SECURE,
        samesite="lax",
    )


LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_MINUTES = 15
LOGIN_LOCKOUT_MINUTES = 15


def get_login_identifier(email: str) -> str:
    normalized_email = email.strip().lower()
    return hashlib.sha256(normalized_email.encode()).hexdigest()


def check_login_lockout(email: str, db: Session):
    identifier = get_login_identifier(email)

    attempt = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.identifier_hash == identifier)
        .first()
    )

    if not attempt:
        return

    now = datetime.now(timezone.utc)
    locked_until = attempt.locked_until

    if locked_until and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)

    if locked_until and locked_until > now:
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Try again later.",
            headers={"Retry-After": str(max(1, int((locked_until - now).total_seconds())))},
        )


def record_failed_login(email: str, db: Session):
    identifier = get_login_identifier(email)
    now = datetime.now(timezone.utc)

    attempt = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.identifier_hash == identifier)
        .with_for_update()
        .first()
    )

    if not attempt:
        attempt = LoginAttempt(
            identifier_hash=identifier,
            failed_attempts=1,
            window_started_at=now,
        )
        db.add(attempt)
    else:
        window_start = attempt.window_started_at

        if window_start.tzinfo is None:
            window_start = window_start.replace(tzinfo=timezone.utc)

        if now - window_start > timedelta(minutes=LOGIN_WINDOW_MINUTES):
            attempt.failed_attempts = 1
            attempt.window_started_at = now
            attempt.locked_until = None
        else:
            attempt.failed_attempts += 1

    if attempt.failed_attempts >= LOGIN_MAX_ATTEMPTS:
        attempt.locked_until = now + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)

    attempt.updated_at = now
    db.commit()


def clear_failed_logins(email: str, db: Session):
    identifier = get_login_identifier(email)

    db.query(LoginAttempt).filter(
        LoginAttempt.identifier_hash == identifier
    ).delete(synchronize_session=False)

    db.commit()

# --------------------------------------------------
# ROOT AND HEALTH
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "UnderTheTable API",
        "status": "running",
    }


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed.",
        )


# --------------------------------------------------
# ADMIN AUTHENTICATION
# --------------------------------------------------

@app.post("/api/admin/login")
def admin_login(
    login: AdminLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)

    email = login.email.strip().lower()
    check_login_lockout(email, db)

    admin = (
        db.query(AdminUser)
        .filter(AdminUser.email == email)
        .first()
    )

    # Use the same error for incorrect email and password.
    if (
        not admin
        or not admin.is_active
        or not verify_password(login.password, admin.password_hash)
    ):
        record_failed_login(email, db)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )
    clear_failed_logins(email, db)

    # Upgrade older password hashes when necessary.
    if password_needs_rehash(admin.password_hash):
        admin.password_hash = hash_password(login.password)
        db.commit()

    try:
        token = create_admin_session(admin, db)
        set_admin_cookie(response, token)

        return {
            "success": True,
            "message": "Login successful.",
            "admin": {
                "id": admin.id,
                "email": admin.email,
            },
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to create administrator session.",
        )


@app.get("/api/admin/me")
def get_admin_profile(
    admin: AdminUser = Depends(get_current_admin),
):
    return {
        "authenticated": True,
        "admin": {
            "id": admin.id,
            "email": admin.email,
        },
    }


@app.post("/api/admin/logout")
def admin_logout(
    request: Request,
    response: Response,
    admin_session: str | None = None,
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)

    # Read the session cookie directly from the request.
    token = request.cookies.get(ADMIN_COOKIE_NAME)

    if token:
        try:
            revoke_admin_session(db, token)
        except SQLAlchemyError:
            db.rollback()

            raise HTTPException(
                status_code=500,
                detail="Unable to end administrator session.",
            )

    clear_admin_cookie(response)

    return {
        "success": True,
        "message": "Logged out successfully.",
    }


# --------------------------------------------------
# PUBLIC REPORT SUBMISSION
# --------------------------------------------------

@app.post("/api/reports", status_code=201)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
):
    try:
        new_report = Report(**report.model_dump())

        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "success": True,
            "message": "Report received and stored successfully.",
            "report_id": new_report.id,
            "moderation_status": new_report.moderation_status,
            "persisted": True,
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to store report. Please try again later.",
        )


# --------------------------------------------------
# ADMIN: VIEW PENDING REPORTS
# --------------------------------------------------

@app.get("/api/admin/reports")
def get_pending_reports(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .filter(Report.moderation_status == "pending")
        .order_by(Report.created_at.desc())
        .limit(100)
        .all()
    )

    return [
        {
            "id": report.id,
            "report_type": report.report_type,
            "violation": report.violation,
            "authority": report.authority,
            "consequence": report.consequence,
            "violation_amount_demanded": report.violation_amount_demanded,
            "violation_amount_paid": report.violation_amount_paid,
            "fine": report.fine,
            "department": report.department,
            "service": report.service,
            "service_amount_demanded": report.service_amount_demanded,
            "service_amount_paid": report.service_amount_paid,
            "official_fee": report.official_fee,
            "state": report.state,
            "city": report.city,
            "incident_date": report.incident_date,
            "outcome": report.outcome,
            "description": report.description,
            "publication_consent": report.publication_consent,
            "created_at": report.created_at,
        }
        for report in reports
    ]


# --------------------------------------------------
# ADMIN: APPROVE OR REJECT REPORTS
# --------------------------------------------------

@app.patch("/api/admin/reports/{report_id}/moderation")
def update_moderation(
    report_id: int,
    update: ModerationUpdate,
    request: Request,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    require_trusted_origin(request)

    report = (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    if report.moderation_status != "pending":
        raise HTTPException(
            status_code=409,
            detail="This report has already been reviewed.",
        )

    try:
        report.moderation_status = update.status

        # Record which administrator performed the action.
        audit_entry = ModerationLog(
            admin_user_id=admin.id,
            report_id=report.id,
            action=update.status,
        )

        db.add(audit_entry)

        # Save moderation and audit record in one transaction.
        db.commit()
        db.refresh(report)

        return {
            "success": True,
            "report_id": report.id,
            "moderation_status": report.moderation_status,
            "moderated_by": admin.email,
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update moderation status.",
        )


# --------------------------------------------------
# PUBLIC: APPROVED REPORTS
# --------------------------------------------------

@app.get("/api/public/reports")
def get_public_reports(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .filter(
            Report.moderation_status == "approved",
            Report.publication_consent.is_(True),
        )
        .order_by(Report.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": report.id,
            "report_type": report.report_type,
            "violation": report.violation,
            "authority": report.authority,
            "consequence": report.consequence,
            "violation_amount_demanded": report.violation_amount_demanded,
            "violation_amount_paid": report.violation_amount_paid,
            "fine": report.fine,
            "department": report.department,
            "service": report.service,
            "service_amount_demanded": report.service_amount_demanded,
            "service_amount_paid": report.service_amount_paid,
            "official_fee": report.official_fee,
            "state": report.state,
            "city": report.city,
            "incident_date": report.incident_date,
            "outcome": report.outcome,
            "created_at": report.created_at,
        }
        for report in reports
    ]


# --------------------------------------------------
# PUBLIC: PLATFORM STATISTICS
# --------------------------------------------------

@app.get("/api/public/stats")
def get_public_stats(
    db: Session = Depends(get_db),
):
    reports = (
        db.query(Report)
        .filter(
            Report.moderation_status == "approved",
            Report.publication_consent.is_(True),
        )
        .all()
    )

    demanded_amounts = []
    departments = set()
    states = set()

    for report in reports:
        states.add(report.state.strip().lower())

        if report.department:
            departments.add(report.department.strip().lower())

        if report.authority:
            departments.add(report.authority.strip().lower())

        if report.violation_amount_demanded is not None:
            demanded_amounts.append(
                report.violation_amount_demanded
            )

        if report.service_amount_demanded is not None:
            demanded_amounts.append(
                report.service_amount_demanded
            )

    demanded_amounts.sort()

    median_amount = None

    if demanded_amounts:
        count = len(demanded_amounts)
        middle = count // 2

        if count % 2 == 1:
            median_amount = demanded_amounts[middle]
        else:
            median_amount = (
                demanded_amounts[middle - 1]
                + demanded_amounts[middle]
            ) / 2

    return {
        "reports_submitted": len(reports),
        "departments_covered": len(departments),
        "states_covered": len(states),
        "median_amount_demanded": median_amount,
    }
