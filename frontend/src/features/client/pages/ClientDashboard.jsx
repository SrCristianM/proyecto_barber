import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
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
  Phone,
  Sparkles,
  Percent,
  Star,
  Bookmark,
  Zap,
  RotateCw
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import VipLoyaltyCard from "../components/VipLoyaltyCard";
import ReviewModal from "../components/ReviewModal";
import AnimatedCounter from "../components/AnimatedCounter";
import BarberPole from "../components/BarberPole";
import StyleQuizModal from "../components/StyleQuizModal";
import BarberRewardsModal from "../components/BarberRewardsModal";
import SalonAmbienceWidget from "../components/SalonAmbienceWidget";
import UpcomingAppointmentTimeline from "../components/UpcomingAppointmentTimeline";
import ClientPromoBanner from "../components/ClientPromoBanner";
import SalonLiveRadar from "../components/SalonLiveRadar";
import { createGoogleCalendarUrl, downloadIcsFile, createWhatsAppShareUrl } from "../utils/calendarUtils";
import { Gift, Share2, Compass, Download } from "lucide-react";
import {
  getCurrentClientProfile,
  getClientAppointments,
  getClientPackages,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots,
  getClientLoyaltyDetails,
  getClientStyleLog,
  getClientReviews
} from "../services/clientStorageService";
import { toast } from "sonner";
import Modal from "../../admin/shared/components/Modal";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [favoriteBarber, setFavoriteBarber] = useState("Carlos Rodríguez");
  const [packages, setPackages] = useState([]);
  const [loyaltyDetails, setLoyaltyDetails] = useState(null);
  const [styleLog, setStyleLog] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Modales desde el Dashboard
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStyleQuizModal, setShowStyleQuizModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
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

    setPackages(getClientPackages().slice(0, 2));
    setLoyaltyDetails(getClientLoyaltyDetails());
    setStyleLog(getClientStyleLog());
    setReviews(getClientReviews());
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
  const fullClientName = profile ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim() : (displayName !== "Amigo" ? displayName : "Cliente VIP");
  const loyaltyTier = loyaltyDetails?.tier || profile?.nivel_fidelidad || "Nuevo";

  return (
    <div className="space-y-8">
      {/* BANNER DE BIENVENIDA Y ACCIÓN RÁPIDA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/90 to-[#DFB755]/10 border border-[#DFB755]/30 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] dark:text-[#E8C466] border border-[#DFB755]/40">
            <Award className="w-3.5 h-3.5" /> Cliente {loyaltyTier}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            ¡Hola, <span className="text-[#DFB755] dark:text-[#E8C466]">{displayName}</span>!
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            ¿Qué servicio deseas reservar hoy? Nuestro equipo de barberos profesionales está listo para brindarte el mejor estilo, atención y comodidad.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <Link
              to="/portal/agendar"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-sm shadow-lg shadow-[#DDAE41]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>AGENDAR NUEVA CITA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setShowStyleQuizModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-[#DFB755]/15 hover:bg-[#DFB755]/25 border border-[#DFB755]/40 text-[#DFB755] dark:text-[#E8C466] font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Descubre qué corte se adapta mejor a tu estructura facial"
            >
              <Compass className="w-4 h-4" />
              <span>¿Cuál es mi corte ideal?</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRewardsModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-card border border-border hover:bg-accent text-foreground font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Ver tarjeta de sellos y recompensas por cortes acumulados"
            >
              <Gift className="w-4 h-4 text-[#DFB755]" />
              <span>Mis Recompensas</span>
            </button>

            <Link
              to="/portal/servicios"
              className="px-5 py-3.5 rounded-2xl bg-card border border-border hover:bg-accent text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <BarberScissorsIcon className="w-4 h-4 text-[#DFB755]" strokeWidth={2} />
              <span>Explorar Servicios</span>
            </Link>
          </div>
        </div>

        {/* BarberPole clásico animado e iluminación dorada */}
        <div className="absolute right-8 top-8 bottom-8 flex items-center justify-center pointer-events-none hidden lg:flex">
          <BarberPole className="w-10 h-24 drop-shadow-xl" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#DFB755]/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* RADAR DE SALÓN EN VIVO */}
      <SalonLiveRadar />

      {/* BANNER INTELIGENTE: SUGERENCIA DE TURNO HABITUAL */}
      {completedCount > 0 && !upcomingAppointment && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#DFB755]/15 via-[#DFB755]/10 to-card border border-[#DFB755]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DFB755]/20 text-[#DFB755] flex items-center justify-center shrink-0 border border-[#DFB755]/30">
              <Zap className="w-5 h-5 fill-[#DFB755]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#DFB755]">
                  Sugerencia Inteligente
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFB755] animate-ping" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                ¿Es momento de retocar tu estilo con <strong className="text-[#DFB755]">{favoriteBarber}</strong>?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Reserva tu horario preferido de fin de semana con un solo clic.
              </p>
            </div>
          </div>

          <Link
            to="/portal/agendar"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>Apartar mi turno habitual</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* SECCIÓN PRINCIPAL: PRÓXIMA CITA + BITÁCORA (7 cols) & MEMBRESÍA VIP 3D (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: CITA PRÓXIMA Y BITÁCORA PERSONAL (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* TIMELINE ANIMADO DE PRÓXIMA CITA */}
          <UpcomingAppointmentTimeline
            appointment={upcomingAppointment}
            onReschedule={handleOpenReschedule}
            onCancel={() => setShowCancelModal(true)}
          />

          {/* BITÁCORA DE ESTILO: MI ÚLTIMO LOOK */}
          {styleLog && (
            <div className="rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">Mi Último Look Registrado</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Corte realizado por {styleLog.barbero} ({styleLog.fecha})
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-500 border border-purple-500/30">
                  {styleLog.corte}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/70">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Laterales & Fade
                  </span>
                  <p className="font-bold text-foreground mt-0.5">{styleLog.guiaLateral}</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/70">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Zona Superior
                  </span>
                  <p className="font-bold text-foreground mt-0.5">{styleLog.superior}</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/70">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Diseño de Barba
                  </span>
                  <p className="font-bold text-foreground mt-0.5">{styleLog.barba}</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/70">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Fijación Recomendada
                  </span>
                  <p className="font-bold text-foreground mt-0.5">{styleLog.productoUsado}</p>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  El barbero consultará esta ficha antes de iniciar tu corte.
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/portal/agendar?notas=${encodeURIComponent("Repetir especificaciones de mi último look habitual")}`)}
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-accent-foreground text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span>Repetir este Look</span>
                </button>
              </div>
            </div>
          )}

          {/* ESPACIO PUBLICITARIO & PROMOCIONES VIP */}
          <ClientPromoBanner />
        </div>

        {/* COLUMNA DERECHA: TARJETA VIP 3D & CALIFICACIÓN (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tarjeta VIP con inclinación 3D y barra de progreso */}
          <VipLoyaltyCard
            loyaltyDetails={loyaltyDetails}
            clientName={fullClientName}
          />

          {/* Tarjeta de Métricas Rápidas & Calificar Barbero */}
          <div className="rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#DFB755]" />
                Resumen de Actividad
              </span>

              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DFB755]/15 hover:bg-[#DFB755]/25 text-[#DFB755] border border-[#DFB755]/40 text-xs font-extrabold transition-all cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-[#DFB755]" />
                <span>Calificar Barbero</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-center">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Citas Asistidas
                </span>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  <AnimatedCounter value={completedCount} />
                </p>
                <span className="text-[10px] text-muted-foreground">Visitas totales</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-center">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                  Barbero Favorito
                </span>
                <p className="text-xs font-extrabold text-foreground mt-2 truncate">
                  {favoriteBarber}
                </p>
                <span className="text-[10px] text-[#DFB755] font-semibold">Master Barber</span>
              </div>
            </div>

            {/* Sede y horario rápido */}
            <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#DFB755]" />
                  Calle 10 # 40-20, El Poblado
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Abierto hoy
                </span>
              </div>
            </div>
          </div>

          {/* WIDGET DE AMBIENTACIÓN MUSICAL EN VIVO */}
          <SalonAmbienceWidget />
        </div>
      </div>

      {/* SECCIÓN DE PAQUETES & COMBOS EXCLUSIVOS */}
      {packages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] mb-1">
                <Percent className="w-3 h-3" /> Promociones Especiales
              </div>
              <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                Paquetes & Combos Completos
              </h2>
              <p className="text-xs text-muted-foreground">
                Disfruta de una experiencia integral con descuento exclusivo garantizado
              </p>
            </div>
            <Link
              to="/portal/paquetes"
              className="text-xs font-bold text-[#DDAE41] dark:text-[#E8C466] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id_paquete}
                className="group relative rounded-3xl bg-card border border-border hover:border-[#DFB755]/50 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#DFB755]/15 to-transparent rounded-bl-full pointer-events-none" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      -{pkg.descuento_porcentaje}% DE DESCUENTO
                    </span>
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                      {pkg.duracionTotal} min
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-[#DFB755] transition-colors">
                      {pkg.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pkg.descripcion}
                    </p>
                  </div>

                  {/* Servicios incluidos */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Servicios incluidos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.servicios?.map((s) => (
                        <span
                          key={s.id_servicio}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 border border-border text-[11px] font-semibold text-foreground"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#DFB755]" />
                          {s.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground line-through block">
                      ${Number(pkg.precioOriginal).toLocaleString("es-CO")}
                    </span>
                    <span className="text-xl font-black text-[#DDAE41] dark:text-[#E8C466]">
                      ${Number(pkg.precioFinal).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/portal/agendar?paquete=${pkg.id_paquete}`)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Reservar Paquete</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* SECCIÓN DE EXPERIENCIA & GARANTÍAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-card/60 border border-border/70 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#DFB755]/10 text-[#DFB755] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Puntualidad Garantizada</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reserva tu turno sin filas ni esperas. Tu barbero asignado te recibirá puntualmente.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card/60 border border-border/70 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#DFB755]/10 text-[#DFB755] shrink-0">
            <BarberScissorsIcon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Profesionales Certificados</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Barberos expertos en técnicas clásicas a navaja y las últimas tendencias de estilo.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card/60 border border-border/70 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#DFB755]/10 text-[#DFB755] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Ambiente VIP & Confort</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instalaciones de primer nivel, toallas calientes, productos importados y café de cortesía.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE CITA */}
      {showDetailModal && upcomingAppointment && (
        <Modal title="Detalle de tu Cita" onClose={() => setShowDetailModal(false)} maxWidthClass="max-w-xl">
          <div className="space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-muted/40 border border-border space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border/70">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ID de Cita
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono font-bold text-sm border border-primary/20">
                  #{upcomingAppointment.id_cita}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">Servicio:</span>
                <span className="text-base font-bold text-foreground text-right">{upcomingAppointment.tituloItem}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">Barbero Asignado:</span>
                <span className="text-sm font-bold text-foreground text-right">{upcomingAppointment.barberoNombre}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-background/60 border border-border/60">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Fecha</span>
                  <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {upcomingAppointment.fecha}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Hora</span>
                  <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    {upcomingAppointment.hora.substring(0, 5)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">Total a Pagar</span>
                  <span className="text-xs text-muted-foreground">Pago directo en el local</span>
                </div>
                <span className="text-2xl font-black text-[#DDAE41] dark:text-[#E8C466]">
                  ${Number(upcomingAppointment.precio || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-accent-foreground text-xs font-bold transition-all cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm focus:ring-2 focus:ring-[#DFB755]"
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
                          ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black font-extrabold shadow-md shadow-[#DDAE41]/25"
                          : "bg-card border border-border hover:border-[#DFB755] text-foreground"
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black font-extrabold text-xs hover:from-[#F0CF78] hover:to-[#E8C466] disabled:opacity-50 cursor-pointer shadow-sm"
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

      {/* MODAL CALIFICACIÓN POST-CITA CON CONFETTI */}
      {showReviewModal && (
        <ReviewModal
          appointment={upcomingAppointment || { barberoNombre: favoriteBarber }}
          onClose={() => setShowReviewModal(false)}
          onReviewSaved={() => {
            loadDashboardData();
          }}
        />
      )}

      {/* MODAL ASISTENTE DE ESTILO IDEAL */}
      {showStyleQuizModal && (
        <StyleQuizModal onClose={() => setShowStyleQuizModal(false)} />
      )}

      {/* MODAL RECOMPENSAS Y GAMIFICACIÓN VIP */}
      {showRewardsModal && (
        <BarberRewardsModal
          onClose={() => setShowRewardsModal(false)}
          onRewardClaimed={() => loadDashboardData()}
        />
      )}
    </div>
  );
}
