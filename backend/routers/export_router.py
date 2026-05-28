import io
import base64
import asyncio
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from PIL import Image
from typing import Optional

from services.postprocess import composite_on_white, feather_edges

SESSIONS_DIR = Path("/tmp/sessions")

router = APIRouter()


class ExportRequest(BaseModel):
    id: str
    format: str = "png"          # png | jpg | webp
    quality: str = "hd"          # hd | 4k
    feather: int = 0
    mask_data: Optional[str] = None  # base64 PNG brush mask overlay


class ExportResponse(BaseModel):
    download_url: str


@router.post("/export", response_model=ExportResponse)
async def export_image(req: ExportRequest):
    session_dir = SESSIONS_DIR / req.id
    result_path = session_dir / "result.png"

    if not result_path.exists():
        raise HTTPException(404, "No processed result. Run remove-bg first.")

    out_path = await asyncio.to_thread(
        _build_export, session_dir, result_path, req
    )

    return ExportResponse(download_url=f"/api/image/{req.id}/{out_path.name}")


def _build_export(session_dir: Path, result_path: Path, req: ExportRequest) -> Path:
    img = Image.open(result_path).convert("RGBA")

    if req.mask_data:
        brush_data = base64.b64decode(req.mask_data)
        brush_mask = Image.open(io.BytesIO(brush_data)).convert("L")
        brush_mask = brush_mask.resize(img.size, Image.LANCZOS)
        r, g, b, a = img.split()
        import numpy as np
        a_arr = np.array(a, dtype=np.float32)
        brush_arr = np.array(brush_mask, dtype=np.float32)
        merged = np.clip(a_arr + brush_arr - 128, 0, 255).astype(np.uint8)
        img = Image.merge("RGBA", (r, g, b, Image.fromarray(merged)))

    if req.feather > 0:
        img = feather_edges(img, req.feather)

    if req.quality == "4k":
        target_long = 3840
        w, h = img.size
        scale = target_long / max(w, h)
        if scale > 1:
            new_w, new_h = int(w * scale), int(h * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)

    if req.format == "png":
        out_path = session_dir / "export.png"
        img.save(str(out_path), "PNG", optimize=True)
    elif req.format == "jpg":
        out_path = session_dir / "export.jpg"
        rgb = composite_on_white(img)
        rgb.save(str(out_path), "JPEG", quality=95)
    elif req.format == "webp":
        out_path = session_dir / "export.webp"
        img.save(str(out_path), "WEBP", quality=90)
    else:
        raise ValueError(f"Unknown format: {req.format}")

    return out_path
