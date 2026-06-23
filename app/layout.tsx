import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noble Studio — EHM Strategies",
  description: "AI-powered video generator for Noble the Bull, the EHM Strategies mascot.",
  icons: { icon: "/noble-badge.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
