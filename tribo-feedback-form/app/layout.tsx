import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feedback da Tribo | V4 Company",
  description:
    "Compartilhe sua opinião sobre as Learnings, a Tribo e oportunidades de melhoria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="font-sans text-v4-near-black antialiased">
        {children}
      </body>
    </html>
  );
}
