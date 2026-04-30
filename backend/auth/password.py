from passlib.context import CryptContext

# bcrypt-based secure password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain password securely before storing in database.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify user-entered password against stored hash.
    """
    return pwd_context.verify(plain_password, hashed_password)