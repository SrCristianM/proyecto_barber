import { Link } from "react-router";
import { Scissors, Menu, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { name: "INICIO", href: "#" },
  { name: "SERVICIOS", href: "#servicios" },
  { name: "BARBEROS", href: "#barberos" },
  { name: "GALERÍA", href: "#galeria" },
  { name: "NOSOTROS", href: "#nosotros" },
  { name: "CONTACTO", href: "#contacto" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-[#C9A24A]/25 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          : "bg-[#0D0D0D]/70 backdrop-blur-md border-b border-white/5 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-8 h-8 rounded-lg bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center group-hover:border-[#C9A24A] transition-colors"
          >
            <Scissors className="w-4 h-4 text-[#C9A24A]" />
          </motion.div>
          <div className="leading-tight">
            <div
              style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.82rem" }}
              className="font-bold tracking-wider group-hover:text-[#E0B85C] transition-colors flex items-center gap-1"
            >
              TU TURNO
            </div>
            <div
              style={{ color: "#8E8E93", letterSpacing: "0.28em", fontSize: "0.58rem" }}
              className="font-medium"
            >
              BARBERÍA
            </div>
          </div>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative py-1 text-[#A0A0A0] hover:text-white transition-colors duration-200 text-[0.73rem] font-medium tracking-[0.14em]"
            >
              {link.name}
              {hoveredLink === link.name && (
                <motion.div
                  layoutId="navbar-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24A] to-transparent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/login"
              style={{
                backgroundColor: "#C9A24A",
                color: "#0D0D0D",
                letterSpacing: "0.12em",
                fontSize: "0.74rem",
              }}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 font-bold shadow-[0_0_20px_rgba(201,162,74,0.3)] hover:shadow-[0_0_28px_rgba(201,162,74,0.55)] transition-all duration-300 group overflow-hidden"
            >
              {/* Shimmer sweep effect on button */}
              <span className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />
              <span className="relative z-10 font-black">RESERVAR CITA</span>
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 text-[#C9A24A] hover:bg-[#C9A24A]/10 rounded-lg transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Alternar menú"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#111111]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-6 flex flex-col gap-4 overflow-hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[#B5B5B5] hover:text-[#C9A24A] text-sm font-semibold tracking-wider transition-colors py-1.5"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 w-full py-3 bg-[#C9A24A] text-[#0D0D0D] font-bold text-center tracking-wider text-xs shadow-[0_0_15px_rgba(201,162,74,0.3)] hover:bg-[#E0B85C] transition-colors"
            >
              RESERVAR CITA
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}