import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noble Studio — EHM Strategies",
  description: "AI-powered video generator for Noble the Bull",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
