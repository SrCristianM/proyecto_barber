import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Activity, Clock, Users, Scissors, Sparkles, ChevronRight } from "lucide-react";

export default function SalonLiveRadar({ compact = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [activeBarbers] = useState(3);
  const [estimatedWaitTime] = useState("15-20 min");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const day = now.getDay(); // 0 = Domingo

      // Horario: Lunes a Sábado 9am - 8pm, Domingos 10am - 4pm
      const openHour = day === 0 ? 10 : 9;
      const closeHour = day === 0 ? 16 : 20;

      const currentlyOpen = hours >= openHour && hours < closeHour;
      setIsOpen(currentlyOpen);
      setCurrentTimeStr(`${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 border border-border/80 shadow-xs text-[11px] backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          {isOpen && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOpen ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="font-bold text-foreground">
          {isOpen ? "Salón Abierto" : "Cerrado"}
        </span>
        <span className="text-muted-foreground hidden lg:inline">•</span>
        <span className="text-muted-foreground hidden lg:inline">
          {isOpen ? `${activeBarbers} barberos en silla` : "Abre 9:00 AM"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-background border border-[#DFB755]/30 p-5 sm:p-6 shadow-xl">
      {/* Luz neón ambiental */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#DFB755]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Radar icon pulse */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFB755]/15 border border-[#DFB755]/30 text-[#DFB755] shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DFB755]">
                Radar de Salón en Vivo
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                {isOpen ? "Abierto Hoy" : "Cerrado"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {isOpen ? "Atendiendo en tiempo real" : "Horario fuera de servicio"}
            </h3>
          </div>
        </div>

        {/* Métricas en vivo */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border">
            <Users className="w-4 h-4 text-[#DFB755]" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Barberos Activos</span>
              <span className="font-black text-foreground">{activeBarbers} Disponibles</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border">
            <Clock className="w-4 h-4 text-[#DFB755]" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Espera Estimada</span>
              <span className="font-black text-foreground">{estimatedWaitTime}</span>
            </div>
          </div>

          <Link
            to="/portal/agendar"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/20 transition-all hover:scale-105 active:scale-95 ml-auto sm:ml-0"
          >
            <span>Tomar Turno</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
