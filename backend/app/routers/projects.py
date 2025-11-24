from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.db.firestore import db
from app.models.project import Project, ProjectCreate, ProjectSummary
from app.services.gemini_service import GenService
import uuid
from datetime import datetime

r = APIRouter(tags=["projects"])
oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")
gs = GenService()

async def get_user(t: str = Depends(oauth2)):
    try:
        p = jwt.decode(t, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        uid = p.get("sub")
        if not uid: raise HTTPException(401)
        return uid
    except JWTError:
        raise HTTPException(401)

@r.post("/", response_model=Project)
async def create(p: ProjectCreate, uid: str = Depends(get_user)):
    doc = await gs.create_draft(p.prompt, p.type)
    pid = str(uuid.uuid4())
    now = datetime.utcnow()
    
    obj = {
        "id": pid,
        "user_id": uid,
        "title": p.title,
        "type": p.type,
        "created_at": now,
        "last_modified": now,
        "data": doc.dict()
    }
    
    db.collection("projects").document(pid).set(obj)
    return obj

@r.get("/", response_model=list[ProjectSummary])
def list_all(uid: str = Depends(get_user)):
    ref = db.collection("projects")
    docs = ref.where("user_id", "==", uid).stream()
    return [d.to_dict() for d in docs]

@r.get("/{pid}", response_model=Project)
def get_one(pid: str, uid: str = Depends(get_user)):
    d = db.collection("projects").document(pid).get()
    if not d.exists: raise HTTPException(404)
    data = d.to_dict()
    if data["user_id"] != uid: raise HTTPException(403)
    return data