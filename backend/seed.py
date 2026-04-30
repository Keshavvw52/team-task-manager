from database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.project import Project
from models.project_member import ProjectMember
from models.task import Task, TaskPriority, TaskStatus
from auth.password import hash_password
from datetime import date, timedelta

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Prevent duplicate seed
    existing_admin = db.query(User).filter(
        User.email == "admin@demo.com"
    ).first()

    if existing_admin:
        print("Demo data already exists.")
        exit()

    # Admin user
    admin = User(
        name="Admin User",
        email="admin@demo.com",
        password_hash=hash_password("admin123"),
        role=UserRole.admin
    )

    # Member user
    member = User(
        name="Member User",
        email="member@demo.com",
        password_hash=hash_password("member123"),
        role=UserRole.member
    )

    db.add_all([admin, member])
    db.commit()

    db.refresh(admin)
    db.refresh(member)

    # Project
    project = Project(
        title="Demo Task Management Platform",
        description="Assessment demo project",
        created_by=admin.id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    # Membership
    membership_admin = ProjectMember(
        project_id=project.id,
        user_id=admin.id,
        role="admin"
    )

    membership_member = ProjectMember(
        project_id=project.id,
        user_id=member.id,
        role="member"
    )

    db.add_all([membership_admin, membership_member])
    db.commit()

    # Tasks
    tasks = [
        Task(
            title="Design frontend dashboard",
            description="Build dashboard UI",
            project_id=project.id,
            assigned_to=member.id,
            due_date=date.today() + timedelta(days=5),
            priority=TaskPriority.high,
            status=TaskStatus.in_progress
        ),
        Task(
            title="Implement authentication",
            description="JWT login/signup",
            project_id=project.id,
            assigned_to=member.id,
            due_date=date.today() + timedelta(days=2),
            priority=TaskPriority.medium,
            status=TaskStatus.todo
        ),
        Task(
            title="Deploy application",
            description="Deploy on Railway/Vercel",
            project_id=project.id,
            assigned_to=admin.id,
            due_date=date.today() + timedelta(days=7),
            priority=TaskPriority.high,
            status=TaskStatus.todo
        )
    ]

    db.add_all(tasks)
    db.commit()

    print("✅ Demo data seeded successfully!")
    print("Admin: admin@demo.com / admin123")
    print("Member: member@demo.com / member123")

finally:
    db.close()