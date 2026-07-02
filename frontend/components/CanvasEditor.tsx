"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const Stage = dynamic(() => import("react-konva").then((m) => m.Stage), { ssr: false });
const Layer = dynamic(() => import("react-konva").then((m) => m.Layer), { ssr: false });
const KonvaImage = dynamic(() => import("react-konva").then((m) => m.Image), { ssr: false });

interface CanvasEditorProps {
  originalUrl: string;
  resultUrl?: string;
  mode: "view" | "brush-add" | "brush-subtract" | "select";
  brushSize: number;
  onBrushStroke?: (maskDataUrl: string) => void;
  onPointClick?: (x: number, y: number) => void;
  width: number;
  height: number;
}

export function CanvasEditor({
  originalUrl,
  resultUrl,
  mode,
  brushSize,
  onBrushStroke,
  onPointClick,
  width,
  height,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null);
  const [resultImg, setResultImg] = useState<HTMLImageElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Fit image into container
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      const scale = cw / width;
      setStageSize({ w: cw, h: height * scale });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [width, height]);

  // Load images
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = originalUrl;
    img.onload = () => setOriginalImg(img);
  }, [originalUrl]);

  useEffect(() => {
    if (!resultUrl) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = resultUrl;
    img.onload = () => setResultImg(img);
  }, [resultUrl]);

  // Initialize mask canvas
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
    maskCanvasRef.current = c;
  }, [width, height]);

  const scale = stageSize.w / width;

  const getPos = (e: { evt: MouseEvent | TouchEvent }) => {
    const stage = (e as any).target?.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x / scale, y: pos.y / scale };
  };

  const paintBrush = useCallback((x: number, y: number) => {
    const c = maskCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation =
      mode === "brush-subtract" ? "destination-out" : "source-over";
    ctx.fillStyle = mode === "brush-subtract" ? "rgba(0,0,0,1)" : "rgba(255,255,255,0.9)";
    ctx.beginPath();
    if (lastPos.current) {
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = ctx.fillStyle;
      ctx.globalCompositeOperation =
        mode === "brush-subtract" ? "destination-out" : "source-over";
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Refresh mask image for konva
    const dataUrl = c.toDataURL();
    const img = new window.Image();
    img.src = dataUrl;
    img.onload = () => setMaskImage(img);
  }, [mode, brushSize]);

  const handleMouseDown = (e: any) => {
    const pos = getPos(e);
    if (!pos) return;

    if (mode === "select") {
      onPointClick?.(pos.x, pos.y);
      return;
    }

    if (mode === "brush-add" || mode === "brush-subtract") {
      drawing.current = true;
      lastPos.current = pos;
      paintBrush(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!drawing.current) return;
    const pos = getPos(e);
    if (!pos) return;
    paintBrush(pos.x, pos.y);
    lastPos.current = pos;
  };

  const handleMouseUp = () => {
    if (drawing.current && maskCanvasRef.current) {
      drawing.current = false;
      lastPos.current = null;
      onBrushStroke?.(maskCanvasRef.current.toDataURL());
    }
  };

  const cursor =
    mode === "brush-add" ? "crosshair"
    : mode === "brush-subtract" ? "cell"
    : mode === "select" ? "pointer"
    : "default";

  return (
    <div ref={containerRef} className="w-full checkerboard rounded-xl overflow-hidden" style={{ cursor }}>
      {typeof window !== "undefined" && (
        <Stage
          width={stageSize.w}
          height={stageSize.h}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {originalImg && !resultImg && (
              <KonvaImage
                image={originalImg}
                x={0} y={0}
                width={stageSize.w}
                height={stageSize.h}
              />
            )}
            {resultImg && (
              <KonvaImage
                image={resultImg}
                x={0} y={0}
                width={stageSize.w}
                height={stageSize.h}
              />
            )}
            {maskImage && (mode === "brush-add" || mode === "brush-subtract") && (
              <KonvaImage
                image={maskImage}
                x={0} y={0}
                width={stageSize.w}
                height={stageSize.h}
                opacity={0.5}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
