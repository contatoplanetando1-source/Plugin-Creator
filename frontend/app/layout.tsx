import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Background Remover — Premium Quality",
  description: "Remove image backgrounds with AI precision. No credits, no limits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
