import asyncio
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.rembg_service import remove_background, REMBG_AVAILABLE
from services.postprocess import remove_halo, smooth_edges

SESSIONS_DIR = Path("/tmp/sessions")

router = APIRouter()


class RemoveBgRequest(BaseModel):
    id: str
    model: str = "isnet-general-use"


class RemoveBgResponse(BaseModel):
    result_url: str
    status: str = "done"


@router.post("/remove-bg", response_model=RemoveBgResponse)
async def remove_bg(req: RemoveBgRequest, request: Request):
    if not REMBG_AVAILABLE:
        raise HTTPException(503, "rembg not installed. Run: pip install rembg")

    session_dir = SESSIONS_DIR / req.id
    if not session_dir.exists():
        raise HTTPException(404, "Session not found")

    original = _find_original(session_dir)
    if original is None:
        raise HTTPException(404, "Original image not found in session")

    job_status = request.app.state.job_status
    job_status[req.id] = {"status": "processing"}

    try:
        result = await asyncio.to_thread(
            _process_image, original, req.model
        )
        result_path = session_dir / "result.png"
        result.save(str(result_path), "PNG")
        job_status[req.id] = {"status": "done"}
    except Exception as e:
        job_status[req.id] = {"status": "error", "error": str(e)}
        raise HTTPException(500, f"Processing failed: {e}")

    return RemoveBgResponse(result_url=f"/api/image/{req.id}/result.png")


def _process_image(original_path: Path, model_name: str):
    rgba = remove_background(original_path, model_name)
    rgba = remove_halo(rgba, erode_px=1)
    rgba = smooth_edges(rgba, radius=0.5)
    return rgba


def _find_original(session_dir: Path) -> Path | None:
    for ext in [".png", ".jpg", ".jpeg", ".webp"]:
        p = session_dir / f"original{ext}"
        if p.exists():
            return p
    return None
