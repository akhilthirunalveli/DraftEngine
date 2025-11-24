from fastapi import APIRouter, HTTPException, status
from google.api_core.exceptions import NotFound
from app.models.auth import UserAuth, Token, UserOut
from app.core.security import get_hash, verify_pwd, create_access_token
from app.db.firestore import db
import uuid

r = APIRouter(tags=["auth"])

@r.post("/register", response_model=UserOut)
def reg(u: UserAuth):
    users_ref = db.collection("users")
    try:
        if users_ref.where("email", "==", u.email).get():
            raise HTTPException(status_code=400, detail="Email exists")
    except NotFound:
        raise HTTPException(
            status_code=500,
            detail=(
                "Firestore database not found for the configured project. "
                "Create a Firestore database in the Firebase console or start the local Firestore emulator. "
                "See README or visit https://console.cloud.google.com/datastore/setup?project=<project-id>"
            ),
        )
    
    uid = str(uuid.uuid4())
    hashed = get_hash(u.password)
    user_data = {"uid": uid, "email": u.email, "hashed_password": hashed}
    users_ref.document(uid).set(user_data)
    
    return {"uid": uid, "email": u.email}

@r.post("/login", response_model=Token)
def login(u: UserAuth):
    users_ref = db.collection("users")
    try:
        docs = users_ref.where("email", "==", u.email).stream()
        user = next(docs, None)
    except NotFound:
        raise HTTPException(
            status_code=500,
            detail=(
                "Firestore database not found for the configured project. "
                "Create a Firestore database in the Firebase console or start the local Firestore emulator. "
                "See README or visit https://console.cloud.google.com/datastore/setup?project=<project-id>"
            ),
        )
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid creds")
    
    data = user.to_dict()
    if not verify_pwd(u.password, data["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid creds")
        
    token = create_access_token({"sub": data["uid"]})
    return {"access_token": token, "token_type": "bearer"}