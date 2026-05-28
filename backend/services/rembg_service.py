import io
from pathlib import Path
from PIL import Image

try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

_sessions: dict[str, object] = {}

PREFERRED_MODELS = [
    "isnet-general-use",
    "u2net",
]


def _get_session(model_name: str = "isnet-general-use"):
    if not REMBG_AVAILABLE:
        raise RuntimeError("rembg not installed")
    if model_name not in _sessions:
        _sessions[model_name] = new_session(model_name)
    return _sessions[model_name]


def remove_background(image_path: Path, model_name: str = "isnet-general-use") -> Image.Image:
    if not REMBG_AVAILABLE:
        raise RuntimeError("rembg is not available. Install it with: pip install rembg")

    with open(image_path, "rb") as f:
        input_data = f.read()

    session = _get_session(model_name)
    output_data = remove(input_data, session=session)
    result = Image.open(io.BytesIO(output_data)).convert("RGBA")
    return result


def get_mask_from_image(image_path: Path, model_name: str = "isnet-general-use") -> Image.Image:
    result = remove_background(image_path, model_name)
    r, g, b, a = result.split()
    return a
