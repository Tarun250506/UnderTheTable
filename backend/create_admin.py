
from getpass import getpass

from sqlalchemy.exc import SQLAlchemyError

from app.database import SessionLocal
from app.models import AdminUser
from app.security import hash_password


def main():
    print("\nUnderTheTable — Create Administrator\n")

    email = input("Administrator email: ").strip().lower()

    if not email or "@" not in email:
        print("Invalid email address.")
        return

    password = getpass("Enter password (minimum 12 characters): ")
    confirmation = getpass("Confirm password: ")

    if len(password) < 12:
        print("Password must contain at least 12 characters.")
        return

    if password != confirmation:
        print("Passwords do not match.")
        return

    db = SessionLocal()

    try:
        existing_admin = (
            db.query(AdminUser)
            .filter(AdminUser.email == email)
            .first()
        )

        if existing_admin:
            print("An administrator with this email already exists.")
            return

        admin = AdminUser(
            email=email,
            password_hash=hash_password(password),
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print(f"\nAdministrator account created for {email}.")

    except SQLAlchemyError:
        db.rollback()
        print("Database error. Administrator account was not created.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
