import { Scissors } from "lucide-react";

const NAV_LINKS = ["INICIO", "SERVICIOS", "BARBEROS", "GALERÍA", "NOSOTROS", "CONTACTO"];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0D0D0D", borderTop: "1px solid #1a1a1a" }} className="py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5" style={{ color: "#C9A24A" }} />
          <div>
            <div style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.8rem" }} className="font-bold">TU TURNO</div>
            <div style={{ color: "#B5B5B5", letterSpacing: "0.25em", fontSize: "0.6rem" }}>BARBERÍA</div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" style={{ color: "#B5B5B5", fontSize: "0.7rem", letterSpacing: "0.08em" }} className="hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </div>
        <p style={{ color: "#555555", fontSize: "0.7rem" }}>
          © 2026 Tu Turno Barbería
        </p>
      </div>
    </footer>
  );
}