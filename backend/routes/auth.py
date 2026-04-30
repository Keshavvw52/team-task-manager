from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from schemas.auth import SignupRequest, LoginRequest, TokenResponse
from schemas.user import UserResponse
from auth.password import hash_password, verify_password
from auth.jwt_handler import create_access_token
from auth.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED
)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Register new user and return JWT token.
    """

    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole(payload.role)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token({
        "sub": str(new_user.id),
        "role": new_user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    """

    user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if not user or not verify_password(
        payload.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user profile.
    """
    return current_user
