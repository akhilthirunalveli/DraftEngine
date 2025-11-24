from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.models.document import Document

class ProjectBase(BaseModel):
    title: str
    type: str

class ProjectCreate(ProjectBase):
    prompt: str

class ProjectSummary(ProjectBase):
    id: str
    last_modified: datetime

class Project(ProjectSummary):
    user_id: str
    created_at: datetime
    data: Document