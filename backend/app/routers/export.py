from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.services.export_service import ExportService
from app.db.firestore import db

r = APIRouter(tags=["export"])
es = ExportService()

@r.get("/download/{pid}/{fmt}")
def download_file(pid: str, fmt: str):
    """
    Exports project data to .docx or .pptx format.
    """
    # 1. Fetch Project Data
    ref = db.collection("projects").document(pid)
    snap = ref.get()
    
    if not snap.exists:
        raise HTTPException(404, "Project not found")
        
    data = snap.to_dict()
    title = data.get("title", "Untitled")
    content = data.get("data", {}) # Document structure

    # 2. Generate File Stream
    try:
        if fmt == "docx":
            stream = es.gen_docx(title, content)
            media = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            fname = f"{title}.docx"
        elif fmt == "pptx":
            stream = es.gen_pptx(title, content)
            media = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            fname = f"{title}.pptx"
        else:
            raise HTTPException(400, "Invalid format. Use 'docx' or 'pptx'")
            
        # 3. Return Stream
        return StreamingResponse(
            stream, 
            media_type=media, 
            headers={"Content-Disposition": f"attachment; filename={fname}"}
        )
    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")