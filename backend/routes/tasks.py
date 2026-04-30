from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from models.task import Task
from models.user import User
from models.project_member import ProjectMember
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def enrich_task(task: Task, db: Session) -> dict:
    assignee_name = None
    project_title = None

    if task.assigned_to:
        user = db.query(User).filter(User.id == task.assigned_to).first()
        assignee_name = user.name if user else None

    if task.project:
        project_title = task.project.title

    # Auto-detect overdue
    status = task.status
    if task.due_date and task.due_date < date.today() and status not in ["Completed", "Overdue"]:
        status = "Overdue"

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "project_id": task.project_id,
        "assigned_to": task.assigned_to,
        "due_date": task.due_date,
        "priority": task.priority,
        "status": status,
        "created_at": task.created_at,
        "assignee_name": assignee_name,
        "project_title": project_title
    }


@router.post("", status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    task = Task(
        title=payload.title,
        description=payload.description,
        project_id=payload.project_id,
        assigned_to=payload.assigned_to,
        due_date=payload.due_date,
        priority=payload.priority,
        status=payload.status
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return enrich_task(task, db)


@router.get("")
def get_tasks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task)

    if current_user.role == "member":
        query = query.filter(Task.assigned_to == current_user.id)
    elif project_id:
        query = query.filter(Task.project_id == project_id)

    tasks = query.all()
    return [enrich_task(t, db) for t in tasks]


@router.get("/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == "member" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return enrich_task(task, db)


@router.put("/{task_id}")
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Members can only update status of their own tasks
    if current_user.role == "member":
        if task.assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if payload.status is not None:
            task.status = payload.status
    else:
        # Admin can update all fields
        if payload.title is not None:
            task.title = payload.title
        if payload.description is not None:
            task.description = payload.description
        if payload.assigned_to is not None:
            task.assigned_to = payload.assigned_to
        if payload.due_date is not None:
            task.due_date = payload.due_date
        if payload.priority is not None:
            task.priority = payload.priority
        if payload.status is not None:
            task.status = payload.status

    db.commit()
    db.refresh(task)
    return enrich_task(task, db)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()