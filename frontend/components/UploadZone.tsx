"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import clsx from "clsx";

interface UploadZoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 50 * 1024 * 1024;

export function UploadZone({ onFile, loading }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return "Unsupported format. Use PNG, JPG, or WebP.";
    if (file.size > MAX_SIZE) return "File too large (max 50MB).";
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-center",
        "w-full max-w-2xl mx-auto aspect-video rounded-2xl",
        "border-2 border-dashed transition-all duration-200 cursor-pointer",
        "group",
        dragging
          ? "border-accent bg-accent/10"
          : "border-bg-border hover:border-accent/60 hover:bg-bg-surface/50",
        loading && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED.join(",")}
        onChange={onInputChange}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Uploading…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 px-8 text-center">
          <div className={clsx(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            "bg-bg-raised group-hover:bg-accent/20",
          )}>
            {dragging
              ? <ImageIcon className="w-8 h-8 text-accent" />
              : <Upload className="w-8 h-8 text-text-muted group-hover:text-accent transition-colors" />
            }
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {dragging ? "Drop your image here" : "Drag your image or click to upload"}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              PNG, JPG, WebP — up to 50 MB
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center mt-2">
            {["Portraits", "Products", "Animals", "Logos"].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs rounded-full bg-bg-raised text-text-muted border border-bg-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="absolute bottom-4 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
