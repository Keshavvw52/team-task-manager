from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from schemas.user import UserResponse
from auth.dependencies import get_current_user, require_admin

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "",
    response_model=List[UserResponse]
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin-only: Get all users.
    """
    return db.query(User).all()


@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user by ID.
    Admin can view anyone.
    Members can only view themselves.
    """

    if current_user.role.value != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user