import os
import uuid
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from routers import remove_bg, segment, export_router, refine

SESSIONS_DIR = Path(os.environ.get("SESSIONS_DIR", "/tmp/sessions"))
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Background Remover API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(remove_bg.router, prefix="/api")
app.include_router(segment.router, prefix="/api")
app.include_router(export_router.router, prefix="/api")
app.include_router(refine.router, prefix="/api")

# In-memory job status store
job_status: dict[str, dict] = {}


class UploadResponse(BaseModel):
    id: str
    width: int
    height: int


@app.post("/api/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    allowed = {"image/png", "image/jpeg", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    session_id = str(uuid.uuid4())
    session_dir = SESSIONS_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix.lower() if file.filename else ".png"
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        ext = ".png"

    original_path = session_dir / f"original{ext}"
    content = await file.read()

    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 50MB)")

    with open(original_path, "wb") as f:
        f.write(content)

    from PIL import Image
    with Image.open(original_path) as img:
        width, height = img.size

    job_status[session_id] = {"status": "idle", "original_ext": ext}

    return UploadResponse(id=session_id, width=width, height=height)


@app.get("/api/status/{session_id}")
async def get_status(session_id: str):
    if session_id not in job_status:
        raise HTTPException(404, "Session not found")
    return job_status[session_id]


@app.get("/api/image/{session_id}/{filename}")
async def get_image(session_id: str, filename: str):
    safe_name = Path(filename).name
    image_path = SESSIONS_DIR / session_id / safe_name
    if not image_path.exists():
        raise HTTPException(404, "Image not found")
    media_type = "image/png" if safe_name.endswith(".png") else "image/jpeg"
    return FileResponse(str(image_path), media_type=media_type)


@app.get("/health")
async def health():
    return {"status": "ok"}


# Expose job_status to routers
app.state.job_status = job_status
