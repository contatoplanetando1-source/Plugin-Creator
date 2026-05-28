"use client";

import { useCallback, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  originalUrl: string;
  resultUrl: string;
  width: number;
  height: number;
}

export function BeforeAfterSlider({ originalUrl, resultUrl, width, height }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePosition(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  };

  const onMouseUp = () => { dragging.current = false; };

  const onTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  const aspect = height / width;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl select-none cursor-col-resize"
      style={{ paddingBottom: `${aspect * 100}%` }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* Result image (after) — full */}
      <div className="absolute inset-0 checkerboard">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resultUrl} alt="Result" className="w-full h-full object-contain" draggable={false} />
      </div>

      {/* Original image (before) — clipped to left portion */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" draggable={false} />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 7H1M4 7L2 5M4 7L2 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7H13M10 7L12 5M10 7L12 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs bg-black/60 text-white">Before</div>
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-black/60 text-white">After</div>
    </div>
  );
}
