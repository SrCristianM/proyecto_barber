import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  CalendarCheck2,
  AlertCircle,
  Eye,
  FileText,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import SalonAmbienceWidget from "../../client/components/SalonAmbienceWidget";
import { toast } from "sonner";
import {
  getCurrentBarberProfile,
  getBarberAppointments,
  getBarberAgendaForDate,
  getBarberNovelties,
  completeBarberAppointment
} from "../services/barberStorageService";

// Helper para calcular hora de finalización
const calculateEndTime = (startTimeStr, durationMinutes = 30) => {
  if (!startTimeStr) return "";
  const parts = startTimeStr.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return startTimeStr;
  const d = new Date();
  d.setHours(hours, minutes + durationMinutes, 0, 0);
  const endHours = String(d.getHours()).padStart(2, "0");
  const endMinutes = String(d.getMinutes()).padStart(2, "0");
  return `${endHours}:${endMinutes}`;
};

const getLoyaltyBadge = (tier) => {
  switch (tier) {
    case "Oro":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "Plata":
      return "bg-slate-300/15 text-slate-300 border-slate-400/30";
    case "Bronce":
      return "bg-amber-700/15 text-amber-600 border-amber-700/30";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
};

export default function BarberDashboard() {
  const [barber, setBarber] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [todayAgenda, setTodayAgenda] = useState({ slots: [], totalCitas: 0 });
  const [pendingNovelties, setPendingNovelties] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    const profile = getCurrentBarberProfile();
    setBarber(profile);

    const appointments = getBarberAppointments();
    const todayApts = appointments.filter((a) => a.fecha === todayStr);
    setTodayAppointments(todayApts);

    // Encontrar próxima cita (aquella programada para hoy en orden horario)
    const upcomingToday = todayApts
      .filter((a) => a.estado === "Programada" || a.estado === "Reprogramada")
      .sort((a, b) => a.hora.localeCompare(b.hora));

    setNextAppointment(upcomingToday[0] || null);

    // Obtener agenda hora por hora de hoy
    const agendaData = getBarberAgendaForDate(todayStr);
    setTodayAgenda(agendaData);

    // Obtener novedades pendientes
    const novelties = getBarberNovelties().filter((n) => n.estado === "Pendiente");
    setPendingNovelties(novelties);

    setLoading(false);
  };

  const handleCompleteAppointment = (id_cita) => {
    const res = completeBarberAppointment(id_cita);
    if (res.success) {
      toast.success(`¡Cita #${id_cita} marcada como Completada con éxito!`);
      loadDashboardData();
      if (selectedAppointment && selectedAppointment.id_cita === id_cita) {
        setSelectedAppointment(null);
      }
    } else {
      toast.error(res.error || "No se pudo actualizar la cita.");
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-[#DFB755]/15 text-[#DFB755] border-[#DFB755]/30";
      case "Completada":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Cancelada":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNER DE BIENVENIDA PROFESIONAL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-card/50 border border-[#C9A24A]/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#DFB755]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jornada Laboral Activa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              ¡Hola, {barber?.nombre || "Barbero"}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Bienvenido a tu panel de control profesional en <strong className="text-foreground">Tu Turno Barber</strong>. 
              Consulta tu agenda, próximas atenciones del día y gestiona tus horarios con total precisión.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/barbero/agenda"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Agenda Completa</span>
            </Link>
            <Link
              to="/barbero/novedades"
              className="px-4 py-2.5 rounded-xl border border-border hover:border-[#DFB755]/50 bg-accent/40 hover:bg-accent text-foreground font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#DFB755]" />
              <span>Solicitar Novedad</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE RESUMEN CLAVE DEL BARBERO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Citas de Hoy */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-[#DFB755]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Citas de Hoy</span>
            <div className="p-2 rounded-xl bg-[#DFB755]/15 text-[#DFB755]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {todayAppointments.filter((a) => a.estado === "Programada" || a.estado === "Reprogramada").length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">programada(s)</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Total agendadas para hoy: {todayAppointments.length}
          </p>
        </div>

        {/* Citas Completadas */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completadas Hoy</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500">
              {todayAppointments.filter((a) => a.estado === "Completada").length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">atendida(s)</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Clientes atendidos hoy
          </p>
        </div>

        {/* Novedades Pendientes */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Novedades</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">
              {pendingNovelties.length}
            </span>
            <span className="text-xs text-muted-foreground font-medium">en revisión</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Solicitudes pendientes por admin
          </p>
        </div>

        {/* Turno Actual */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horario Actual</span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-black text-foreground">
              08:00 AM - 06:00 PM
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Jornada diurna asignada
          </p>
        </div>
      </div>

      {/* 3. SECCIÓN PRINCIPAL: PRÓXIMA CITA & AGENDA DEL DÍA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (1/3): PRÓXIMA CITA DESTACADA */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#DFB755]" />
              <span>Próxima Cita</span>
            </h2>
            {nextAppointment && (
              <span className="text-xs font-bold text-[#DFB755] bg-[#DFB755]/10 px-2 py-0.5 rounded-md border border-[#DFB755]/20">
                Inmediata
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-card via-card to-card/70 border border-[#DFB755]/40 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-[#DFB755]/15 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#DFB755]">
                    Cita #{nextAppointment.id_cita}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(nextAppointment.estado)}`}>
                    {nextAppointment.estado}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DFB755]/15 text-[#DFB755] flex items-center justify-center shrink-0 border border-[#DFB755]/30 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Cliente</p>
                        {nextAppointment.cliente_fidelidad && (
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${getLoyaltyBadge(nextAppointment.cliente_fidelidad)}`}>
                            {nextAppointment.cliente_fidelidad}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-foreground truncate">{nextAppointment.cliente_nombre}</p>
                      {nextAppointment.cliente_telefono && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#DFB755]" />
                          {nextAppointment.cliente_telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent text-foreground flex items-center justify-center shrink-0 border border-border">
                      <Scissors className="w-5 h-5 text-[#DFB755]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Servicio</p>
                      <p className="text-sm font-bold text-foreground">
                        {nextAppointment.paquete_nombre || nextAppointment.servicio_nombre}
                      </p>
                      {nextAppointment.paquete_nombre && (
                        <span className="text-[10px] text-amber-500 font-bold">Paquete Promocional</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                    <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                        <span>Hora</span>
                        <span className="text-[#DFB755] font-black">{nextAppointment.servicio_duracion || 30}m</span>
                      </span>
                      <p className="text-base font-black text-[#DFB755]">{nextAppointment.hora}</p>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        Fin ~{calculateEndTime(nextAppointment.hora, nextAppointment.servicio_duracion || 30)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Fecha</span>
                      <p className="text-xs font-bold text-foreground mt-0.5">Hoy ({nextAppointment.fecha})</p>
                      <span className="text-[10px] text-emerald-500 font-semibold block mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Turno asignado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(nextAppointment)}
                      className="py-2.5 px-3 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(nextAppointment.id_cita)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Marcar cita como completada en sillón"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completar</span>
                    </button>
                  </div>
                  <Link
                    to="/barbero/citas"
                    className="text-center text-xs font-bold text-[#DFB755] hover:underline py-1"
                  >
                    Ver todas mis citas
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/40 text-muted-foreground mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#DFB755]" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Sin citas inmediatas pendientes</h3>
              <p className="text-xs text-muted-foreground">
                No tienes citas programadas pendientes por atender en este momento.
              </p>
              <Link
                to="/barbero/agenda"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DFB755] hover:underline pt-1 cursor-pointer"
              >
                <span>Consultar Agenda</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* WIDGET DE AMBIENTACIÓN MUSICAL EN VIVO */}
          <SalonAmbienceWidget />
        </div>

        {/* COLUMNA DERECHA (2/3): AGENDA VISUAL DEL DÍA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#DFB755]" />
                <span>Agenda del Día</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Bloques de atención para la jornada de hoy ({todayStr})
              </p>
            </div>
            <Link
              to="/barbero/agenda"
              className="text-xs font-bold text-[#DFB755] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver por días</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs">
            <div className="divide-y divide-border/60">
              {todayAgenda.slots.map((slot) => {
                const isOccupied = slot.estadoSlot === "Ocupado" && slot.cita;
                const apt = slot.cita;

                return (
                  <div
                    key={slot.hora}
                    className={`p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                      isOccupied
                        ? "bg-[#DFB755]/5 hover:bg-[#DFB755]/10"
                        : "hover:bg-accent/40"
                    }`}
                  >
                    {/* Hora */}
                    <div className="flex items-center gap-3 w-28 sm:w-32 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#DFB755]" />
                      <span className="text-xs sm:text-sm font-black text-foreground font-mono">
                        {slot.hora}
                      </span>
                    </div>

                    {/* Estado / Cliente */}
                    <div className="flex-1 min-w-0 px-2 sm:px-4">
                      {isOccupied ? (
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-extrabold text-foreground truncate flex items-center gap-1.5">
                            <span className="text-primary font-bold">•</span>
                            {apt.cliente_nombre}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {apt.paquete_nombre || apt.servicio_nombre}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground/70 italic">
                            — Libre / Disponible
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones / Badges */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isOccupied ? (
                        <>
                          <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(apt.estado)}`}>
                            {apt.estado}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Ver detalle de cita"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Detalle</span>
                          </button>
                        </>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/60 text-muted-foreground border border-border/50">
                          Espacio libre
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL DETALLE DE CITA REUTILIZABLE */}
      {selectedAppointment && (
        <Modal
          title={`Detalle de Cita #${selectedAppointment.id_cita}`}
          onClose={() => setSelectedAppointment(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-5">
            {/* Header del modal */}
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado Actual</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{selectedAppointment.estado}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(selectedAppointment.estado)}`}>
                {selectedAppointment.estado}
              </span>
            </div>

            {/* Datos del Cliente */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span>Información del Cliente</span>
                </h4>
                {selectedAppointment.cliente_fidelidad && (
                  <span className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${getLoyaltyBadge(selectedAppointment.cliente_fidelidad)}`}>
                    Cliente {selectedAppointment.cliente_fidelidad}
                  </span>
                )}
              </div>
              <p className="text-base font-black text-foreground">{selectedAppointment.cliente_nombre}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                {selectedAppointment.cliente_telefono && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span>{selectedAppointment.cliente_telefono}</span>
                  </p>
                )}
                {selectedAppointment.cliente_correo && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span className="truncate">{selectedAppointment.cliente_correo}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Datos del Servicio / Paquete */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                <span>Servicio a Realizar</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-foreground">
                    {selectedAppointment.paquete_nombre || selectedAppointment.servicio_nombre}
                  </p>
                  {selectedAppointment.paquete_nombre && (
                    <span className="text-[11px] font-bold text-[#DFB755]">Paquete Promocional</span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-[#DFB755]">
                  ${Number(selectedAppointment.precio || selectedAppointment.servicio_precio || 0).toLocaleString("es-CO")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground font-bold">Fecha:</span>
                  <p className="font-extrabold text-foreground">{selectedAppointment.fecha}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">Hora:</span>
                  <p className="font-extrabold text-foreground">
                    {selectedAppointment.hora} (Fin ~{calculateEndTime(selectedAppointment.hora, selectedAppointment.servicio_duracion || 30)})
                  </p>
                </div>
              </div>

              {selectedAppointment.notas && (
                <div className="p-3 rounded-xl bg-accent/40 border border-border/60 text-xs">
                  <span className="font-bold text-muted-foreground block mb-0.5">Notas del Cliente:</span>
                  <p className="text-foreground italic">{selectedAppointment.notas}</p>
                </div>
              )}
            </div>

            {/* Acciones del Modal */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {selectedAppointment.estado === "Programada" ? (
                <button
                  type="button"
                  onClick={() => handleCompleteAppointment(selectedAppointment.id_cita)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar como Atendida</span>
                </button>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Estado: {selectedAppointment.estado}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
