import { NavLink } from "react-router";
import { Home, Calendar, Clock, Scissors, User } from "lucide-react";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

export default function ClientMobileDock({ upcomingCount = 0 }) {
  const links = [
    { to: "/portal", label: "Inicio", icon: Home, end: true },
    { to: "/portal/mis-citas", label: "Citas", icon: Clock, badge: upcomingCount > 0 ? upcomingCount : null },
    { to: "/portal/agendar", label: "Agendar", icon: Calendar, highlight: true },
    { to: "/portal/servicios", label: "Servicios", icon: Scissors },
    { to: "/portal/perfil", label: "Perfil", icon: User }
  ];

  return (
    <nav aria-label="Navegación Móvil Rápida" className="md:hidden fixed bottom-3 left-3 right-3 z-40">
      <div className="flex items-center justify-around px-2 py-2 rounded-2xl bg-card/90 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
        {links.map((link) => {
          const Icon = link.icon;

          if (link.highlight) {
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFE082] via-[#E8C466] to-[#DDAE41] text-black shadow-lg shadow-[#DDAE41]/40 transition-transform active:scale-90 ${
                    isActive ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-105" : ""
                  }`
                }
              >
                <BarberScissorsIcon className="w-6 h-6" strokeWidth={2.3} />
                <span className="sr-only">Agendar Cita</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-[#DDAE41] dark:text-[#E8C466] font-extrabold scale-105"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {link.badge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
