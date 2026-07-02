from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.sam_service import segment_point, load_sam_model

SESSIONS_DIR = Path("/tmp/sessions")

router = APIRouter()

# Attempt to load SAM at startup
load_sam_model()


class SegmentRequest(BaseModel):
    id: str
    x: float
    y: float
    label: int = 1  # 1 = foreground, 0 = background


class SegmentResponse(BaseModel):
    mask: str  # base64 PNG
    sam_used: bool


@router.post("/segment", response_model=SegmentResponse)
async def segment(req: SegmentRequest):
    session_dir = SESSIONS_DIR / req.id
    if not session_dir.exists():
        raise HTTPException(404, "Session not found")

    original = _find_original(session_dir)
    if original is None:
        raise HTTPException(404, "Original image not found")

    from services.sam_service import _sam_predictor
    sam_used = _sam_predictor is not None

    import asyncio
    mask_b64 = await asyncio.to_thread(
        segment_point, original, req.x, req.y, req.label
    )

    return SegmentResponse(mask=mask_b64, sam_used=sam_used)


def _find_original(session_dir: Path) -> Path | None:
    for ext in [".png", ".jpg", ".jpeg", ".webp"]:
        p = session_dir / f"original{ext}"
        if p.exists():
            return p
    return None
