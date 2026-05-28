"use client";

import { useState, useCallback } from "react";
import { CanvasEditor } from "./CanvasEditor";
import { Sidebar, SidebarMode, BrushMode, ExportFormat, ExportQuality } from "./Sidebar";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import {
  removeBackground, segmentPoint, refineResult,
  exportImage, pollStatus, imageUrl
} from "@/lib/api";
import clsx from "clsx";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface EditorProps {
  sessionId: string;
  originalFilename: string;
  imageWidth: number;
  imageHeight: number;
}

export function Editor({ sessionId, originalFilename, imageWidth, imageHeight }: EditorProps) {
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<SidebarMode>("auto");
  const [brushMode, setBrushMode] = useState<BrushMode>("view");
  const [brushSize, setBrushSize] = useState(20);
  const [feather, setFeather] = useState(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<ExportQuality>("hd");
  const [brushMaskDataUrl, setBrushMaskDataUrl] = useState<string | null>(null);

  const originalUrl = imageUrl(sessionId, originalFilename);

  const cacheBust = (url: string) => `${url}?t=${Date.now()}`;

  const handleProcess = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      if (mode === "auto") {
        await removeBackground(sessionId);
        await pollStatus(sessionId);
        setResultUrl(cacheBust(imageUrl(sessionId, "result.png")));
      }
    } catch (e: any) {
      setError(e.message || "Processing failed");
    } finally {
      setProcessing(false);
    }
  }, [sessionId, mode]);

  const handlePointClick = useCallback(async (x: number, y: number) => {
    if (mode !== "select") return;
    setProcessing(true);
    setError(null);
    try {
      const res = await segmentPoint(sessionId, x, y);
      // Apply mask — in fallback mode this returns rembg result
      await pollStatus(sessionId);
      setResultUrl(cacheBust(imageUrl(sessionId, "result.png")));
    } catch (e: any) {
      setError(e.message || "Segmentation failed");
    } finally {
      setProcessing(false);
    }
  }, [sessionId, mode]);

  const handleRefine = useCallback(async (action: string) => {
    setProcessing(true);
    setError(null);
    try {
      await refineResult(sessionId, action);
      setResultUrl(cacheBust(imageUrl(sessionId, "result.png")));
    } catch (e: any) {
      setError(e.message || "Refinement failed");
    } finally {
      setProcessing(false);
    }
  }, [sessionId]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      let maskData: string | undefined;
      if (brushMaskDataUrl) {
        maskData = brushMaskDataUrl.split(",")[1];
      }
      const res = await exportImage(sessionId, exportFormat, exportQuality, feather, maskData);
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}${res.download_url}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `removed-bg.${exportFormat}`;
      a.click();
    } catch (e: any) {
      setError(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }, [sessionId, exportFormat, exportQuality, feather, brushMaskDataUrl]);

  const canvasMode = mode === "select" ? "select"
    : brushMode === "brush-add" ? "brush-add"
    : brushMode === "brush-subtract" ? "brush-subtract"
    : "view";

  return (
    <div className="flex gap-4 h-[calc(100vh-96px)]">
      {/* Canvas area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 bg-bg-surface border border-bg-border rounded-xl px-4 py-2.5">
          <span className="text-sm text-text-muted truncate flex-1">{originalFilename}</span>
          {resultUrl && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {showComparison
                ? <ToggleRight className="w-5 h-5 text-accent" />
                : <ToggleLeft className="w-5 h-5" />
              }
              Before / After
            </button>
          )}
          {processing && (
            <div className="flex items-center gap-2 text-sm text-accent">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Processing…
            </div>
          )}
        </div>

        {/* Canvas / comparison */}
        <div className="flex-1 overflow-hidden">
          {showComparison && resultUrl ? (
            <BeforeAfterSlider
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              width={imageWidth}
              height={imageHeight}
            />
          ) : (
            <CanvasEditor
              originalUrl={originalUrl}
              resultUrl={resultUrl ?? undefined}
              mode={canvasMode}
              brushSize={brushSize}
              onBrushStroke={(dataUrl) => setBrushMaskDataUrl(dataUrl)}
              onPointClick={handlePointClick}
              width={imageWidth}
              height={imageHeight}
            />
          )}
        </div>

        {error && (
          <div className="px-4 py-2.5 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        processing={processing}
        hasResult={!!resultUrl}
        mode={mode}
        onModeChange={setMode}
        brushMode={brushMode}
        onBrushModeChange={setBrushMode}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onProcess={handleProcess}
        onRefine={handleRefine}
        feather={feather}
        onFeatherChange={setFeather}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        exportQuality={exportQuality}
        onExportQualityChange={setExportQuality}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}
