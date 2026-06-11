import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReFrame - reframe any website into something worth visiting",
  description:
    "Paste a link. ReFrame analyzes your existing website and rebuilds it into a fast, modern site you can edit by chatting with AI. Live in minutes.",
  metadataBase: new URL("https://reframe.design"),
  openGraph: {
    title: "ReFrame",
    description: "Reframe any website into a fast, modern site you edit with AI.",
    type: "website",
    images: ["/brand/reframe-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="grain min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
