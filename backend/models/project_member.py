from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class ProjectMember(Base):

    __table_args__ = (
    UniqueConstraint("project_id", "user_id", name="unique_project_user"),
    )
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="member", nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")