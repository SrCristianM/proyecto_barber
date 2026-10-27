import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Crown,
  Sparkles,
  Scissors,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Award,
  Flame,
  User,
  Compass,
  QrCode
} from "lucide-react";
import { getLocalDateString, parseLocalDate } from "../../../shared/utils/dateUtils.js";
import { getClientAppointments } from "../services/clientStorageService.js";

export default function ClientWelcomeModal({
  isOpen,
  onClose,
  profile,
  loyaltyDetails,
  upcomingAppointment,
  favoriteBarber = "Carlos Rodríguez",
  onOpenDetailModal
}) {
  const navigate = useNavigate();

  // Determinar saludo dinámico según la hora local
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Buenos días", emoji: "🌅", time: "morning" };
    if (hour >= 12 && hour < 19) return { text: "Buenas tardes", emoji: "☀️", time: "afternoon" };
    return { text: "Buenas noches", emoji: "🌙", time: "evening" };
  }, []);

  // Calcular días desde el último corte completado
  const lastCutInfo = useMemo(() => {
    try {
      const appointments = getClientAppointments();
      const completed = appointments
        .filter((a) => a.estado === "Completada")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (completed.length === 0) return null;

      const lastDate = parseLocalDate(completed[0].fecha);
      const today = new Date();
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      return {
        days: diffDays,
        serviceName: completed[0].tituloItem || "Corte Clásico",
        barberName: completed[0].barberoNombre || favoriteBarber
      };
    } catch {
      return null;
    }
  }, [favoriteBarber]);

  // Bloquear scroll de fondo y disparar confeti dorado y de lujo al abrir el modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.5 },
          colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"],
          scalar: 1.05
        });
      } catch (e) {
        // Fallback silencioso si confetti no está disponible
      }
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => {
    document.body.style.overflow = "";
    onClose();
  };

  if (!isOpen) return null;

  const displayName = profile?.nombre || "Amigo";
  const loyaltyTier = loyaltyDetails?.tier || profile?.nivel_fidelidad || "Nuevo";
  const sellosCiclo = loyaltyDetails?.sellosCiclo ?? 1;
  const targetSellos = 5;
  const cortesFaltantes = Math.max(0, targetSellos - sellosCiclo);

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/25 dark:bg-black/60 backdrop-blur-[2px] overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="relative w-full max-w-2xl my-auto rounded-3xl bg-card border-2 border-[#DFB755]/50 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-6 sm:p-8 text-foreground overflow-hidden"
        >
          {/* Ambient Glows sutiles */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#DFB755]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer z-10"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>

          {/* CABECERA: MARCA TU TURNO + SALUDO VIP */}
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              <Crown className="w-3.5 h-3.5" />
              <span>Experiencia VIP Tu Turno</span>
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              • Salón & Barbería Prémium
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#DFB755] via-[#DDAE41] to-amber-700 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shadow-[#DFB755]/20 ring-2 ring-[#DFB755]/40">
                  {displayName.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-[#DFB755] text-[#DFB755]">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                  <span>{greeting.emoji} {greeting.text},</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {displayName}
                </h2>
                <p className="text-xs text-[#DFB755] font-bold flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                  Membresía: Nivel {loyaltyTier}
                </p>
              </div>
            </div>

            {/* Micro Badge Barbería Activa */}
            <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 self-start sm:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                  Salón en Servicio
                </span>
                <span className="text-[10px] text-muted-foreground">Atención activa hoy</span>
              </div>
            </div>
          </div>

          {/* CUERPO CENTRAL: FLASH BRIEFING & ESTADO DE ESTILO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            {/* PANEL 1: ESTADO DE ESTILO & RECORDATORIO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card/80 border border-border flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                    Diagnóstico de Estilo
                  </span>
                  <span className="text-[10px] font-bold text-[#DFB755]">VIP Pass</span>
                </div>

                <div className="mt-2.5">
                  {lastCutInfo ? (
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">
                        Hace {lastCutInfo.days} días fue tu último corte
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lastCutInfo.days >= 18
                          ? "Tu corte está en el punto exacto para retocar degradado, contornos y barba."
                          : "Tu estilo se mantiene en óptimas condiciones. Recuerda agendar con anticipación."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-extrabold text-foreground">
                        Tu primera cita te espera
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Disfruta de una experiencia de corte prémium con lavado, toalla tibia y perfilado profesional.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de sellos de lealtad */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1.5 font-bold">
                  <span>Progreso de Fidelidad</span>
                  <span className="text-[#DFB755] font-black">{sellosCiclo} de {targetSellos} sellos</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#DFB755] to-[#DDAE41] transition-all duration-500 shadow-xs"
                    style={{ width: `${Math.min(100, (sellosCiclo / targetSellos) * 100)}%` }}
                  />
                </div>
                <span className="text-[9.5px] text-muted-foreground block mt-1">
                  {cortesFaltantes > 0
                    ? `Faltan ${cortesFaltantes} servicio(s) para tu beneficio exclusivo.`
                    : "¡Felicidades! Tienes un beneficio VIP listo para redimir."}
                </span>
              </div>
            </div>

            {/* PANEL 2: PRÓXIMA CITA EN VIVO O BARBERO HABITUAL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-card/80 border border-border flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#DFB755]" />
                  Tu Agenda de Barbería
                </span>

                <div className="mt-2.5">
                  {upcomingAppointment ? (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/15 via-card to-emerald-500/5 border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cita Programada Activa</span>
                      </div>
                      <h4 className="text-sm font-black text-foreground mt-1">
                        {upcomingAppointment.tituloItem}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Con <strong>{upcomingAppointment.barberoNombre}</strong> el día <strong>{upcomingAppointment.fecha}</strong> a las <strong>{upcomingAppointment.hora.substring(0, 5)}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                      <h4 className="text-sm font-extrabold text-foreground">
                        Sin citas pendientes
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tu barbero habitual <strong>{favoriteBarber}</strong> cuenta con agenda abierta esta semana.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de acción según cita */}
              <div className="pt-2">
                {upcomingAppointment ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      if (onOpenDetailModal) {
                        onOpenDetailModal(upcomingAppointment);
                      } else {
                        navigate("/portal/mis-citas");
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-card border border-[#DFB755]/50 hover:bg-[#DFB755]/10 text-foreground font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span>Ver Mi Pase Digital de Cita</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      navigate("/portal/agendar");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:brightness-105 active:scale-95 text-zinc-950 font-black text-xs shadow-md shadow-[#DFB755]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Ahora con 1 Clic</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PIE DEL MODAL: ACCIONES DIRECTAS */}
          <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#DFB755]" />
              <span>Puedes volver a abrir este resumen cuando quieras desde tu inicio</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border hover:bg-accent text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate("/portal/agendar");
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black text-xs shadow-md shadow-[#DFB755]/20 hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explorar Salón</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
