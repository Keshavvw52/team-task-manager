from database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.project import Project
from models.project_member import ProjectMember
from models.task import Task, TaskPriority, TaskStatus
from auth.password import hash_password
from datetime import date, timedelta


def seed_demo_data():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        admin = db.query(User).filter(User.email == "admin@demo.com").first()
        member = db.query(User).filter(User.email == "member@demo.com").first()
        created = False

        if admin:
            admin.name = "Admin User"
            admin.password_hash = hash_password("admin123")
            admin.role = UserRole.admin
        else:
            admin = User(
                name="Admin User",
                email="admin@demo.com",
                password_hash=hash_password("admin123"),
                role=UserRole.admin
            )
            db.add(admin)
            created = True

        if member:
            member.name = "Member User"
            member.password_hash = hash_password("member123")
            member.role = UserRole.member
        else:
            member = User(
                name="Member User",
                email="member@demo.com",
                password_hash=hash_password("member123"),
                role=UserRole.member
            )
            db.add(member)
            created = True

        db.commit()

        db.refresh(admin)
        db.refresh(member)

        existing_project = db.query(Project).filter(
            Project.title == "Demo Task Management Platform"
        ).first()

        if existing_project:
            return created

        project = Project(
            title="Demo Task Management Platform",
            description="Assessment demo project",
            created_by=admin.id
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        db.add_all([
            ProjectMember(project_id=project.id, user_id=admin.id, role="admin"),
            ProjectMember(project_id=project.id, user_id=member.id, role="member")
        ])
        db.commit()

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
        return True

    finally:
        db.close()


if __name__ == "__main__":
    created = seed_demo_data()
    if created:
        print("Demo data seeded successfully.")
        print("Admin: admin@demo.com / admin123")
        print("Member: member@demo.com / member123")
    else:
        print("Demo data already exists.")
