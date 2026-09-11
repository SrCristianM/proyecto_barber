import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, CheckCircle2, ShieldCheck, Gift, Clock, Scissors, QrCode, X, RotateCw } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

export default function VipLoyaltyCard({ loyaltyDetails, clientName = "Cristian" }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(null);

  // Medir la altura exacta del frente para que ambas caras tengan idéntica dimensión
  useEffect(() => {
    if (frontRef.current) {
      setCardHeight(frontRef.current.offsetHeight);
    }
  }, [loyaltyDetails, clientName]);

  const toggleFlip = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFlipped((prev) => !prev);
  };

  const tier = loyaltyDetails?.tier || "Plata";
  const serviciosRealizados = loyaltyDetails?.serviciosRealizados ?? loyaltyDetails?.visitsCount ?? 0;
  const sellosCiclo = loyaltyDetails?.sellosCiclo ?? (serviciosRealizados % 5 === 0 && serviciosRealizados > 0 ? 5 : serviciosRealizados % 5);
  const target = 5;
  const cortesFaltantes = loyaltyDetails?.cortesFaltantes ?? (5 - sellosCiclo);
  const percent = loyaltyDetails?.progressPercent ?? Math.round((sellosCiclo / 5) * 100);

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {!isFlipped ? (
          /* ============================================================ */
          /* CARA FRONTAL (DIMENSIÓN EXACTA Y DEFINICIÓN NÍTIDA)          */
          /* ============================================================ */
          <motion.div
            ref={frontRef}
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            style={{
              minHeight: cardHeight ? `${cardHeight}px` : "460px",
              transformOrigin: "center center"
            }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242424] via-[#16140E] to-[#0A0A0A] border border-[#C9A24A]/50 p-6 sm:p-7 shadow-[0_20px_50px_rgba(201,162,74,0.28)] text-white select-none transition-shadow hover:shadow-[0_25px_60px_rgba(201,162,74,0.38)] space-y-5 group antialiased flex flex-col justify-between"
          >
            {/* Brillo dorado de esquina con gradiente radial nativo (sin filtros borrosos) */}
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle at top right, rgba(201,162,74,0.22) 0%, transparent 68%)"
              }}
            />

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

            {/* FILA 3: TARJETA DE SELLOS · 5 CORTES */}
            <div className="relative z-10 space-y-3 p-4 sm:p-5 rounded-2xl bg-black/60 border border-[#C9A24A]/30 shadow-inner">
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
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-colors duration-200 ${
                        isStamped
                          ? isRewardSlot
                            ? "bg-gradient-to-b from-[#DFB755]/30 to-[#DFB755]/10 border-[#DFB755] shadow-[0_0_12px_rgba(223,183,85,0.4)] text-[#FFE082]"
                            : "bg-[#DFB755]/15 border-[#DFB755]/60 text-[#FFE082] shadow-xs"
                          : isRewardSlot
                          ? "bg-white/5 border-dashed border-[#DFB755]/40 text-zinc-500"
                          : "bg-black/40 border-dashed border-zinc-700/60 text-zinc-600"
                      }`}
                    >
                      {isStamped ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {isRewardSlot ? (
                            <Crown className="w-4 h-4 text-[#FFE082] animate-bounce" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#DFB755]" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {isRewardSlot ? "¡Gratis!" : `Corte ${num}`}
                          </span>
                        </div>
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

              {/* Barra de progreso de ciclo */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Progreso hacia tu 5° Corte:</span>
                  <span className="font-extrabold text-[#DFB755]">{sellosCiclo} de 5 sellos</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#E8C466] via-[#DFB755] to-[#F3D37A] shadow-[0_0_12px_#DFB755]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 font-medium leading-tight pt-1">
                {loyaltyDetails?.nextBenefit || "Completa 5 cortes para ganar tu servicio o corte gratis."}
              </p>
            </div>

            {/* FILA 4: INSIGNIAS Y BOTÓN GIRAR PASE */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                  Insignias:
                </span>
                {loyaltyDetails?.badges?.map((b) => (
                  <span
                    key={b.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                      b.unlocked
                        ? "bg-[#C9A24A]/15 text-[#FFE082] border border-[#C9A24A]/40 shadow-xs"
                        : "bg-zinc-900/60 text-zinc-500 border border-zinc-800/60 opacity-60"
                    }`}
                  >
                    {b.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#DFB755]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {b.name}
                  </span>
                ))}
              </div>

              {/* Botón Girar Pase Digital QR */}
              <button
                type="button"
                onClick={toggleFlip}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Girar Pase (Ver QR)</span>
                <RotateCw className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ============================================================ */
          /* CARA TRASERA (IDÉNTICO TAMAÑO Y ALINEACIÓN EXACTA)           */
          /* ============================================================ */
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            style={{
              minHeight: cardHeight ? `${cardHeight}px` : "460px",
              transformOrigin: "center center"
            }}
            className="relative rounded-3xl bg-gradient-to-br from-[#1C1A14] via-[#12110D] to-[#080808] border-2 border-[#DFB755]/70 p-6 sm:p-7 shadow-[0_25px_60px_rgba(201,162,74,0.35)] text-white flex flex-col justify-between overflow-hidden antialiased"
          >
            {/* Banda Magnética Superior */}
            <div className="w-full h-11 bg-zinc-950 -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 border-b border-[#DFB755]/30 flex items-center px-6 sm:px-7 justify-between text-[10px] font-mono text-zinc-400">
              <span className="tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DFB755] animate-pulse" />
                TU TURNO BARBER · VIP AUTHORIZED PASS
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[#FFE082] font-bold hidden sm:inline">SECURE ID: #7892</span>
                <button
                  type="button"
                  onClick={toggleFlip}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#DFB755]/20 text-[#DFB755] font-bold text-[10px] transition-colors cursor-pointer border border-[#DFB755]/30 active:scale-95"
                  title="Voltear al frente"
                >
                  <span>VOLVER</span>
                  <X className="w-3 h-3 text-[#DFB755]" />
                </button>
              </div>
            </div>

            {/* QR Code y Detalles de Membresía */}
            <div className="my-auto py-3 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="p-4 rounded-2xl bg-white shadow-2xl border-2 border-[#DFB755]/50 flex flex-col items-center shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="w-28 h-28 sm:w-32 sm:h-32 fill-black"
                  style={{ shapeRendering: "crispEdges" }}
                >
                  <rect x="10" y="10" width="25" height="25" rx="2" fill="none" stroke="black" strokeWidth="6" />
                  <rect x="16" y="16" width="13" height="13" fill="black" />
                  <rect x="65" y="10" width="25" height="25" rx="2" fill="none" stroke="black" strokeWidth="6" />
                  <rect x="71" y="16" width="13" height="13" fill="black" />
                  <rect x="10" y="65" width="25" height="25" rx="2" fill="none" stroke="black" strokeWidth="6" />
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
                <div className="mt-2 flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[11px] font-black text-black tracking-widest bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200">
                    TT-{(clientName || "CRIS").toUpperCase().slice(0, 4)}-7892
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 tracking-wider">CHECK-IN CODE</span>
                </div>
              </div>

              <div className="space-y-3 text-center sm:text-left max-w-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
                  <QrCode className="w-3.5 h-3.5" />
                  Pase de Check-in en Salón
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white tracking-tight">Presenta este código al pagar</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                    El barbero o cajero escaneará tu código para sumar automáticamente tus sellos de fidelización VIP.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">Nivel actual:</span>
                    <strong className="text-[#FFE082] font-black uppercase">{tier} ({sellosCiclo}/5 sellos)</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">Beneficio activo:</span>
                    <span className="text-emerald-400 font-semibold">{cortesFaltantes === 0 ? "¡Corte Gratis listo!" : `Faltan ${cortesFaltantes} corte(s)`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de Reverso y Botón Voltear */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3.5">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="tracking-wider">MEMBRESÍA AUTORIZADA</span>
              </div>
              <button
                type="button"
                onClick={toggleFlip}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Voltear al Frente</span>
                <RotateCw className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
