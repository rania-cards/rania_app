import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "RANIA — Say it in a way they'll remember ✨",
  description:
    "Turn your thoughts into beautiful, meaningful moments — text cards, or short videos — for the people who deserve something thoughtful.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-black text-slate-50 flex flex-col antialiased">
        <Navbar />

        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}