"use client";

import { useState } from "react";
import clsx from "clsx";
import { Download, Sliders, Layers, Wand2 } from "lucide-react";

export type SidebarMode = "auto" | "select";
export type SidebarTab = "mode" | "refine" | "adjust" | "export";
export type BrushMode = "brush-add" | "brush-subtract" | "view" | "select";
export type ExportFormat = "png" | "jpg" | "webp";
export type ExportQuality = "hd" | "4k";

interface SidebarProps {
  processing: boolean;
  hasResult: boolean;
  mode: SidebarMode;
  onModeChange: (m: SidebarMode) => void;
  brushMode: BrushMode;
  onBrushModeChange: (m: BrushMode) => void;
  brushSize: number;
  onBrushSizeChange: (v: number) => void;
  onProcess: () => void;
  onRefine: (action: string) => void;
  feather: number;
  onFeatherChange: (v: number) => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (f: ExportFormat) => void;
  exportQuality: ExportQuality;
  onExportQualityChange: (q: ExportQuality) => void;
  onExport: () => void;
  exporting: boolean;
}

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: "mode", label: "Mode", icon: <Wand2 className="w-4 h-4" /> },
  { id: "refine", label: "Refine", icon: <Layers className="w-4 h-4" /> },
  { id: "adjust", label: "Adjust", icon: <Sliders className="w-4 h-4" /> },
  { id: "export", label: "Export", icon: <Download className="w-4 h-4" /> },
];

export function Sidebar({
  processing, hasResult, mode, onModeChange,
  brushMode, onBrushModeChange, brushSize, onBrushSizeChange,
  onProcess, onRefine,
  feather, onFeatherChange,
  exportFormat, onExportFormatChange,
  exportQuality, onExportQualityChange,
  onExport, exporting,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("mode");

  return (
    <aside className="w-72 shrink-0 bg-bg-surface border border-bg-border rounded-2xl flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-bg-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-accent border-b-2 border-accent bg-accent/5"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === "mode" && (
          <ModeTab
            mode={mode}
            onModeChange={onModeChange}
            brushMode={brushMode}
            onBrushModeChange={onBrushModeChange}
            brushSize={brushSize}
            onBrushSizeChange={onBrushSizeChange}
            processing={processing}
            hasResult={hasResult}
            onProcess={onProcess}
          />
        )}
        {tab === "refine" && (
          <RefineTab hasResult={hasResult} onRefine={onRefine} processing={processing} />
        )}
        {tab === "adjust" && (
          <AdjustTab feather={feather} onFeatherChange={onFeatherChange} />
        )}
        {tab === "export" && (
          <ExportTab
            hasResult={hasResult}
            format={exportFormat}
            onFormatChange={onExportFormatChange}
            quality={exportQuality}
            onQualityChange={onExportQualityChange}
            onExport={onExport}
            exporting={exporting}
          />
        )}
      </div>
    </aside>
  );
}

function ModeTab({ mode, onModeChange, brushMode, onBrushModeChange, brushSize, onBrushSizeChange, processing, hasResult, onProcess }: {
  mode: SidebarMode;
  onModeChange: (m: SidebarMode) => void;
  brushMode: BrushMode;
  onBrushModeChange: (m: BrushMode) => void;
  brushSize: number;
  onBrushSizeChange: (v: number) => void;
  processing: boolean;
  hasResult: boolean;
  onProcess: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Processing Mode</p>
        <div className="space-y-2">
          {[
            { value: "auto", label: "Auto Remove", desc: "AI removes background automatically" },
            { value: "select", label: "Select Object", desc: "Click to select specific objects" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onModeChange(opt.value as SidebarMode)}
              className={clsx(
                "w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                mode === opt.value
                  ? "border-accent bg-accent/10 text-text-primary"
                  : "border-bg-border bg-bg-raised text-text-muted hover:border-accent/40"
              )}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs text-text-muted mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onProcess}
        disabled={processing}
        className={clsx(
          "w-full py-3 rounded-xl font-semibold text-sm transition-all",
          "bg-accent hover:bg-accent-hover text-white",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          processing && "animate-pulse"
        )}
      >
        {processing ? "Processing…" : mode === "auto" ? "Remove Background" : "Confirm Selection"}
      </button>

      {hasResult && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Brush Tools</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { value: "view", label: "View" },
              { value: "brush-add", label: "Add", color: "text-success" },
              { value: "brush-subtract", label: "Subtract", color: "text-danger" },
            ].map((b) => (
              <button
                key={b.value}
                onClick={() => onBrushModeChange(b.value as BrushMode)}
                className={clsx(
                  "py-2 rounded-lg text-xs font-medium border transition-colors",
                  brushMode === b.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-bg-border bg-bg-raised hover:border-accent/40",
                  b.color
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Brush size</span>
              <span>{brushSize}px</span>
            </div>
            <input
              type="range" min={5} max={100} value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RefineTab({ hasResult, onRefine, processing }: {
  hasResult: boolean;
  onRefine: (action: string) => void;
  processing: boolean;
}) {
  const actions = [
    { id: "hair", label: "Improve Hair", desc: "Better handling of fine hair strands" },
    { id: "smooth", label: "Smooth Edges", desc: "Reduce jagged edges" },
    { id: "restore", label: "Restore Areas", desc: "Recover accidentally removed areas" },
    { id: "shrink", label: "Remove Remnants", desc: "Shrink mask to eliminate background leftovers" },
  ];

  if (!hasResult) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        Process an image first to access refinement tools.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Refinement Actions</p>
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => onRefine(a.id)}
          disabled={processing}
          className={clsx(
            "w-full text-left px-3 py-2.5 rounded-lg border border-bg-border",
            "bg-bg-raised hover:border-accent/40 hover:bg-accent/5",
            "transition-colors disabled:opacity-50"
          )}
        >
          <div className="font-medium text-sm text-text-primary">{a.label}</div>
          <div className="text-xs text-text-muted mt-0.5">{a.desc}</div>
        </button>
      ))}
    </div>
  );
}

function AdjustTab({ feather, onFeatherChange }: {
  feather: number;
  onFeatherChange: (v: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Fine-tune</p>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-primary">Feather / Blur</span>
          <span className="text-text-muted">{feather}px</span>
        </div>
        <input
          type="range" min={0} max={20} value={feather}
          onChange={(e) => onFeatherChange(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-text-muted mt-1">Softens edges on export</p>
      </div>
    </div>
  );
}

function ExportTab({ hasResult, format, onFormatChange, quality, onQualityChange, onExport, exporting }: {
  hasResult: boolean;
  format: ExportFormat;
  onFormatChange: (f: ExportFormat) => void;
  quality: ExportQuality;
  onQualityChange: (q: ExportQuality) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Format</p>
        <div className="grid grid-cols-3 gap-2">
          {(["png", "jpg", "webp"] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => onFormatChange(f)}
              className={clsx(
                "py-2 rounded-lg text-sm font-medium border transition-colors uppercase",
                format === f
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-bg-border bg-bg-raised text-text-muted hover:border-accent/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        {format === "png" && <p className="text-xs text-text-muted mt-2">Transparent background</p>}
        {format === "jpg" && <p className="text-xs text-text-muted mt-2">White background</p>}
        {format === "webp" && <p className="text-xs text-text-muted mt-2">Transparent, smaller file</p>}
      </div>

      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Quality</p>
        <div className="grid grid-cols-2 gap-2">
          {(["hd", "4k"] as ExportQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={clsx(
                "py-2 rounded-lg text-sm font-medium border transition-colors uppercase",
                quality === q
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-bg-border bg-bg-raised text-text-muted hover:border-accent/40"
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onExport}
        disabled={!hasResult || exporting}
        className={clsx(
          "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
          "bg-accent hover:bg-accent-hover text-white",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Download className="w-4 h-4" />
        {exporting ? "Preparing…" : "Download"}
      </button>
    </div>
  );
}
