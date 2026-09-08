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
  Sparkles
} from "lucide-react";
import { createGoogleCalendarUrl, downloadIcsFile, createWhatsAppShareUrl } from "../utils/calendarUtils";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

export default function UpcomingAppointmentTimeline({
  appointment,
  onReschedule,
  onCancel
}) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!appointment) return;

    const calcTime = () => {
      const aptDate = new Date(`${appointment.fecha}T${appointment.hora.substring(0, 5)}:00`);
      const now = new Date();
      const diffMs = aptDate - now;

      if (diffMs <= 0) {
        setCountdown("¡Es momento de tu cita!");
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffDays > 0) {
        setCountdown(`Faltan ${diffDays}d ${diffHours}h para tu cita`);
      } else if (diffHours > 0) {
        setCountdown(`Faltan ${diffHours}h ${diffMinutes}m para tu cita`);
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

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-background border border-[#DFB755]/30 p-6 sm:p-7 shadow-xl space-y-6">
      {/* Decoración dorada */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-[#DFB755]/10 rounded-bl-full pointer-events-none blur-2xl" />

      {/* Header con Contador */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Próxima Cita Activa
            </span>
            <span className="text-xs font-bold text-[#DDAE41] dark:text-[#E8C466] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {countdown}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            {appointment.servicioNombre || "Servicio de Barbería"}
          </h3>
        </div>

        {/* Botones de Calendario */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={createGoogleCalendarUrl(appointment)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 border border-border"
            title="Agregar a Google Calendar"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#DFB755]" />
            <span className="hidden sm:inline">Google Cal</span>
          </a>

          <button
            type="button"
            onClick={() => downloadIcsFile(appointment)}
            className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 border border-border cursor-pointer"
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

      {/* Detalles de la cita */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Fecha</span>
          <p className="font-extrabold text-foreground mt-0.5">{appointment.fecha}</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Hora</span>
          <p className="font-extrabold text-foreground mt-0.5">{appointment.hora.substring(0, 5)}</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Barbero</span>
          <p className="font-extrabold text-foreground mt-0.5 truncate">{appointment.barberoNombre}</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/30 border border-border">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Precio</span>
          <p className="font-black text-[#DDAE41] dark:text-[#E8C466] mt-0.5">
            ${Number(appointment.precio || 0).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Stepper visual animado */}
      <div className="relative z-10 pt-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-3">
          Progreso del Servicio
        </span>
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  step.done
                    ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-black shadow-[#DFB755]/30 ring-2 ring-[#DFB755]/50"
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
