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
  const serviciosRealizados = loyaltyDetails?.serviciosRealizados ?? loyaltyDetails?.visitsCount ?? 0;
  const sellosCiclo = loyaltyDetails?.sellosCiclo ?? (serviciosRealizados % 5 === 0 && serviciosRealizados > 0 ? 5 : serviciosRealizados % 5);
  const target = 5;
  const cortesFaltantes = loyaltyDetails?.cortesFaltantes ?? (5 - sellosCiclo);
  const percent = loyaltyDetails?.progressPercent ?? Math.round((sellosCiclo / 5) * 100);

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
        whileHover={showQrModal ? {} : { scale: 1.012 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242424] via-[#16140E] to-[#0A0A0A] border border-[#C9A24A]/50 p-6 sm:p-7 shadow-[0_20px_50px_rgba(201,162,74,0.28)] text-white select-none transition-shadow hover:shadow-[0_25px_60px_rgba(201,162,74,0.38)] space-y-5 group"
      >
        {/* Reflejo Glare dinámico que sigue el cursor */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered && !showQrModal ? 0.35 : 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 230, 160, 0.45), transparent 70%)`
          }}
        />

        {/* Shine beam overlay de esquina idéntico a la landing page */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-gradient-to-br from-[#C9A24A]/30 to-transparent rounded-full filter blur-2xl pointer-events-none" />

        {/* FILA 1: MARCA VIP BLACK PASS + CHIP DORADO + INSIGNIA NIVEL */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C9A24A]/20 border border-[#C9A24A] flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div className="leading-tight">
              <div className="text-white font-black text-xs sm:text-sm tracking-widest">
                TU TURNO
              </div>
              <div className="text-[#C9A24A] text-[0.58rem] sm:text-[0.62rem] font-bold tracking-[0.22em] uppercase">
                VIP BLACK PASS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Chip de Tarjeta Dorado Metálico */}
            <div className="w-11 h-8 rounded-lg bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 opacity-95 border border-amber-500/60 shadow-inner flex items-center justify-center relative overflow-hidden shrink-0">
              <div className="w-full h-[1px] bg-amber-900/40 absolute top-2" />
              <div className="w-full h-[1px] bg-amber-900/40 absolute bottom-2" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute left-3" />
              <div className="h-full w-[1px] bg-amber-900/40 absolute right-3" />
            </div>

            {/* Insignia de Nivel */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#C9A24A]/20 text-[#FFE082] border border-[#C9A24A]/50 shadow-inner shrink-0">
              <Crown className="w-3.5 h-3.5 text-[#DFB755]" />
              <span>NIVEL {tier.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* FILA 2: TITULAR DEL SERVICIO & NÚMERO DE MIEMBRO + ESTADO ACTIVO */}
        <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8A8E] block">
              Titular del Servicio
            </span>
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {clientName}
              <ShieldCheck className="w-4 h-4 text-[#C9A24A]" />
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-[10px] uppercase font-semibold tracking-widest text-[#8A8A8E] block">
              Número de Miembro
            </span>
            <div className="text-white font-mono text-xs sm:text-sm tracking-[0.16em] font-bold text-[#FFE082]">
              TT-7892 • {(tier || "GOLD").toUpperCase()} TIER
            </div>
            <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 justify-end pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              ESTADO ACTIVO
            </div>
          </div>
        </div>

        {/* FILA 3: TARJETA DE SELLOS · 5 CORTES (COMPONENTE INTEGRADO EN EL MISMO DISEÑO) */}
        <div className="relative z-10 space-y-3 p-4 sm:p-5 rounded-2xl bg-black/40 border border-[#C9A24A]/30 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#C9A24A]" />
              Tarjeta de Sellos · 5 Cortes
            </span>
            <span className="font-mono font-extrabold text-[#FFE082] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              <AnimatedCounter value={serviciosRealizados} /> {serviciosRealizados === 1 ? "corte realizado" : "cortes realizados"}
            </span>
          </div>

          {/* Grid de los 5 sellos interactivos */}
          <div className="grid grid-cols-5 gap-2 pt-1 pb-1">
            {[1, 2, 3, 4, 5].map((num) => {
              const isStamped = sellosCiclo >= num;
              const isRewardSlot = num === 5;
              return (
                <div
                  key={num}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
                    isStamped
                      ? isRewardSlot
                        ? "bg-gradient-to-b from-[#DFB755]/30 to-[#DFB755]/10 border-[#DFB755] shadow-[0_0_12px_rgba(223,183,85,0.4)] text-[#FFE082]"
                        : "bg-[#DFB755]/15 border-[#DFB755]/60 text-[#FFE082] shadow-xs"
                      : isRewardSlot
                      ? "bg-white/5 border-dashed border-[#DFB755]/40 text-zinc-500"
                      : "bg-black/30 border-dashed border-zinc-700/60 text-zinc-600"
                  }`}
                >
                  {isStamped ? (
                    <motion.div
                      initial={{ scale: 0.5, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      {isRewardSlot ? (
                        <Crown className="w-4 h-4 text-[#FFE082] animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#DFB755]" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {isRewardSlot ? "¡Gratis!" : `Corte ${num}`}
                      </span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      {isRewardSlot ? (
                        <Gift className="w-3.5 h-3.5 text-[#DFB755]" />
                      ) : (
                        <Scissors className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px] font-bold">
                        {isRewardSlot ? "Premio" : `${num}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Barra de progreso de ciclo y texto dinámico */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Progreso hacia tu 5° Corte:</span>
              <span className="font-extrabold text-[#DFB755]">{sellosCiclo} de 5 sellos</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#E8C466] via-[#DFB755] to-[#F3D37A] shadow-[0_0_12px_#DFB755]"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-300 font-medium leading-tight pt-1">
            {loyaltyDetails?.nextBenefit || "Completa 5 cortes para ganar tu servicio o corte gratis."}
          </p>
        </div>

        {/* FILA 4: INSIGNIAS Y BOTÓN PASE QR SALÓN */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Insignias:
            </span>
            {loyaltyDetails?.badges?.map((b) => (
              <span
                key={b.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  b.unlocked
                    ? "bg-[#C9A24A]/15 text-[#FFE082] border border-[#C9A24A]/40 shadow-xs"
                    : "bg-zinc-900/60 text-zinc-500 border border-zinc-800/60 opacity-60"
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pase QR Salón</span>
          </button>
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
                  Muestra este código al barbero o recepcionista para registrar tu visita y sellar tu tarjeta.
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
                  <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                  Sellos: <strong className="text-[#DFB755]">{sellosCiclo}/5 cortes</strong>
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
