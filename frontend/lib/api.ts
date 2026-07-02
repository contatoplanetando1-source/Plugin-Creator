const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface UploadResponse {
  id: string;
  width: number;
  height: number;
}

export interface StatusResponse {
  status: "idle" | "processing" | "done" | "error";
  error?: string;
}

export interface RemoveBgResponse {
  result_url: string;
  status: string;
}

export interface SegmentResponse {
  mask: string;
  sam_used: boolean;
}

export interface ExportResponse {
  download_url: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeBackground(id: string, model = "isnet-general-use"): Promise<RemoveBgResponse> {
  const res = await fetch(`${API_BASE}/api/remove-bg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, model }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function segmentPoint(
  id: string,
  x: number,
  y: number,
  label: 1 | 0 = 1
): Promise<SegmentResponse> {
  const res = await fetch(`${API_BASE}/api/segment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, x, y, label }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function refineResult(id: string, action: string): Promise<{ result_url: string }> {
  const res = await fetch(`${API_BASE}/api/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, action }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function exportImage(
  id: string,
  format: "png" | "jpg" | "webp",
  quality: "hd" | "4k",
  feather: number,
  maskData?: string
): Promise<ExportResponse> {
  const res = await fetch(`${API_BASE}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, format, quality, feather, mask_data: maskData }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pollStatus(id: string, maxWaitMs = 120_000): Promise<StatusResponse> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${API_BASE}/api/status/${id}`);
    if (res.ok) {
      const data: StatusResponse = await res.json();
      if (data.status === "done" || data.status === "error") return data;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error("Timeout waiting for processing");
}

export function imageUrl(id: string, filename: string): string {
  return `${API_BASE}/api/image/${id}/${filename}`;
}
