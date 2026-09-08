import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Award, Sparkles, Crown, CheckCircle2, ShieldCheck, Gift, Clock, Scissors, QrCode, X } from "lucide-react";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import AnimatedCounter from "./AnimatedCounter";

export default function VipLoyaltyCard({ loyaltyDetails, clientName = "Cristian" }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // 3D Tilt Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    damping: 20,
    stiffness: 250
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    damping: 20,
    stiffness: 250
  });

  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowQrModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showQrModal]);

  const handleMouseMove = (e) => {
    if (showQrModal || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const openQrModal = (e) => {
    e.stopPropagation();
    // Restablecer inclinación para evitar parpadeos o congelamientos
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    setShowQrModal(true);
  };

  const tier = loyaltyDetails?.tier || "Plata";
  const points = loyaltyDetails?.currentPoints || 0;
  const target = loyaltyDetails?.targetPoints || 100;
  const percent = loyaltyDetails?.progressPercent || 0;

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !showQrModal && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: showQrModal ? 0 : rotateX,
          rotateY: showQrModal ? 0 : rotateY,
          transformStyle: "preserve-3d"
        }}
        whileHover={showQrModal ? {} : { scale: 1.015 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1C18] via-[#141416] to-[#0D0D0E] border border-[#DFB755]/30 p-6 sm:p-7 shadow-2xl text-white select-none transition-shadow hover:shadow-[0_20px_45px_rgba(223,183,85,0.18)]"
      >
        {/* Reflejo Glare dinámico que sigue el mouse */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered && !showQrModal ? 0.35 : 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 230, 160, 0.45), transparent 70%)`
          }}
        />

        {/* Patrón de líneas decorativas luxury */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#DFB755]/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between space-y-6">
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8C466] to-[#DDAE41] text-black flex items-center justify-center shadow-lg shadow-[#DDAE41]/30">
                <BarberScissorsIcon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#DFB755] block">
                  Club Exclusivo
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Membresía Barber VIP
                </h3>
              </div>
            </div>

            {/* Insignia de Nivel Metálica */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#DFB755]/20 text-[#FFE082] border border-[#DFB755]/50 shadow-inner">
              <Crown className="w-3.5 h-3.5 text-[#DFB755]" />
              <span>NIVEL {tier}</span>
            </div>
          </div>

          {/* Nombre y Número de Membresía */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Titular del Servicio
            </span>
            <p className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
              {clientName}
              <ShieldCheck className="w-4 h-4 text-[#DFB755]" />
            </p>
          </div>

          {/* Barra de progreso de puntos */}
          <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-[#DFB755]" />
                Puntos de Fidelidad
              </span>
              <span className="font-mono font-extrabold text-[#FFE082]">
                <AnimatedCounter value={points} /> / {target} pts
              </span>
            </div>

            {/* Barra de progreso visual con efecto resplandor */}
            <div className="relative h-3 w-full rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#E8C466] via-[#DFB755] to-[#F3D37A] shadow-[0_0_12px_#DFB755]"
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-tight pt-1">
              {loyaltyDetails?.nextBenefit || "Próximo beneficio garantizado en tu siguiente nivel."}
            </p>
          </div>

          {/* Insignias Desbloqueadas y Botón QR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                Insignias:
              </span>
              {loyaltyDetails?.badges?.map((b) => (
                <span
                  key={b.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    b.unlocked
                      ? "bg-[#DFB755]/15 text-[#FFE082] border border-[#DFB755]/30 shadow-xs"
                      : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/40 opacity-60"
                  }`}
                >
                  {b.unlocked ? (
                    <CheckCircle2 className="w-3 h-3 text-[#DFB755]" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {b.name}
                </span>
              ))}
            </div>

            {/* Botón Abrir Pase Digital QR */}
            <button
              type="button"
              onClick={openQrModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Pase QR Salón</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* MODAL PASE DIGITAL QR RENDERIZADO EN PORTAL FUERA DEL CONTEXTO 3D */}
      {showQrModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-200"
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="relative w-full max-w-sm rounded-3xl bg-[#121214] border border-[#DFB755]/50 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-white/5"
                aria-label="Cerrar modal QR"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DFB755] flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#DFB755]" />
                  Pase Digital de Salón
                </span>
                <h3 className="text-xl font-black text-white tracking-tight">Check-in y Acumulación</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Muestra este código al barbero o recepcionista para registrar tu visita y sumar puntos.
                </p>
              </div>

              {/* QR Visual */}
              <div className="p-5 rounded-2xl bg-white flex flex-col items-center justify-center shadow-2xl mx-auto max-w-[220px]">
                <svg viewBox="0 0 100 100" className="w-40 h-40 fill-black">
                  {/* Patrón SVG simulación QR auténtico */}
                  <rect x="10" y="10" width="25" height="25" rx="3" fill="none" stroke="black" strokeWidth="6" />
                  <rect x="16" y="16" width="13" height="13" fill="black" />
                  <rect x="65" y="10" width="25" height="25" rx="3" fill="none" stroke="black" strokeWidth="6" />
                  <rect x="71" y="16" width="13" height="13" fill="black" />
                  <rect x="10" y="65" width="25" height="25" rx="3" fill="none" stroke="black" strokeWidth="6" />
                  <rect x="16" y="71" width="13" height="13" fill="black" />
                  <rect x="42" y="12" width="6" height="6" />
                  <rect x="52" y="18" width="6" height="6" />
                  <rect x="42" y="30" width="6" height="6" />
                  <rect x="50" y="42" width="8" height="8" />
                  <rect x="65" y="45" width="6" height="6" />
                  <rect x="45" y="65" width="6" height="6" />
                  <rect x="75" y="65" width="8" height="8" />
                  <rect x="65" y="80" width="6" height="6" />
                  <rect x="80" y="80" width="6" height="6" />
                  <rect x="40" y="80" width="8" height="8" />
                </svg>
                <span className="font-mono text-[11px] font-extrabold text-black mt-2 tracking-widest bg-zinc-100 px-2 py-0.5 rounded">
                  VIP-{(clientName || "CRIS").toUpperCase().slice(0, 4)}-8829
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#DFB755]" />
                  Nivel: <strong className="text-[#FFE082]">{tier}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFB755]" />
                  Puntos: <strong className="text-[#DFB755]">{points} pts</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs transition-all shadow-md cursor-pointer active:scale-98"
              >
                Entendido
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
