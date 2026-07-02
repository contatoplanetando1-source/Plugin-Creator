import numpy as np
from PIL import Image, ImageFilter


def remove_halo(rgba: Image.Image, erode_px: int = 1) -> Image.Image:
    """Erode alpha channel slightly to remove white halo artifacts."""
    r, g, b, a = rgba.split()
    a_arr = np.array(a, dtype=np.float32)

    # Simple erosion via minimum filter
    if erode_px > 0:
        a_pil = Image.fromarray(a_arr.astype(np.uint8))
        a_eroded = a_pil.filter(ImageFilter.MinFilter(erode_px * 2 + 1))
        a_arr = np.array(a_eroded, dtype=np.float32)

    # Smooth edges with gaussian
    a_pil = Image.fromarray(a_arr.astype(np.uint8))
    a_smooth = a_pil.filter(ImageFilter.GaussianBlur(radius=0.5))
    a_arr = np.array(a_smooth, dtype=np.float32)

    result = Image.merge("RGBA", (r, g, b, Image.fromarray(a_arr.astype(np.uint8))))
    return result


def smooth_edges(rgba: Image.Image, radius: float = 1.0) -> Image.Image:
    r, g, b, a = rgba.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=radius))
    return Image.merge("RGBA", (r, g, b, a_smooth))


def feather_edges(rgba: Image.Image, feather_px: int = 3) -> Image.Image:
    if feather_px <= 0:
        return rgba
    r, g, b, a = rgba.split()
    a_feathered = a.filter(ImageFilter.GaussianBlur(radius=feather_px))
    return Image.merge("RGBA", (r, g, b, a_feathered))


def expand_mask(rgba: Image.Image, px: int = 2) -> Image.Image:
    r, g, b, a = rgba.split()
    if px > 0:
        a_expanded = a.filter(ImageFilter.MaxFilter(px * 2 + 1))
    else:
        a_expanded = a.filter(ImageFilter.MinFilter(abs(px) * 2 + 1))
    return Image.merge("RGBA", (r, g, b, a_expanded))


def apply_mask_to_image(original: Image.Image, mask: Image.Image) -> Image.Image:
    """Apply a grayscale mask to an image, returning RGBA."""
    orig_rgba = original.convert("RGBA")
    mask_gray = mask.convert("L").resize(orig_rgba.size, Image.LANCZOS)
    r, g, b, _ = orig_rgba.split()
    return Image.merge("RGBA", (r, g, b, mask_gray))


def composite_on_white(rgba: Image.Image) -> Image.Image:
    white = Image.new("RGB", rgba.size, (255, 255, 255))
    white.paste(rgba, mask=rgba.split()[3])
    return white


def merge_masks(ai_mask: Image.Image, brush_mask: Image.Image) -> Image.Image:
    """Combine AI-generated mask with user brush strokes."""
    ai_arr = np.array(ai_mask.convert("L"), dtype=np.float32)
    brush_arr = np.array(brush_mask.convert("L"), dtype=np.float32)
    merged = np.clip(ai_arr + brush_arr, 0, 255).astype(np.uint8)
    return Image.fromarray(merged, mode="L")
