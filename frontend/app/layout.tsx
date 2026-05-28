import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remove BG - Inside Jasson",
  description: "Remoção de fundo premium com IA. Sem créditos, sem limites. By V4 Company.",
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
