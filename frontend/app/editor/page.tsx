"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Editor } from "@/components/Editor";
import { ArrowLeft } from "lucide-react";

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get("id");
  const w = parseInt(params.get("w") ?? "1920", 10);
  const h = parseInt(params.get("h") ?? "1080", 10);
  const name = params.get("name") ?? "image.png";

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen text-text-muted">
        No session found.{" "}
        <button onClick={() => router.push("/")} className="ml-2 text-accent underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      {/* Header */}
      <header className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          New image
        </button>
        <div className="h-4 w-px bg-bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-text-primary">BG Remover</span>
        </div>
      </header>

      <Editor
        sessionId={id}
        originalFilename={`original${name.match(/\.(png|jpg|jpeg|webp)$/i)?.[0] ?? ".png"}`}
        imageWidth={w}
        imageHeight={h}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
