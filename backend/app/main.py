from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, editor, export

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.r, prefix="/auth")
app.include_router(projects.r, prefix="/projects")
app.include_router(editor.r, prefix="/editor")
app.include_router(export.r, prefix="/export")

@app.get("/")
def root():
    return {"msg": "DraftEngine API"}