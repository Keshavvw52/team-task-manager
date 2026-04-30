from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models.task import Task
from models.project import Project
from models.user import User
from models.project_member import ProjectMember
from auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "admin":
        total_projects = db.query(Project).count()
        tasks_query = db.query(Task)
    else:
        memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
        project_ids = [m.project_id for m in memberships]
        total_projects = len(project_ids)
        tasks_query = db.query(Task).filter(Task.assigned_to == current_user.id)

    all_tasks = tasks_query.all()
    total_tasks = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.status.value == "Completed")
    in_progress = sum(1 for t in all_tasks if t.status.value == "In Progress")
    overdue = sum(
        1
        for t in all_tasks
        if t.due_date and t.due_date < date.today() and t.status.value != "Completed"
    )
    todo = sum(1 for t in all_tasks if t.status.value == "Todo")

    # Recent tasks (last 5)
    recent_tasks = []
    for task in sorted(all_tasks, key=lambda x: x.created_at, reverse=True)[:5]:
        assignee = db.query(User).filter(User.id == task.assigned_to).first() if task.assigned_to else None
        project = db.query(Project).filter(Project.id == task.project_id).first()
        recent_tasks.append({
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority.value,
            "due_date": task.due_date,
            "assignee_name": assignee.name if assignee else None,
            "project_title": project.title if project else None
        })

    # Member productivity (admin only)
    member_stats = []
    if current_user.role.value == "admin":
        users = db.query(User).all()
        for u in users:
            user_tasks = db.query(Task).filter(Task.assigned_to == u.id).all()
            member_stats.append({
                "user_id": u.id,
                "name": u.name,
                "total": len(user_tasks),
                "completed": sum(1 for t in user_tasks if t.status.value == "Completed"),
                "in_progress": sum(1 for t in user_tasks if t.status.value == "In Progress"),
            })

    total_members = db.query(User).count() if current_user.role.value == "admin" else 0

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed,
        "pending_tasks": todo + in_progress,
        "in_progress_tasks": in_progress,
        "overdue_tasks": overdue,
        "todo_tasks": todo,
        "total_members": total_members,
        "recent_tasks": recent_tasks,
        "member_stats": member_stats
    }
