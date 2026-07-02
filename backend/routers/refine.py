import asyncio
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from services.postprocess import smooth_edges, feather_edges, expand_mask, remove_halo

SESSIONS_DIR = Path("/tmp/sessions")

router = APIRouter()


class RefineRequest(BaseModel):
    id: str
    action: str  # hair | smooth | expand | shrink | restore


class RefineResponse(BaseModel):
    result_url: str


@router.post("/refine", response_model=RefineResponse)
async def refine(req: RefineRequest):
    session_dir = SESSIONS_DIR / req.id
    result_path = session_dir / "result.png"

    if not result_path.exists():
        raise HTTPException(404, "No processed result found. Run remove-bg first.")

    result = await asyncio.to_thread(_apply_refinement, result_path, req.action)
    result.save(str(result_path), "PNG")

    return RefineResponse(result_url=f"/api/image/{req.id}/result.png")


def _apply_refinement(result_path: Path, action: str) -> Image.Image:
    img = Image.open(result_path).convert("RGBA")

    if action == "hair":
        img = smooth_edges(img, radius=0.3)
        img = remove_halo(img, erode_px=0)
    elif action == "smooth":
        img = smooth_edges(img, radius=1.2)
    elif action == "expand":
        img = expand_mask(img, px=2)
    elif action == "shrink":
        img = expand_mask(img, px=-2)
    elif action == "restore":
        # Undo over-erosion by expanding mask slightly
        img = expand_mask(img, px=3)
    else:
        raise ValueError(f"Unknown action: {action}")

    return img
