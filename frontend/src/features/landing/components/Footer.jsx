import { Scissors, MapPin, Phone, Clock, ArrowUp, Instagram, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";

const NAV_LINKS = [
  { name: "INICIO", href: "#" },
  { name: "SERVICIOS", href: "#servicios" },
  { name: "BARBEROS", href: "#barberos" },
  { name: "GALERÍA", href: "#galeria" },
  { name: "NOSOTROS", href: "#nosotros" },
  { name: "CONTACTO", href: "#contacto" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contacto" className="bg-[#080808] border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Gold Ambient Glow */}
      <div className="ambient-glow-gold w-[400px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#C9A24A]" />
              </div>
              <div>
                <div style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.82rem" }} className="font-bold">
                  TU TURNO
                </div>
                <div style={{ color: "#8E8E93", letterSpacing: "0.28em", fontSize: "0.58rem" }} className="font-medium">
                  BARBERÍA
                </div>
              </div>
            </div>

            <p className="text-[#8E8E93] text-xs leading-relaxed">
              Combinamos pasión, precisión milimétrica y hospitalidad de primera para brindarte un servicio inolvidable en cada visita.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B5B5B5] hover:text-[#C9A24A] hover:border-[#C9A24A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B5B5B5] hover:text-[#C9A24A] hover:border-[#C9A24A] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B5B5B5] hover:text-[#C9A24A] hover:border-[#C9A24A] transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4 text-[#C9A24A]">
              ENLACES RÁPIDOS
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#8E8E93] hover:text-white text-xs tracking-wider transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Hours & Status */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4 text-[#C9A24A]">
              HORARIOS DE ATENCIÓN
            </h4>
            <div className="space-y-3 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.7rem] font-bold">ABIERTO HOY</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#C9A24A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Lunes a Sábado</p>
                  <p className="text-[#7A7A7A] text-[0.72rem]">09:00 AM - 08:00 PM</p>
                </div>
              </div>
              <div className="text-[0.72rem] text-[#7A7A7A] pl-6">
                Domingos y Feriados con reserva previa
              </div>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4 text-[#C9A24A]">
              UBICACIÓN & CONTACTO
            </h4>
            <div className="space-y-3 text-xs text-[#8E8E93]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A24A] flex-shrink-0 mt-0.5" />
                <span>Av. Principal #123, Centro de la Ciudad</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A24A] flex-shrink-0" />
                <span>+57 (300) 123-4567</span>
              </div>
              
              <div className="pt-2">
                <Link
                  to="/login"
                  className="block w-full py-2.5 text-center bg-[#C9A24A] text-black font-bold rounded-lg text-xs hover:bg-[#E0B85C] transition-colors shadow-md"
                >
                  RESERVAR EN LÍNEA
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Back to top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#555555] text-xs">
            © 2026 Tu Turno Barbería. Todos los derechos reservados.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs text-[#8E8E93] hover:text-[#C9A24A] transition-colors group cursor-pointer"
          >
            <span>Volver arriba</span>
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#C9A24A] group-hover:bg-[#C9A24A]/10 transition-colors">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}