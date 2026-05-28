"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { uploadImage } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadImage(file);
      router.push(
        `/editor?id=${res.id}&w=${res.width}&h=${res.height}&name=${encodeURIComponent(file.name)}`
      );
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-text-primary">BG Remover</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
            Free — No credits
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent font-medium">AI-Powered · Runs Locally · No Limits</span>
        </div>

        <h1 className="text-5xl font-bold text-text-primary mt-4 mb-4 tracking-tight leading-tight">
          Remove backgrounds<br />
          <span className="text-accent">with precision</span>
        </h1>

        <p className="text-lg text-text-muted max-w-lg mb-12">
          Professional-grade background removal. Handles hair, fur, transparent objects, and complex edges — all running locally on your infrastructure.
        </p>

        <UploadZone onFile={handleFile} loading={loading} />

        {error && (
          <p className="mt-4 text-sm text-danger">{error}</p>
        )}

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center text-sm text-text-muted">
          {[
            "Fine hair & fur",
            "Transparent objects",
            "White-on-white",
            "Complex backgrounds",
            "Batch ready",
            "No watermarks",
          ].map((feat) => (
            <span key={feat} className="px-4 py-1.5 rounded-full border border-bg-border bg-bg-surface">
              {feat}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
