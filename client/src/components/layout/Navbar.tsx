import { Menu, X, Dumbbell } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">

        {/* Logo */}
        <a
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-600 flex items-center justify-center">
            <Dumbbell className="text-white" size={22} />
          </div>

          <div>
            <h1 className="text-white text-xl font-bold tracking-wide">
              ApexFit
            </h1>

            <p className="text-xs text-zinc-400 -mt-1">
              AI Fitness Platform
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-zinc-300 font-medium">

          <a
            href="#home"
            className="hover:text-cyan-400 transition"
          >
            Home
          </a>

          <a
            href="#features"
            className="hover:text-cyan-400 transition"
          >
            Features
          </a>

          <a
            href="#research"
            className="hover:text-cyan-400 transition"
          >
            Research
          </a>

          <a
            href="#future"
            className="hover:text-cyan-400 transition"
          >
            Future
          </a>

          <a
            href="#contact"
            className="hover:text-cyan-400 transition"
          >
            Contact
          </a>

        </nav>

        {/* Authentication */}
        <div className="hidden md:flex items-center gap-4">

          <a
            href="/login"
            className="text-zinc-300 hover:text-white transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition text-white font-medium"
          >
            Register
          </a>

        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-6 space-y-5">

          <a
            href="#home"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Home
          </a>

          <a
            href="#features"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Features
          </a>

          <a
            href="#research"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Research
          </a>

          <a
            href="#future"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Future
          </a>

          <a
            href="#contact"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Contact
          </a>

          <a
            href="/login"
            onClick={closeMenu}
            className="block text-zinc-300 hover:text-cyan-400"
          >
            Login
          </a>

          <a
            href="/register"
            onClick={closeMenu}
            className="block text-center py-3 rounded-xl bg-cyan-500 text-white"
          >
            Register
          </a>

        </div>
      )}
    </header>
  );
}