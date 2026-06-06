import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DriveOS — Pilotez toutes vos ventes automobiles",
  description:
    "DriveOS centralise vos prospects, votre stock, vos rendez-vous et vos analyses. Le logiciel moderne pensé pour les garagistes.",
  applicationName: "DriveOS",
  appleWebApp: {
    capable: true,
    title: "DriveOS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
