from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class Revision(BaseModel):
    ts: datetime = Field(default_factory=datetime.utcnow)
    prompt: str
    text_before: str
    text_after: str

class Section(BaseModel):
    id: str
    title: str
    content: str
    order: int
    feedback: Optional[Literal["like", "dislike"]] = None
    comment: Optional[str] = None
    history: List[Revision] = []

class Document(BaseModel):
    sections: List[Section]