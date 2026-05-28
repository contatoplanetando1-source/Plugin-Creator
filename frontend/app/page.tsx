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
    <main className="min-h-screen flex flex-col bg-bg-base font-sans">
      {/* Header */}
      <header className="border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* V4 Logo mark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://brand.v4company.com/images/logos/simbolo.webp"
            alt="V4 Company"
            className="h-8 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <span className="font-black text-lg text-white tracking-tight leading-none">
              Remove BG
            </span>
            <span className="block text-xs text-text-muted font-medium tracking-widest uppercase">
              Inside Jasson
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
            Grátis · Sem créditos
          </span>
          {/* V4 wordmark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://brand.v4company.com/images/logos/simbolo-company.webp"
            alt="V4 Company"
            className="h-6 w-auto opacity-60 hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/25">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent font-semibold tracking-wide uppercase">
            IA Local · Sem API paga · Controle total
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-white mt-2 mb-4 tracking-tight leading-[1.05]">
          Remove fundo<br />
          <span className="text-accent">com precisão</span>
        </h1>

        <p className="text-base text-text-muted max-w-md mb-12 font-medium leading-relaxed">
          Qualidade profissional. Cabelo, pelos, objetos transparentes e bordas complexas — tudo rodando localmente na sua infraestrutura.
        </p>

        {/* Upload area */}
        <UploadZone onFile={handleFile} loading={loading} />

        {error && (
          <p className="mt-4 text-sm text-accent font-medium">{error}</p>
        )}

        {/* Feature chips */}
        <div className="mt-12 flex flex-wrap gap-2.5 justify-center">
          {[
            "Cabelo & pelos finos",
            "Objetos transparentes",
            "Branco sobre branco",
            "Fundo complexo",
            "Sem marca d'água",
            "Exporta PNG / JPG / WebP",
          ].map((feat) => (
            <span
              key={feat}
              className="px-4 py-1.5 rounded-full border border-bg-border bg-bg-surface text-sm text-text-muted font-medium"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-bg-border px-6 py-4 flex items-center justify-between text-xs text-text-muted">
        <span>Remove BG · Inside Jasson</span>
        <span className="font-semibold text-accent">V4 Company</span>
      </footer>
    </main>
  );
}
