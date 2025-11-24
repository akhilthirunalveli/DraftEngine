from fastapi import APIRouter, HTTPException, Body
from app.services.gemini_service import GenService
from app.db.firestore import db
from app.models.document import Document
from typing import Literal

r = APIRouter(tags=["editor"])
gs = GenService()

@r.post("/generate", response_model=Document)
async def gen_doc(prompt: str = Body(..., embed=True), type: str = Body(..., embed=True)):
    """
    Generates the initial document structure (Word or Slides) based on user prompt.
    """
    try:
        # Call Gemini service to structure the content
        doc = await gs.create_draft(prompt, type)
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@r.post("/refine")
async def refine(
    text: str = Body(...),
    instructions: str = Body(...)
):
    """
    Refines a specific text block based on instructions (e.g., 'Make it formal').
    """
    try:
        new_text = await gs.refine_content(text, instructions)
        return {"refined": new_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@r.post("/feedback/{pid}/{sid}")
def feedback(pid: str, sid: str, vote: Literal["like", "dislike"] = Body(..., embed=True)):
    """
    Updates the feedback (like/dislike) for a specific section (sid) in a project (pid).
    """
    ref = db.collection("projects").document(pid)
    snap = ref.get()
    
    if not snap.exists:
        raise HTTPException(404, "Project not found")
        
    data = snap.to_dict()
    sections = data.get("data", {}).get("sections", [])
    
    found = False
    for s in sections:
        if s.get("id") == sid:
            s["feedback"] = vote
            found = True
            break
            
    if not found:
        raise HTTPException(404, "Section not found")
        
    # Write back the updated list
    ref.update({"data.sections": sections})
    return {"status": "updated"}

@r.post("/comment/{pid}/{sid}")
def add_comment(pid: str, sid: str, text: str = Body(..., embed=True)):
    """
    Saves a user comment for a specific section.
    """
    ref = db.collection("projects").document(pid)
    snap = ref.get()
    
    if not snap.exists:
        raise HTTPException(404, "Project not found")

    data = snap.to_dict()
    sections = data.get("data", {}).get("sections", [])
    
    found = False
    for s in sections:
        if s.get("id") == sid:
            s["comment"] = text
            found = True
            break
            
    if not found:
        raise HTTPException(404, "Section not found")
        
    ref.update({"data.sections": sections})
    return {"status": "saved"}

@r.post("/suggest-outline")
async def suggest_outline(title: str = Body(..., embed=True)):
    """
    Generates section headers/outline for a document based on the title.
    Returns only section titles without content.
    """
    try:
        result = await gs.suggest_outline(title)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))