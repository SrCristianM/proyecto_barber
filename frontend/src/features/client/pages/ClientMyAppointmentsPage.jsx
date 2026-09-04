import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
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
  ChevronRight
} from "lucide-react";
import {
  getClientAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} from "../services/clientStorageService";
import Modal from "../../admin/shared/components/Modal";

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

  const todayStr = new Date().toISOString().split("T")[0];

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

  // Manejo de Reagendar
  const handleOpenReschedule = (apt) => {
    setSelectedApt(apt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
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
        return "bg-[#C9A24A]/15 text-[#C9A24A] border-[#C9A24A]/30";
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Agenda Personal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mis Citas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta tus citas activas, revisa tu historial o realiza reprogramaciones de turno.
          </p>
        </div>

        <Link
          to="/portal/agendar"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B08A33] hover:from-[#d8b056] hover:to-[#C9A24A] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>AGENDAR NUEVA CITA</span>
        </Link>
      </div>

      {/* PESTAÑAS (PRÓXIMAS CITAS / HISTORIAL) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-[#C9A24A] text-black shadow-sm"
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
              ? "bg-[#C9A24A] text-black shadow-sm"
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
                  className="rounded-3xl bg-card border border-border hover:border-[#C9A24A]/50 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
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
                        <Scissors className="w-3.5 h-3.5 text-[#C9A24A]" />
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
                      <span className="text-lg font-black text-[#C9A24A]">
                        ${Number(apt.precio).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs shadow-md hover:bg-[#d8b056]"
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:ring-2 focus:ring-[#C9A24A]"
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
                        <td className="py-3.5 px-4 font-black text-[#C9A24A]">
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

      {/* MODAL DETALLE DE CITA */}
      {showDetailModal && selectedApt && (
        <Modal title={`Detalle de Cita #${selectedApt.id_cita}`} onClose={() => setShowDetailModal(false)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(selectedApt.estado)}`}>
                  {selectedApt.estado}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio o Paquete:</span>
                <span className="font-bold text-foreground">{selectedApt.tituloItem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barbero Asignado:</span>
                <span className="font-bold text-foreground">{selectedApt.barberoNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Especialidad:</span>
                <span className="text-foreground">{selectedApt.barberoEspecialidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-bold text-foreground">{selectedApt.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span className="font-bold text-foreground">{selectedApt.hora.substring(0, 5)}</span>
              </div>
              {selectedApt.notas && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comentarios / Notas:</span>
                  <span className="font-medium text-foreground">{selectedApt.notas}</span>
                </div>
              )}
              {selectedApt.motivo_cancelacion && (
                <div className="flex justify-between text-destructive">
                  <span className="font-bold">Motivo Cancelación:</span>
                  <span>{selectedApt.motivo_cancelacion}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-base font-black text-[#C9A24A]">
                  ${Number(selectedApt.precio).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL REAGENDAR CITA */}
      {showRescheduleModal && selectedApt && (
        <Modal title={`Reagendar Cita #${selectedApt.id_cita}`} onClose={() => setShowRescheduleModal(false)}>
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-500">
              Barbero: <strong>{selectedApt.barberoNombre}</strong>.
              Elige una nueva fecha y confirma tu turno entre los horarios disponibles.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nueva Fecha
              </label>
              <input
                type="date"
                min={todayStr}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Horarios Disponibles para esta Fecha
              </label>
              {availableRescheduleSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableRescheduleSlots.map((slot) => (
                    <button
                      key={slot.hora}
                      type="button"
                      disabled={!slot.disponible}
                      onClick={() => setRescheduleSlot(slot.hora)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                        !slot.disponible
                          ? "bg-muted text-muted-foreground/30 border border-border cursor-not-allowed opacity-40"
                          : rescheduleSlot === slot.hora
                          ? "bg-[#C9A24A] text-black font-extrabold shadow-md"
                          : "bg-card border border-border hover:border-[#C9A24A] text-foreground"
                      }`}
                    >
                      {slot.hora}
                    </button>
                  ))}
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={!rescheduleSlot}
                className="px-5 py-2 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs hover:bg-[#d8b056] disabled:opacity-50 cursor-pointer"
              >
                Confirmar Cambio
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
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Motivo de Cancelación
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm"
              >
                <option value="Cambio de planes personales">Cambio de planes personales</option>
                <option value="Inconveniente de horario">Inconveniente de horario</option>
                <option value="Prefiero agendar para otra semana">Prefiero agendar para otra semana</option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
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
