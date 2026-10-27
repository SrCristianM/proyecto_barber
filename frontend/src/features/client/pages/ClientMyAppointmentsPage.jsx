import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
import {
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Plus,
  Info,
  CalendarCheck,
  CalendarX,
  History,
  ChevronRight,
  Share2,
  Download
} from "lucide-react";
import {
  getClientAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} from "../services/clientStorageService";
import {
  createGoogleCalendarUrl,
  downloadIcsFile,
  createWhatsAppShareUrl
} from "../utils/calendarUtils";
import Modal from "../../admin/shared/components/Modal";
import { useDataSync, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";
import { getLocalDateString, addDays, parseLocalDate, formatDateDisplay } from "../../../shared/utils/dateUtils";
import { motion, AnimatePresence } from "motion/react";
import ClientBookingDatePicker from "../components/ClientBookingDatePicker";
import { Sparkles, QrCode, ArrowUpRight } from "lucide-react";

export default function ClientMyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'history'
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [selectedApt, setSelectedApt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Estados de reagendar y cancelar
  const [cancelReason, setCancelReason] = useState("Cambio de planes personales");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);

  const loadAppointments = () => {
    const list = getClientAppointments();
    setAppointments(list);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useDataSync([SYNC_ENTITIES.APPOINTMENTS], loadAppointments);

  const todayStr = getLocalDateString();

  // Separar en próximas e historial
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => (a.estado === "Programada" || a.estado === "Reprogramada") && a.fecha >= todayStr)
      .sort((a, b) => new Date(`${a.fecha} ${a.hora}`) - new Date(`${b.fecha} ${b.hora}`));
  }, [appointments, todayStr]);

  const historyAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.estado === "Completada" || a.estado === "Cancelada" || a.fecha < todayStr)
      .sort((a, b) => new Date(`${b.fecha} ${b.hora}`) - new Date(`${a.fecha} ${a.hora}`));
  }, [appointments, todayStr]);

  const filteredHistory = useMemo(() => {
    return historyAppointments.filter((a) => {
      const search = searchTerm.toLowerCase();
      return (
        search === "" ||
        a.tituloItem.toLowerCase().includes(search) ||
        a.barberoNombre.toLowerCase().includes(search) ||
        a.estado.toLowerCase().includes(search) ||
        a.fecha.includes(search)
      );
    });
  }, [historyAppointments, searchTerm]);

  // Cita próxima más cercana y cuenta regresiva
  const nearestApt = upcomingAppointments[0] || null;
  const countdownInfo = useMemo(() => {
    if (!nearestApt) return null;
    try {
      const aptDate = parseLocalDate(nearestApt.fecha);
      const [h, m] = (nearestApt.hora || "09:00").split(":").map(Number);
      aptDate.setHours(h || 9, m || 0, 0, 0);

      const now = new Date();
      const diffMs = aptDate - now;

      if (diffMs <= 0) {
        return { isNow: true, text: "¡Tu cita es hoy en este momento!", diffDays: 0, diffHours: 0 };
      }

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let text = "";
      if (diffDays > 0) {
        text = `Faltan ${diffDays} día(s) y ${diffHours % 24} hora(s)`;
      } else if (diffHours > 0) {
        text = `Faltan ${diffHours} hora(s) y ${diffMinutes} min`;
      } else {
        text = `¡Faltan solo ${diffMinutes} minutos!`;
      }

      return { isNow: false, text, diffDays, diffHours, diffMinutes };
    } catch {
      return null;
    }
  }, [nearestApt]);

  const handleOpenReschedule = (apt) => {
    setSelectedApt(apt);
    const tomorrowStr = addDays(getLocalDateString(), 1);
    setRescheduleDate(tomorrowStr);
    setShowRescheduleModal(true);
  };

  useEffect(() => {
    if (showRescheduleModal && selectedApt && rescheduleDate) {
      const slots = getAvailableSlots(selectedApt.id_barbero, rescheduleDate);
      setAvailableRescheduleSlots(slots);
      const firstFree = slots.find((s) => s.disponible);
      setRescheduleSlot(firstFree ? firstFree.hora : "");
    }
  }, [showRescheduleModal, selectedApt, rescheduleDate]);

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot) {
      toast.error("Por favor selecciona una fecha y un horario disponible.");
      return;
    }

    const res = rescheduleAppointment(selectedApt.id_cita, {
      nuevaFecha: rescheduleDate,
      nuevaHora: rescheduleSlot
    });

    if (res.success) {
      toast.success("¡Tu cita ha sido reagendada con éxito!");
      setShowRescheduleModal(false);
      loadAppointments();
    } else {
      toast.error(res.error);
    }
  };

  // Manejo de Cancelar
  const handleOpenCancel = (apt) => {
    setSelectedApt(apt);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedApt) return;
    const res = cancelAppointment(selectedApt.id_cita, cancelReason);
    if (res.success) {
      toast.success("La cita ha sido cancelada.");
      setShowCancelModal(false);
      loadAppointments();
    } else {
      toast.error(res.error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Programada":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Reprogramada":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      case "Completada":
        return "bg-[#DFB755]/15 text-[#DDAE41] dark:text-[#E8C466] border-[#DFB755]/30";
      case "Cancelada":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">Agenda Personal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mis Citas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta tus citas activas, revisa tu historial o realiza reprogramaciones de turno.
          </p>
        </div>

        <Link
          to="/portal/agendar"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>AGENDAR NUEVA CITA</span>
        </Link>
      </div>

      {/* =========================================================================
          BANNER COUNTDOWN EN VIVO DE PRÓXIMA CITA
          ========================================================================= */}
      {nearestApt && countdownInfo && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-[#DFB755]/15 via-card to-[#E8C466]/10 border border-[#DFB755]/40 shadow-lg shadow-[#DFB755]/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DFB755] text-zinc-950 flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFB755] text-zinc-950">
                  Próxima Cita en Vivo
                </span>
                <span className="text-xs font-bold text-[#DFB755] dark:text-[#E8C466]">
                  {countdownInfo.text}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                {nearestApt.tituloItem} con {nearestApt.barberoNombre}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>📅 {nearestApt.fecha}</span>
                <span>•</span>
                <span>⏰ {nearestApt.hora.substring(0, 5)}</span>
                <span>•</span>
                <span className="font-bold text-foreground">${Number(nearestApt.precio).toLocaleString("es-CO")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedApt(nearestApt);
                setShowDetailModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-card border border-[#DFB755]/50 hover:bg-[#DFB755]/10 text-foreground font-black text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#DFB755]" />
              <span>Ver Pase VIP</span>
            </button>
            <a
              href={createGoogleCalendarUrl({
                title: `Cita en Tu Turno Barber - ${nearestApt.tituloItem}`,
                date: nearestApt.fecha,
                time: nearestApt.hora,
                barberName: nearestApt.barberoNombre,
                price: nearestApt.precio
              })}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-[#DFB755] hover:bg-[#E8C466] text-zinc-950 font-bold transition-all shadow-xs cursor-pointer"
              title="Añadir a Google Calendar"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

      {/* PESTAÑAS (PRÓXIMAS CITAS / HISTORIAL) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Próximas Citas ({upcomingAppointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Citas ({historyAppointments.length})</span>
        </button>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      {activeTab === "upcoming" ? (
        <div>
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id_cita}
                  className="rounded-3xl bg-card border border-border hover:border-[#DFB755]/50 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        CITA #{apt.id_cita}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(apt.estado)}`}>
                        {apt.estado}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground">{apt.tituloItem}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                        Barbero: <strong>{apt.barberoNombre}</strong> ({apt.barberoEspecialidad})
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Fecha</span>
                          <span className="text-xs font-bold text-foreground">{apt.fecha}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Hora</span>
                          <span className="text-xs font-bold text-foreground">{apt.hora.substring(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Monto</span>
                      <span className="text-lg font-black text-[#DDAE41] dark:text-[#E8C466]">
                        ${Number(apt.precio).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <a
                        href={createGoogleCalendarUrl({
                          titulo: apt.tituloItem,
                          fecha: apt.fecha,
                          hora: apt.hora
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border transition-colors"
                        title="Añadir a Google Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#DFB755]" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          downloadIcsFile({
                            titulo: apt.tituloItem,
                            fecha: apt.fecha,
                            hora: apt.hora
                          })
                        }
                        className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border transition-colors cursor-pointer"
                        title="Descargar archivo .ics para Apple Calendar"
                      >
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      <a
                        href={createWhatsAppShareUrl({
                          tituloItem: apt.tituloItem,
                          fecha: apt.fecha,
                          hora: apt.hora,
                          barberoNombre: apt.barberoNombre
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                        title="Compartir por WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApt(apt);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        Detalle
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(apt)}
                        className="px-3 py-2 rounded-xl bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer"
                        title="Reagendar turno"
                      >
                        Reagendar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCancel(apt)}
                        className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 text-xs font-bold transition-colors cursor-pointer"
                        title="Cancelar cita"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-3xl border border-border p-8 space-y-3">
              <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-base font-bold text-foreground">No tienes citas próximas activas</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                ¿Deseas lucir un corte o barba impecable? Selecciona a tu barbero y agenda tu turno ahora.
              </p>
              <div className="pt-2">
                <Link
                  to="/portal/agendar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md"
                >
                  <span>AGENDAR MI PRÓXIMA CITA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Buscador de historial */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en historial por servicio, barbero, fecha o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-[#DFB755]"
            />
          </div>

          {filteredHistory.length > 0 ? (
            <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase font-bold border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Fecha y Hora</th>
                      <th className="py-3.5 px-4">Servicio / Paquete</th>
                      <th className="py-3.5 px-4">Barbero</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4 text-center">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredHistory.map((apt) => (
                      <tr key={apt.id_cita} className="hover:bg-accent/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground">
                          #{apt.id_cita}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-foreground block">{apt.fecha}</span>
                          <span className="text-muted-foreground text-[11px]">{apt.hora.substring(0, 5)}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {apt.tituloItem}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {apt.barberoNombre}
                        </td>
                        <td className="py-3.5 px-4 font-black text-[#DDAE41] dark:text-[#E8C466]">
                          ${Number(apt.precio).toLocaleString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(apt.estado)}`}>
                            {apt.estado}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApt(apt);
                              setShowDetailModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-foreground text-xs font-semibold cursor-pointer"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-3xl border border-border p-8">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-foreground">Sin registros en el historial</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tus citas completadas o canceladas se archivarán aquí automáticamente.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE CITA: PASE DIGITAL VIP BOARDING PASS */}
      {showDetailModal && selectedApt && (
        <Modal
          title={`Pase Digital de Reserva • #${String(selectedApt.id_cita).padStart(4, "0")}`}
          onClose={() => setShowDetailModal(false)}
          maxWidthClass="max-w-md"
        >
          <div className="space-y-5">
            {/* TICKET DIGITAL CON TROQUELADO LATERAL */}
            <div className="relative rounded-3xl bg-gradient-to-b from-card via-card to-card/90 border border-[#DFB755]/50 shadow-2xl p-6 text-foreground overflow-hidden">
              {/* Header dorado del Ticket */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DFB755] text-zinc-950 flex items-center justify-center font-black">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#DFB755] uppercase block">
                      TU TURNO BARBER
                    </span>
                    <span className="text-xs font-black text-foreground">
                      PASE DE ATENCIÓN
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(selectedApt.estado)}`}>
                  {selectedApt.estado}
                </span>
              </div>

              {/* Contenido del pase */}
              <div className="py-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Servicio / Tratamiento
                  </span>
                  <p className="text-base font-black text-foreground mt-0.5">
                    {selectedApt.tituloItem}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Barbero
                    </span>
                    <p className="font-extrabold text-foreground truncate mt-0.5">
                      {selectedApt.barberoNombre}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Especialidad
                    </span>
                    <p className="font-semibold text-muted-foreground truncate mt-0.5">
                      {selectedApt.barberoEspecialidad || "General"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Fecha
                    </span>
                    <p className="font-extrabold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#DFB755]" />
                      {selectedApt.fecha}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Hora
                    </span>
                    <p className="font-extrabold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                      {selectedApt.hora.substring(0, 5)}
                    </p>
                  </div>
                </div>

                {selectedApt.notas && (
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 text-[11px]">
                    <span className="font-bold text-muted-foreground block">Notas:</span>
                    <p className="text-foreground mt-0.5">{selectedApt.notas}</p>
                  </div>
                )}
              </div>

              {/* LÍNEA PERFORADA CON TROQUELADO DE TICKET */}
              <div className="relative my-2">
                <div className="border-t-2 border-dashed border-border" />
                <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-background border-r border-[#DFB755]/50" />
                <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-background border-l border-[#DFB755]/50" />
              </div>

              {/* PIE DEL TICKET CON CÓDIGO QR Y TARIFA */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Total a Cancelar en Silla
                  </span>
                  <span className="text-2xl font-black text-[#DFB755] dark:text-[#E8C466]">
                    ${Number(selectedApt.precio).toLocaleString("es-CO")}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">
                    ID Cita: #{String(selectedApt.id_cita).padStart(4, "0")}
                  </span>
                </div>

                {/* Código QR decorativo generado con SVG */}
                <div className="p-2 rounded-2xl bg-white text-zinc-950 shrink-0 shadow-md flex flex-col items-center justify-center">
                  <QrCode className="w-14 h-14" />
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-800 mt-0.5">
                    VALIDAR SALÓN
                  </span>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN RÁPIDA: CALENDARIO Y WHATSAPP */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={createGoogleCalendarUrl({
                  title: `Cita en Tu Turno Barber - ${selectedApt.tituloItem}`,
                  date: selectedApt.fecha,
                  time: selectedApt.hora,
                  barberName: selectedApt.barberoNombre,
                  price: selectedApt.precio
                })}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-card border border-border hover:border-[#DFB755] text-foreground text-xs font-extrabold flex items-center justify-center gap-2 transition-all hover:shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-[#DFB755]" />
                <span>Google Cal</span>
              </a>

              <a
                href={createWhatsAppShareUrl({
                  id: selectedApt.id_cita,
                  serviceName: selectedApt.tituloItem,
                  date: selectedApt.fecha,
                  time: selectedApt.hora,
                  barberName: selectedApt.barberoNombre
                })}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadIcsFile({
                    title: `Tu Turno Barber: ${selectedApt.tituloItem}`,
                    date: selectedApt.fecha,
                    time: selectedApt.hora,
                    barberName: selectedApt.barberoNombre
                  });
                  toast.success("Archivo de calendario (.ics) descargado");
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar (.ics)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-bold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL REAGENDAR CITA CON NUEVO CALENDARIO INTERACTIVO */}
      {showRescheduleModal && selectedApt && (
        <Modal
          title={`Reagendar Cita #${selectedApt.id_cita}`}
          onClose={() => setShowRescheduleModal(false)}
          maxWidthClass="max-w-2xl"
        >
          <form onSubmit={handleConfirmReschedule} className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-[#DFB755]/10 border border-[#DFB755]/30 text-xs text-foreground flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-[#DFB755] block">Barbero Asignado: {selectedApt.barberoNombre}</span>
                <span className="text-muted-foreground">Elige una nueva fecha en el calendario interactivo y selecciona el horario de tu preferencia.</span>
              </div>
            </div>

            {/* Calendario Interactivo con Disponibilidad */}
            <ClientBookingDatePicker
              selectedDate={rescheduleDate}
              onDateChange={(newD) => setRescheduleDate(newD)}
              selectedBarber={{
                id_barbero: selectedApt.id_barbero,
                nombre: selectedApt.barberoNombre,
                especialidad: selectedApt.barberoEspecialidad
              }}
            />

            {/* Selección de nuevo turno */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Horarios Disponibles para {rescheduleDate}
              </label>

              {availableRescheduleSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableRescheduleSlots.map((slot) => {
                    const isSelected = rescheduleSlot === slot.hora;
                    return (
                      <button
                        key={slot.hora}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => setRescheduleSlot(slot.hora)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${
                          !slot.disponible
                            ? "bg-muted/40 text-muted-foreground/30 border border-border cursor-not-allowed opacity-40"
                            : isSelected
                            ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black shadow-md shadow-[#DFB755]/25 scale-105"
                            : "bg-card border border-border hover:border-[#DFB755] text-foreground"
                        }`}
                      >
                        {slot.hora}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-destructive p-3 rounded-xl bg-destructive/10">
                  El barbero no cuenta con turnos disponibles para esta fecha.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black text-xs shadow-md shadow-[#DFB755]/20 hover:brightness-105 transition-all cursor-pointer"
              >
                Confirmar Reagendamiento
              </button>
            </div>
          </form>
        </Modal>
      )}


      {/* MODAL CANCELAR CITA */}
      {showCancelModal && selectedApt && (
        <Modal title="¿Cancelar esta Cita?" onClose={() => setShowCancelModal(false)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Esta acción liberará tu turno en la agenda de la barbería.</p>
                <p className="mt-1 text-muted-foreground">
                  Cita: {selectedApt.tituloItem} — {selectedApt.fecha} a las {selectedApt.hora.substring(0, 5)}
                </p>
              </div>
            </div>

            <div>
              <SearchableSelect
                label="Motivo de Cancelación"
                value={cancelReason}
                onChange={setCancelReason}
                options={[
                  "Cambio de planes personales",
                  "Inconveniente de horario",
                  "Prefiero agendar para otra semana",
                  "Otro motivo"
                ]}
                searchable={false}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                No, Mantener
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs hover:bg-destructive/90 cursor-pointer"
              >
                Sí, Cancelar Cita
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
