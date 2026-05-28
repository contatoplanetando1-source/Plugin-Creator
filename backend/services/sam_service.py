"""
SAM (Segment Anything Model) service.
Uses MobileSAM if available; falls back to rembg-based segmentation otherwise.
"""
import io
import base64
import numpy as np
from pathlib import Path
from PIL import Image

SAM_AVAILABLE = False
_sam_predictor = None

try:
    from mobile_sam import sam_model_registry, SamPredictor
    SAM_AVAILABLE = True
    _SAM_TYPE = "mobile_sam"
except ImportError:
    try:
        from segment_anything import sam_model_registry, SamPredictor
        SAM_AVAILABLE = True
        _SAM_TYPE = "sam"
    except ImportError:
        pass


def load_sam_model(checkpoint_path: str | None = None):
    global _sam_predictor, SAM_AVAILABLE
    if not SAM_AVAILABLE:
        return False

    import os
    default_paths = [
        "/models/mobile_sam.pt",
        "/models/sam_vit_b.pth",
        os.path.expanduser("~/.cache/sam/mobile_sam.pt"),
        os.path.expanduser("~/.cache/sam/sam_vit_b.pth"),
    ]
    if checkpoint_path:
        default_paths.insert(0, checkpoint_path)

    for path in default_paths:
        if os.path.exists(path):
            try:
                model_type = "vit_t" if "mobile" in path else "vit_b"
                sam = sam_model_registry[model_type](checkpoint=path)
                sam.eval()
                _sam_predictor = SamPredictor(sam)
                return True
            except Exception:
                continue
    return False


def segment_point(
    image_path: Path,
    x: float,
    y: float,
    label: int = 1,
) -> str:
    """
    Segment from a single point click. Returns base64-encoded PNG mask.
    Falls back to rembg if SAM unavailable.
    """
    if _sam_predictor is not None:
        return _sam_segment(image_path, x, y, label)
    return _rembg_fallback_segment(image_path)


def _sam_segment(image_path: Path, x: float, y: float, label: int) -> str:
    img = Image.open(image_path).convert("RGB")
    img_arr = np.array(img)
    _sam_predictor.set_image(img_arr)

    input_point = np.array([[x, y]])
    input_label = np.array([label])

    masks, scores, _ = _sam_predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    # Pick the mask with highest score
    best_idx = int(np.argmax(scores))
    mask = masks[best_idx].astype(np.uint8) * 255
    mask_img = Image.fromarray(mask, mode="L")

    buf = io.BytesIO()
    mask_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _rembg_fallback_segment(image_path: Path) -> str:
    """Use rembg to generate a mask as fallback for SAM."""
    from services.rembg_service import get_mask_from_image
    mask = get_mask_from_image(image_path)
    buf = io.BytesIO()
    mask.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()
