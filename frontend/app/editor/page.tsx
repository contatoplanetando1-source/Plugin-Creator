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
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://brand.v4company.com/images/logos/simbolo.webp"
            alt="V4"
            className="h-6 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="leading-none">
            <span className="block font-black text-sm text-white tracking-tight">Remove BG</span>
            <span className="block text-[10px] text-text-muted font-semibold tracking-widest uppercase">Inside Jasson</span>
          </div>
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
