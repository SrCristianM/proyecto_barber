import { Link } from "react-router";
import { Calendar, Star } from "lucide-react";

const STATS = [
  { icon: <Calendar className="w-8 h-8" />, value: "RESERVA TU CITA", label: "Fácil y rápido", action: true },
  { icon: <Star className="w-8 h-8" />, value: "1,500+", label: "Clientes satisfechos", action: false },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    value: "4.9",
    label: "Valoración media",
    action: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    ),
    value: "5",
    label: "Años de experiencia",
    action: false,
  },
];

export default function Stats() {
  return (
    <section style={{ backgroundColor: "#151515", borderTop: "1px solid #222222", borderBottom: "1px solid #222222" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center py-10 px-4 text-center gap-3"
              style={i < STATS.length - 1 ? { borderRight: "1px solid #222222" } : {}}
            >
              <div style={{ color: "#C9A24A" }}>{stat.icon}</div>
              {stat.action ? (
                <Link
                  to="/login"
                  style={{ color: "#C9A24A", letterSpacing: "0.08em", fontSize: "0.8rem" }}
                  className="font-bold hover:opacity-80 transition-opacity"
                >
                  {stat.value}
                </Link>
              ) : (
                <span style={{ color: "#FFFFFF", fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)", fontWeight: 700 }}>
                  {stat.value}
                </span>
              )}
              <span style={{ color: "#B5B5B5", fontSize: "0.75rem", letterSpacing: "0.06em" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}