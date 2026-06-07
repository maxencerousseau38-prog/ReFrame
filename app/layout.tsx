import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valoryx — Intelligence d'investissement",
  description:
    "Transformez des dizaines de pages de données financières en une analyse d'investissement institutionnelle en moins de 60 secondes.",
  metadataBase: new URL("https://valoryx.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 antialiased">{children}</body>
    </html>
  );
}
