# Background Remover — Premium Quality

A professional-grade, locally-hosted background removal tool. No credits, no API costs — everything runs on your infrastructure.

## Features

- **Auto Remove**: One-click AI background removal using ISNet / BiRefNet models
- **Select Object**: Click-to-select with SAM (optional) or rembg fallback
- **Brush Refinement**: Add/subtract mask areas with a brush tool
- **Before/After Slider**: Real-time comparison
- **Export**: PNG (transparent), JPG (white bg), WebP in HD or 4K

## Quick Start (Docker)

```bash
git clone <repo>
cd bg-remover
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

> **First run**: The AI model (`isnet-general-use`, ~170MB) downloads automatically on first use. This takes 30–60 seconds. Subsequent requests are instant.

## Manual Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## Optional: SAM (Segment Anything Model)

SAM enables click-to-select by clicking on individual objects. Without it, the tool falls back to rembg for segmentation (still excellent quality).

**Download MobileSAM checkpoint** (lightweight, ~40MB, CPU-friendly):

```bash
mkdir -p ~/.cache/sam
wget -O ~/.cache/sam/mobile_sam.pt \
  https://github.com/ChaoningZhang/MobileSAM/raw/master/weights/mobile_sam.pt
pip install git+https://github.com/ChaoningZhang/MobileSAM.git
```

## Model Quality Comparison

| Model | Quality | Speed (CPU) | Best For |
|-------|---------|-------------|----------|
| `isnet-general-use` | ★★★★☆ | Fast (~3s) | General use, portraits, products |
| `u2net` | ★★★☆☆ | Fast (~2s) | Simple backgrounds |
| `birefnet-general` | ★★★★★ | Slower (~8s) | Hair, fine detail, complex scenes |

Default: `isnet-general-use` — best balance of speed and quality.

## Performance Notes

| Hardware | Processing Time | Recommended Model |
|----------|----------------|-------------------|
| CPU (4 cores) | 3–10s | `isnet-general-use` |
| CPU (8+ cores) | 2–5s | `isnet-general-use` or `birefnet-general` |
| GPU (any CUDA) | <1s | `birefnet-general` |

For GPU support, replace `onnxruntime` with `onnxruntime-gpu` in `requirements.txt`.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload image, returns session ID |
| `/api/remove-bg` | POST | Auto background removal |
| `/api/segment` | POST | Click-to-select (SAM or fallback) |
| `/api/refine` | POST | Post-processing (smooth, expand, etc.) |
| `/api/export` | POST | Final export with format/quality options |
| `/api/status/{id}` | GET | Job status polling |
| `/api/image/{id}/{file}` | GET | Serve session images |

Interactive docs: http://localhost:8000/docs

## Architecture

```
Browser → Next.js (port 3000)
            ↓ rewrites /api/* 
         FastAPI (port 8000)
            ├── rembg (ISNet/BiRefNet) — auto removal
            ├── SAM/MobileSAM — click segmentation (optional)
            └── Pillow — post-processing & export
```
