import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Phone,
  Mail,
  Sparkles,
  FileText
} from "lucide-react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
import Modal from "../../admin/shared/components/Modal";
import BarberPoleIndicator from "../components/BarberPoleIndicator";
import {
  getCurrentBarberProfile,
  getBarberAgendaForDate,
  getBarberAppointments,
  completeBarberAppointment
} from "../services/barberStorageService";

const getLoyaltyBadge = (tier) => {
  switch (tier) {
    case "Oro":
      return "bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 text-amber-400 border-amber-500/40 animate-metallic-shimmer shadow-xs";
    case "Plata":
      return "bg-gradient-to-r from-slate-400/20 via-slate-200/30 to-slate-400/20 text-slate-300 border-slate-400/40 animate-metallic-shimmer shadow-xs";
    case "Bronce":
      return "bg-gradient-to-r from-amber-700/20 via-amber-600/30 to-amber-700/20 text-amber-600 border-amber-700/40 animate-metallic-shimmer shadow-xs";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
};

export default function BarberAgendaPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [agenda, setAgenda] = useState({ slots: [], totalCitas: 0, citasProgramadas: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const navigate = useNavigate();

  // Actualizar hora en vivo cada minuto para la línea de escaneo temporal
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadAgenda(selectedDate);
  }, [selectedDate]);

  const loadAgenda = (dateStr) => {
    setLoading(true);
    const data = getBarberAgendaForDate(dateStr);
    setAgenda(data);
    setLoading(false);
  };

  const handleCompleteAppointment = (id_cita) => {
    const res = completeBarberAppointment(id_cita);
    if (res.success) {
      // Celebración con confeti dorado y esmeralda
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.62 },
        colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF", "#10B981"]
      });
      toast.success(`¡Cita #${id_cita} completada y registrada!`, {
        description: "El cliente ha sido atendido correctamente."
      });
      loadAgenda(selectedDate);
      setSelectedAppointment(null);
    } else {
      toast.error(res.error || "No se pudo actualizar la cita.");
    }
  };

  const handleRequestCancellation = (apt) => {
    navigate("/barbero/novedades", {
      state: {
        fromAppointment: {
          id_cita: apt.id_cita,
          fecha: apt.fecha,
          label: `Cita #${apt.id_cita} - ${apt.cliente_nombre} (${apt.fecha} ${apt.hora})`
        }
      }
    });
  };

  // Generar 7 días circundantes para el selector visual de días
  const getDaysRow = () => {
    const base = new Date(selectedDate + "T12:00:00");
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase().replace(".", "");
      const dayNumber = d.getDate();
      days.push({ iso, dayName, dayNumber });
    }
    return days;
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filtrar slots según filtro de estado
  const filteredSlots = agenda.slots.filter((slot) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "libres") return slot.estadoSlot === "Libre";
    if (statusFilter === "ocupados") return slot.estadoSlot === "Ocupado";
    if (slot.cita && slot.cita.estado.toLowerCase() === statusFilter.toLowerCase()) return true;
    return false;
  });

  const statusOptions = [
    { value: "all", label: "Todos los horarios" },
    { value: "ocupados", label: "Solo citas programadas" },
    { value: "libres", label: "Solo espacios libres" },
    { value: "Programada", label: "Estado: Programada" },
    { value: "Completada", label: "Estado: Completada" }
  ];

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

  const formattedDateHeader = new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mi Agenda de Citas
            </h1>
            <BarberPoleIndicator variant="gold" label="En Turno" showPulse={true} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Consulta
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#DFB755]" />
            <span>{formattedDateHeader}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-2 rounded-xl border border-border hover:border-[#DFB755]/50 bg-card hover:bg-accent text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs"
          >
            Hoy
          </button>
          <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1.5 text-xs font-bold bg-transparent text-foreground border-x border-border focus:outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={handleNextDay}
              className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE DÍAS CON PÍLDORA ELÁSTICA (LAYOUTID) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2 rounded-2xl bg-card border border-border/80 shadow-xs relative">
        {getDaysRow().map((item) => {
          const isSelected = item.iso === selectedDate;
          const isToday = item.iso === new Date().toISOString().split("T")[0];

          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => setSelectedDate(item.iso)}
              className="relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl cursor-pointer select-none transition-colors z-10 group"
            >
              {isSelected && (
                <motion.div
                  layoutId="activeBarberAgendaDay"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-gradient-to-b from-[#E8C466] to-[#DDAE41] rounded-xl shadow-md shadow-[#DDAE41]/30 -z-10"
                />
              )}
              {isToday && !isSelected && (
                <div className="absolute inset-0 border border-[#DFB755]/40 bg-[#DFB755]/10 rounded-xl -z-10" />
              )}
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? "text-black" : "text-muted-foreground group-hover:text-foreground"
                  }`}
              >
                {item.dayName}
              </span>
              <span
                className={`text-base sm:text-lg font-black mt-0.5 transition-colors ${isSelected ? "text-black font-black" : "text-foreground"
                  }`}
              >
                {item.dayNumber}
              </span>
              {isToday && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFB755] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* BARRA DE OCUPACIÓN DE LA JORNADA */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
            <span className="font-extrabold text-foreground">Ocupación de la Jornada (8:00 AM - 6:00 PM)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-[11px]">
              <strong className="text-foreground font-black">{agenda.occupiedHours ?? 0}h</strong> ocupadas · <strong className="text-[#DFB755] font-black">{agenda.freeHours ?? 10}h</strong> libres
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              {agenda.occupancyPercentage ?? 0}%
            </span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#DFB755] via-amber-400 to-[#DDAE41] transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(agenda.occupancyPercentage ?? 0, 100)}%` }}
          />
        </div>
      </div>

      {/* FILTROS Y ESTADÍSTICAS DEL DÍA SELECCIONADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DFB755]" />
            <span className="text-muted-foreground">Total Citas:</span>
            <span className="text-foreground font-black">{agenda.totalCitas}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Programadas:</span>
            <span className="text-foreground font-black">{agenda.citasProgramadas}</span>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <SearchableSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "all")}
            options={statusOptions}
            placeholder="Filtrar agenda..."
            searchable={false}
            size="sm"
          />
        </div>
      </div>

      {/* LISTADO CRONOLÓGICO DE HORARIOS / CITAS */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Franja Horaria
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Detalle de Atención
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:block">
            Acción
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {filteredSlots.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/40 text-muted-foreground mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">No hay registros con el filtro seleccionado</p>
              <p className="text-xs text-muted-foreground">
                Prueba restableciendo los filtros o seleccionando otra fecha en el calendario.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSlots.map((slot) => {
                const isOccupied = slot.estadoSlot === "Ocupado" && slot.cita;
                const apt = slot.cita;

                // Detectar si este slot corresponde a la hora actual en la jornada de hoy
                const isToday = selectedDate === new Date().toISOString().split("T")[0];
                const [currentHour] = currentTimeStr.split(":").map(Number);
                const [slotHour] = slot.hora.split(":").map(Number);
                const isCurrentSlot = isToday && slotHour === currentHour;

                return (
                  <div key={slot.hora}>
                    {/* Línea de escáner en tiempo real (Live Timeline Indicator) */}
                    {isCurrentSlot && (
                      <div className="relative z-10 px-4 py-1.5 bg-gradient-to-r from-[#DFB755]/25 via-amber-400/15 to-transparent border-y border-[#DFB755]/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-black text-[#DFB755] uppercase tracking-wider">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFB755] opacity-80" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DFB755]" />
                          </span>
                          <span>Hora Actual en Barbería · {currentTimeStr}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">
                          Franja en Curso
                        </span>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      whileHover={{ x: 3 }}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${isCurrentSlot
                          ? "bg-[#DFB755]/10 border-l-4 border-l-[#DFB755] shadow-xs"
                          : isOccupied
                            ? "bg-[#DFB755]/5 hover:bg-[#DFB755]/10 border-l-4 border-l-[#DFB755]/60"
                            : "hover:bg-accent/40 border-l-4 border-l-transparent"
                        }`}
                    >
                      {/* Hora */}
                      <div className="flex items-center gap-3 w-32 shrink-0">
                        <div className={`p-2 rounded-xl transition-colors ${isCurrentSlot
                            ? "bg-[#DFB755] text-black shadow-md shadow-[#DFB755]/30 font-black"
                            : isOccupied
                              ? "bg-[#DFB755]/15 text-[#DFB755]"
                              : "bg-muted text-muted-foreground"
                          }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-foreground font-mono">
                            {slot.hora}
                          </span>
                          <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                            {isCurrentSlot ? "Ahora" : isOccupied ? "Ocupado" : "Disponible"}
                          </span>
                        </div>
                      </div>

                      {/* Contenido / Cliente */}
                      <div className="flex-1 min-w-0">
                        {isOccupied ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#DFB755]" />
                                {apt.cliente_nombre}
                              </span>
                              {apt.cliente_fidelidad && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${getLoyaltyBadge(apt.cliente_fidelidad)}`}>
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {apt.cliente_fidelidad}
                                </span>
                              )}
                              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getStatusBadge(apt.estado)}`}>
                                {apt.estado}
                              </span>
                              {apt.paquete_nombre && (
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/30">
                                  Paquete
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Scissors className="w-3 h-3 text-[#DFB755]" />
                              <span>{apt.paquete_nombre || apt.servicio_nombre}</span>
                              <span className="text-muted-foreground/60">•</span>
                              <span>{apt.servicio_duracion || 30} min</span>
                              {apt.cliente_telefono && (
                                <>
                                  <span className="text-muted-foreground/60">•</span>
                                  <span className="hidden md:inline">{apt.cliente_telefono}</span>
                                </>
                              )}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                            <span className="text-xs font-semibold italic">
                              Espacio libre — No hay cita programada para esta hora
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción */}
                      <div className="shrink-0 flex items-center justify-end gap-2">
                        {isOccupied ? (
                          <>
                            {apt.estado === "Programada" && (
                              <button
                                type="button"
                                onClick={() => handleCompleteAppointment(apt.id_cita)}
                                className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                                title="Marcar como atendida"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Atendida</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedAppointment(apt)}
                              className="px-3.5 py-2 rounded-xl bg-accent hover:bg-[#DFB755]/20 hover:text-[#DFB755] border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Detalle</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-muted-foreground/60 bg-muted/40 px-3 py-1.5 rounded-lg">
                            Libre para asignación
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE CITA */}
      {selectedAppointment && (
        <Modal
          title={`Detalle de Cita #${selectedAppointment.id_cita}`}
          onClose={() => setSelectedAppointment(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado de la Cita</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{selectedAppointment.estado}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(selectedAppointment.estado)}`}>
                {selectedAppointment.estado}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span>Cliente Asignado</span>
                </h4>
                {selectedAppointment.cliente_fidelidad && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${getLoyaltyBadge(selectedAppointment.cliente_fidelidad)}`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    Nivel {selectedAppointment.cliente_fidelidad}
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

            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                <span>Servicio Solicitado</span>
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
                  <p className="font-extrabold text-foreground">{selectedAppointment.hora}</p>
                </div>
              </div>

              {selectedAppointment.notas && (
                <div className="p-3 rounded-xl bg-accent/40 border border-border/60 text-xs">
                  <span className="font-bold text-muted-foreground block mb-0.5">Indicaciones del Cliente:</span>
                  <p className="text-foreground italic">{selectedAppointment.notas}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedAppointment.estado === "Programada" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(selectedAppointment.id_cita)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar como Atendida</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestCancellation(selectedAppointment)}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Solicitar Cancelación</span>
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer ml-auto"
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
