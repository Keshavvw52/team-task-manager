from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, require_admin
from database import get_db
from models.project import Project
from models.project_member import ProjectMember
from models.user import User
from schemas.project import (
    MemberAdd,
    MemberResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


def user_can_access_project(project_id: int, user: User, db: Session) -> bool:
    if user.role.value == "admin":
        return True

    return db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id,
    ).first() is not None


def enrich_member(member: ProjectMember) -> dict:
    return {
        "id": member.id,
        "project_id": member.project_id,
        "user_id": member.user_id,
        "role": member.role,
        "user_name": member.user.name if member.user else None,
        "user_email": member.user.email if member.user else None,
    }


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    project = Project(
        title=payload.title,
        description=payload.description,
        created_by=current_user.id,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    db.add(ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role="admin",
    ))
    db.commit()
    db.refresh(project)

    return project


@router.get("", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value == "admin":
        return db.query(Project).order_by(Project.created_at.desc()).all()

    return (
        db.query(Project)
        .join(ProjectMember)
        .filter(ProjectMember.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if not user_can_access_project(project_id, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if payload.title is not None:
        project.title = payload.title

    if payload.description is not None:
        project.description = payload.description

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    db.delete(project)
    db.commit()

    return


@router.get("/{project_id}/members", response_model=list[MemberResponse])
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if not user_can_access_project(project_id, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
    ).all()

    return [enrich_member(member) for member in members]


@router.post(
    "/{project_id}/members",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_project_member(
    project_id: int,
    payload: MemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    user = db.query(User).filter(User.id == payload.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == payload.user_id,
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a project member",
        )

    member = ProjectMember(
        project_id=project_id,
        user_id=payload.user_id,
        role=payload.role,
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return enrich_member(member)


@router.delete(
    "/{project_id}/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_project_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id,
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project member not found",
        )

    db.delete(member)
    db.commit()

    return
