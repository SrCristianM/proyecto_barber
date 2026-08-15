import { Link } from "react-router";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = ["INICIO", "SERVICIOS", "BARBEROS", "GALERÍA", "NOSOTROS", "CONTACTO"];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{ backgroundColor: "rgba(13,13,13,0.95)", borderBottom: "1px solid #222222", backdropFilter: "blur(8px)" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5" style={{ color: "#C9A24A" }} />
          <div className="leading-tight">
            <div style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.78rem" }} className="font-bold">TU TURNO</div>
            <div style={{ color: "#B5B5B5", letterSpacing: "0.25em", fontSize: "0.58rem" }}>BARBERÍA</div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" style={{ color: "#B5B5B5", letterSpacing: "0.08em", fontSize: "0.72rem" }} className="hover:text-white transition-colors duration-200">
              {link}
            </a>
          ))}
        </nav>

        <Link
          to="/login"
          style={{ backgroundColor: "#C9A24A", color: "#0D0D0D", letterSpacing: "0.1em", fontSize: "0.72rem" }}
          className="hidden lg:inline-block px-6 py-2.5 font-bold hover:bg-[#E0B85C] transition-colors duration-200"
        >
          RESERVAR CITA
        </Link>

        <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen
            ? <X className="w-5 h-5" style={{ color: "#C9A24A" }} />
            : <Menu className="w-5 h-5" style={{ color: "#C9A24A" }} />}
        </button>
      </div>

      {menuOpen && (
        <div style={{ backgroundColor: "#151515", borderTop: "1px solid #222222" }} className="lg:hidden px-6 py-5 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" style={{ color: "#B5B5B5", letterSpacing: "0.08em", fontSize: "0.8rem" }} className="hover:text-white">
              {link}
            </a>
          ))}
          <Link
            to="/login"
            style={{ backgroundColor: "#C9A24A", color: "#0D0D0D", letterSpacing: "0.1em", fontSize: "0.8rem" }}
            className="px-6 py-3 font-bold text-center hover:bg-[#E0B85C] transition-colors"
          >
            RESERVAR CITA
          </Link>
        </div>
      )}
    </header>
  );
}