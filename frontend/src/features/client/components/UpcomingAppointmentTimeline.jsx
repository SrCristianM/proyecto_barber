import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Share2,
  Download,
  CalendarCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  Navigation,
  Send,
  Ticket
} from "lucide-react";
import { createGoogleCalendarUrl, downloadIcsFile, createWhatsAppShareUrl } from "../utils/calendarUtils";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import { toast } from "sonner";

export default function UpcomingAppointmentTimeline({
  appointment,
  onReschedule,
  onCancel
}) {
  const [countdown, setCountdown] = useState("");
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    if (!appointment) return;

    const calcTime = () => {
      const aptDate = new Date(`${appointment.fecha}T${appointment.hora.substring(0, 5)}:00`);
      const now = new Date();
      const diffMs = aptDate - now;
      const todayStr = now.toISOString().split("T")[0];
      setIsToday(appointment.fecha === todayStr);

      if (diffMs <= 0) {
        setCountdown("¡Es momento de tu cita!");
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffDays > 0) {
        setCountdown(`Faltan ${diffDays}d ${diffHours}h para tu turno`);
      } else if (diffHours > 0) {
        setCountdown(`Faltan ${diffHours}h ${diffMinutes}m para tu turno`);
      } else {
        setCountdown(`¡Tu cita es hoy en ${diffMinutes} minutos!`);
      }
    };

    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) {
    return (
      <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-7 shadow-sm text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DFB755]/10 text-[#DFB755] flex items-center justify-center">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">No tienes citas próximas</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Reserva con tu barbero favorito y mantén tu estilo siempre impecable.
          </p>
        </div>
        <Link
          to="/portal/agendar"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <BarberScissorsIcon className="w-4 h-4" />
          <span>Agendar Nuevo Turno</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { title: "Confirmada", desc: "Turno reservado", done: true },
    { title: "Preparación", desc: "Estación lista", done: true },
    { title: "En Silla", desc: "Corte y estilo", done: false },
    { title: "Completada", desc: "Listo para lucir", done: false }
  ];

  const handleNotifyOnMyWay = () => {
    const text = encodeURIComponent(
      `¡Hola! Confirmo que voy en camino a mi turno de hoy a las ${appointment.hora.substring(0, 5)} con ${appointment.barberoNombre} en Tu Turno Barber.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("Abriendo WhatsApp para avisar que vas en camino...");
  };

  const handleOpenMaps = () => {
    window.open("https://maps.google.com/?q=Barberia+Tu+Turno+Barber", "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-background border-2 border-[#DFB755]/40 p-6 sm:p-7 shadow-2xl shadow-[#DFB755]/10 space-y-6">
      {/* Troquelados circulares laterales estilo Boarding Pass */}
      <div className="hidden sm:block absolute top-[45%] -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-r-2 border-[#DFB755]/40 z-20 shadow-inner" />
      <div className="hidden sm:block absolute top-[45%] -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-l-2 border-[#DFB755]/40 z-20 shadow-inner" />

      {/* Decoración dorada superior */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFB755]/10 rounded-bl-full pointer-events-none blur-3xl" />

      {/* HEADER DE PASE DE ABORDAJE */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 dark:bg-card border border-[#DFB755]/50 text-[#DFB755] shadow-xs">
              <Ticket className="w-3 h-3 text-[#DFB755]" />
              PASE DE SERVICIO · BOARDING PASS
            </span>
            <span className="text-xs font-black text-[#DDAE41] dark:text-[#E8C466] flex items-center gap-1.5 bg-[#DFB755]/10 px-2.5 py-0.5 rounded-full border border-[#DFB755]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFB755] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFB755]" />
              </span>
              {countdown}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground mt-1.5 flex items-center gap-2">
            <span>{appointment.servicioNombre || "Servicio de Barbería"}</span>
          </h3>
        </div>

        {/* Botones de Calendario */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={createGoogleCalendarUrl(appointment)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 border border-border hover:border-[#DFB755]/40"
            title="Agregar a Google Calendar"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#DFB755]" />
            <span className="hidden sm:inline">Google Cal</span>
          </a>

          <button
            type="button"
            onClick={() => downloadIcsFile(appointment)}
            className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 border border-border hover:border-[#DFB755]/40 cursor-pointer"
            title="Descargar para Apple Calendar / Outlook (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-[#DFB755]" />
            <span className="hidden sm:inline">iCal</span>
          </button>

          <a
            href={createWhatsAppShareUrl(appointment)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 text-xs font-bold transition-colors flex items-center border border-emerald-500/30"
            title="Compartir por WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* DETALLES DE VUELO/TURNO (ESTILO TICKET) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Fecha de Cita</span>
          <p className="text-sm font-black text-foreground mt-0.5">{appointment.fecha}</p>
          <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">
            {isToday ? "¡Es el día de hoy!" : "Turno agendado"}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Hora Exacta</span>
          <p className="text-base font-black text-[#DFB755] font-mono mt-0.5">{appointment.hora.substring(0, 5)}</p>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Puntualidad sugerida</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Barbero Asignado</span>
          <p className="text-sm font-black text-foreground mt-0.5 truncate flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#DFB755]" />
            {appointment.barberoNombre}
          </p>
          <span className="text-[10px] text-[#FFE082] font-semibold block mt-0.5">Estación VIP</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Total a Pagar</span>
          <p className="text-base font-black text-[#DDAE41] dark:text-[#E8C466] mt-0.5">
            ${Number(appointment.precio || 0).toLocaleString("es-CO")}
          </p>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Pago en recepción</span>
        </div>
      </div>

      {/* LÍNEA DE TROQUELADO / TEAR LINE */}
      <div className="relative my-2">
        <div className="border-t-2 border-dashed border-[#DFB755]/30 -mx-6 sm:-mx-7" />
      </div>

      {/* BOTONES DE ACCIÓN RÁPIDA: "VOY EN CAMINO" & "CÓMO LLEGAR" */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-[#DFB755]/5 border border-[#DFB755]/20 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-[#DFB755]" />
          <span className="font-bold text-foreground">Tu Turno Barber Club</span>
          <span className="text-muted-foreground hidden sm:inline">· Calle 10 # 43-20</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenMaps}
            className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-[#DFB755]/50"
          >
            <Navigation className="w-3.5 h-3.5 text-[#DFB755]" />
            <span>Cómo llegar</span>
          </button>

          <button
            type="button"
            onClick={handleNotifyOnMyWay}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Voy en camino</span>
          </button>
        </div>
      </div>

      {/* Stepper visual animado del servicio */}
      <div className="relative z-10 pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-3">
          Estado del Protocolo en Barbería
        </span>
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  step.done
                    ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-black shadow-[#DFB755]/30 ring-2 ring-[#DFB755]/50 font-black"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {step.done ? "✓" : idx + 1}
              </div>
              <span className="text-[11px] font-bold text-foreground line-clamp-1">{step.title}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones de reagendar / cancelar */}
      <div className="relative z-10 flex items-center justify-end gap-2 pt-2 border-t border-border">
        {onReschedule && (
          <button
            type="button"
            onClick={onReschedule}
            className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            Reagendar Cita
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar Cita
          </button>
        )}
      </div>
    </div>
  );
}

