import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-black/40 backdrop-blur fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/">
          <span className="text-lg font-semibold bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            RANIA
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <Link href="/create/moment" className="hover:text-emerald-300 transition">
            Create Moment
          </Link>
        </nav>
      </div>
    </header>
  );
}