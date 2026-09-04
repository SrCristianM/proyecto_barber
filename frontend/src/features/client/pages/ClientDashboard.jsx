import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  Scissors,
  ShoppingBag,
  Receipt,
  User,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  Award,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import {
  getCurrentClientProfile,
  getClientAppointments,
  getClientServices,
  getClientPackages,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} from "../services/clientStorageService";
import { toast } from "sonner";
import Modal from "../../admin/shared/components/Modal";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [favoriteBarber, setFavoriteBarber] = useState("Carlos Rodríguez");
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  // Modales desde el Dashboard
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Cambio de planes personales");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);

  const navigate = useNavigate();

  const loadDashboardData = () => {
    const prof = getCurrentClientProfile();
    setProfile(prof);

    const appointments = getClientAppointments();
    const todayStr = new Date().toISOString().split("T")[0];

    // Buscar la cita próxima más cercana
    const upcoming = appointments
      .filter((a) => (a.estado === "Programada" || a.estado === "Reprogramada") && a.fecha >= todayStr)
      .sort((a, b) => new Date(`${a.fecha} ${a.hora}`) - new Date(`${b.fecha} ${b.hora}`));

    setUpcomingAppointment(upcoming[0] || null);

    const completed = appointments.filter((a) => a.estado === "Completada");
    setCompletedCount(completed.length);

    // Identificar barbero más frecuente
    if (completed.length > 0) {
      const barberCounts = {};
      completed.forEach((c) => {
        barberCounts[c.barberoNombre] = (barberCounts[c.barberoNombre] || 0) + 1;
      });
      const topBarber = Object.keys(barberCounts).reduce((a, b) => (barberCounts[a] > barberCounts[b] ? a : b));
      if (topBarber) setFavoriteBarber(topBarber);
    }

    setServices(getClientServices().slice(0, 4));
    setPackages(getClientPackages().slice(0, 2));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Actualizar slots al cambiar fecha en reagendar
  useEffect(() => {
    if (showRescheduleModal && upcomingAppointment && rescheduleDate) {
      const slots = getAvailableSlots(upcomingAppointment.id_barbero, rescheduleDate);
      setAvailableRescheduleSlots(slots);
      const firstFree = slots.find((s) => s.disponible);
      setRescheduleSlot(firstFree ? firstFree.hora : "");
    }
  }, [showRescheduleModal, rescheduleDate]);

  const handleOpenReschedule = () => {
    if (!upcomingAppointment) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setRescheduleDate(tomorrowStr);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot) {
      toast.error("Por favor selecciona una fecha y un horario disponible.");
      return;
    }
    const res = rescheduleAppointment(upcomingAppointment.id_cita, {
      nuevaFecha: rescheduleDate,
      nuevaHora: rescheduleSlot
    });
    if (res.success) {
      toast.success("¡Tu cita ha sido reagendada con éxito!");
      setShowRescheduleModal(false);
      loadDashboardData();
    } else {
      toast.error(res.error);
    }
  };

  const handleConfirmCancel = () => {
    if (!upcomingAppointment) return;
    const res = cancelAppointment(upcomingAppointment.id_cita, cancelReason);
    if (res.success) {
      toast.success("La cita ha sido cancelada.");
      setShowCancelModal(false);
      loadDashboardData();
    } else {
      toast.error(res.error);
    }
  };

  const displayName = profile?.nombre || "Amigo";
  const loyaltyTier = profile?.nivel_fidelidad || "Nuevo";

  return (
    <div className="space-y-8">
      {/* BANNER DE BIENVENIDA Y ACCIÓN RÁPIDA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/90 to-[#C9A24A]/10 border border-[#C9A24A]/30 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C9A24A]/20 text-[#C9A24A] border border-[#C9A24A]/40">
            <Award className="w-3.5 h-3.5" /> Cliente {loyaltyTier}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            ¡Hola, <span className="text-[#C9A24A]">{displayName}</span>!
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            ¿Qué servicio deseas reservar hoy? Nuestro equipo de barberos profesionales está listo para brindarte el mejor estilo, atención y comodidad.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <Link
              to="/portal/agendar"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C9A24A] to-[#B08A33] hover:from-[#d8b056] hover:to-[#C9A24A] text-black font-extrabold text-sm shadow-lg shadow-[#C9A24A]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>AGENDAR NUEVA CITA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/portal/servicios"
              className="px-5 py-3.5 rounded-2xl bg-card border border-border hover:bg-accent text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Scissors className="w-4 h-4 text-[#C9A24A]" />
              <span>Explorar Servicios</span>
            </Link>
          </div>
        </div>

        {/* Decoración geométrica sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C9A24A]/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* ACCIONES RÁPIDAS EN GRID */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { to: "/portal/agendar", label: "Agendar Cita", icon: Calendar, color: "text-[#C9A24A] bg-[#C9A24A]/10" },
            { to: "/portal/mis-citas", label: "Mis Citas", icon: Clock, color: "text-blue-500 bg-blue-500/10" },
            { to: "/portal/servicios", label: "Servicios", icon: Scissors, color: "text-purple-500 bg-purple-500/10" },
            { to: "/portal/paquetes", label: "Paquetes", icon: ClientStarIcon, color: "text-[#C9A24A] bg-[#C9A24A]/10" },
            { to: "/portal/productos", label: "Productos", icon: ShoppingBag, color: "text-emerald-500 bg-emerald-500/10" },
            { to: "/portal/mis-compras", label: "Historial", icon: Receipt, color: "text-rose-500 bg-rose-500/10" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="group p-4 rounded-2xl bg-card border border-border hover:border-[#C9A24A]/40 hover:shadow-lg transition-all flex flex-col items-center text-center gap-2"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#C9A24A] transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN PRÓXIMA CITA & FIDELIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TARJETA PRÓXIMA CITA (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">Tu Próxima Cita</h2>
                  <p className="text-xs text-muted-foreground">Estado y detalles en tiempo real</p>
                </div>
              </div>

              {upcomingAppointment && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  {upcomingAppointment.estado}
                </span>
              )}
            </div>

            {upcomingAppointment ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Servicio o Paquete
                    </span>
                    <h3 className="text-lg font-extrabold text-foreground">
                      {upcomingAppointment.tituloItem}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#C9A24A]" />
                      Atendido por: <strong className="text-foreground">{upcomingAppointment.barberoNombre}</strong> ({upcomingAppointment.barberoEspecialidad})
                    </p>
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total a Pagar
                    </span>
                    <p className="text-xl font-black text-[#C9A24A]">
                      ${Number(upcomingAppointment.precio || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Fecha</span>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {upcomingAppointment.fecha}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Hora Turno</span>
                      <p className="text-xs sm:text-sm font-bold text-foreground">
                        {upcomingAppointment.hora.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones de la cita */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ver Detalle
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenReschedule}
                    className="px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reagendar Cita
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-foreground">No tienes citas programadas</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  ¿Listo para tu próximo corte o afeitado? Elige a tu barbero preferido y reserva tu turno en segundos.
                </p>
                <div className="pt-2">
                  <Link
                    to="/portal/agendar"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 hover:bg-[#d8b056] transition-all"
                  >
                    <span>AGENDAR UNA CITA AHORA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TARJETA DE FIDELIDAD & MÉTRICAS (1 COL) */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Tu Perfil de Cliente</h2>
              <span className="p-2 rounded-xl bg-[#C9A24A]/10 text-[#C9A24A]">
                <Award className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C9A24A]/15 to-transparent border border-[#C9A24A]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A24A]">Nivel de Fidelidad</span>
                <p className="text-xl font-black text-foreground mt-0.5">Cliente {loyaltyTier}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Disfruta de beneficios, promociones en paquetes y prioridad de reserva.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Citas Atendidas</span>
                  <p className="text-xl font-black text-foreground mt-1">{completedCount}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Barbero Favorito</span>
                  <p className="text-xs font-bold text-foreground mt-1 truncate">{favoriteBarber.split(" ")[0]}</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/portal/perfil"
            className="w-full py-2.5 px-4 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Editar Datos de Perfil</span>
          </Link>
        </div>
      </div>

      {/* SECCIÓN DE SERVICIOS DESTACADOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Servicios Destacados</h2>
            <p className="text-xs text-muted-foreground">Los cortes y tratamientos más solicitados</p>
          </div>
          <Link
            to="/portal/servicios"
            className="text-xs font-bold text-[#C9A24A] hover:underline flex items-center gap-1"
          >
            Ver todos los servicios <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id_servicio}
              className="group rounded-2xl bg-card border border-border hover:border-[#C9A24A]/40 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-4"
            >
              <div className="space-y-3">
                <div className="relative h-32 w-full rounded-xl overflow-hidden bg-muted">
                  {svc.imagen_url ? (
                    <img
                      src={svc.imagen_url}
                      alt={svc.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#C9A24A]/10 text-[#C9A24A]">
                      <Scissors className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                    {svc.duracion_minutos} min
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-[#C9A24A] transition-colors">
                    {svc.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {svc.descripcion}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm font-black text-[#C9A24A]">
                  ${Number(svc.precio).toLocaleString("es-CO")}
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/portal/agendar?servicio=${svc.id_servicio}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#C9A24A]/15 text-[#C9A24A] hover:bg-[#C9A24A] hover:text-black text-xs font-bold transition-all cursor-pointer"
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALLE CITA */}
      {showDetailModal && upcomingAppointment && (
        <Modal title="Detalle de tu Cita" onClose={() => setShowDetailModal(false)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">ID de Cita:</span>
                <span className="text-xs font-mono font-bold text-foreground">#{upcomingAppointment.id_cita}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Servicio:</span>
                <span className="text-xs font-bold text-foreground">{upcomingAppointment.tituloItem}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Barbero Asignado:</span>
                <span className="text-xs font-bold text-foreground">{upcomingAppointment.barberoNombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Fecha:</span>
                <span className="text-xs font-bold text-foreground">{upcomingAppointment.fecha}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Hora:</span>
                <span className="text-xs font-bold text-foreground">{upcomingAppointment.hora.substring(0, 5)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground">Precio Total:</span>
                <span className="text-base font-black text-[#C9A24A]">
                  ${Number(upcomingAppointment.precio || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL REAGENDAR CITA */}
      {showRescheduleModal && upcomingAppointment && (
        <Modal title="Reagendar Cita" onClose={() => setShowRescheduleModal(false)}>
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-500">
              Barbero: <strong>{upcomingAppointment.barberoNombre}</strong>.
              Selecciona una nueva fecha y un horario con disponibilidad garantizada.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nueva Fecha
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Horarios Disponibles
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
                          ? "bg-muted text-muted-foreground/40 border border-border cursor-not-allowed opacity-50"
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
                  El barbero no cuenta con turnos disponibles para esta fecha. Intenta con otro día.
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
                Confirmar Nuevo Horario
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL CANCELAR CITA */}
      {showCancelModal && upcomingAppointment && (
        <Modal title="¿Cancelar esta Cita?" onClose={() => setShowCancelModal(false)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Esta acción cancelará tu cita en la agenda del barbero.</p>
                <p className="mt-1 text-muted-foreground">
                  Cita: {upcomingAppointment.tituloItem} — {upcomingAppointment.fecha} a las {upcomingAppointment.hora.substring(0, 5)}
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
                No, Mantener Cita
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
