"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
            RANIA
          </div>
        </Link>

        {/* Create Moment Button */}
        <Link
          href="/create/moment"
          className="group relative px-6 py-2 rounded-full font-bold text-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
          <div className="relative flex items-center gap-2 bg-black px-6 py-2 rounded-full group-hover:bg-opacity-80 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/50">
            ✨ Create Moment
          </div>
        </Link>
      </div>
    </nav>
  );
}