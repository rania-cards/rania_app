"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href ? "text-emerald-300" : "text-slate-200";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 text-slate-950 text-lg font-bold">
            R
          </span>
          <span className="text-sm font-semibold tracking-wide">
            RANIA Moments
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className={isActive("/")}>
            Home
          </Link>
          <Link
            href="/pricing"
            className={isActive("(marketing)/pricing")}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={isActive("/dashboard")}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/create/moment"
            className="hidden sm:inline-flex rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400 transition"
          >
            Start a moment for FREE
          </Link>
        </div>
      </div>
    </header>
  );
}