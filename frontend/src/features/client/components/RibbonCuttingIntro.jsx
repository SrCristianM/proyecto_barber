import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Sparkles, Scissors, FastForward } from "lucide-react";

/**
 * Síntesis de sonido metálico ultra-rápido de tijera de barbero usando Web Audio API.
 * 100% nativo, seguro y sin dependencias de audio externas.
 */
function playScissorSnipSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1. Sonido de fricción de hojas metálicas (White noise bandpass)
    const bufferSize = Math.floor(ctx.sampleRate * 0.065);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3600, ctx.currentTime);
    filter.Q.setValueAtTime(4.2, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    // 2. Clic metálico del tope de la tijera
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.04);

    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  } catch (e) {
    // Si la interacción de audio es bloqueada por el navegador, continúa de forma silenciosa
  }
}

export default function RibbonCuttingIntro({ onComplete, clientName = "Cliente" }) {
  const [isCut, setIsCut] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const hasFinishedRef = useRef(false);

  const finishAnimation = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    document.body.style.overflow = "";
    if (onComplete) onComplete();
  };

  useEffect(() => {
    // Bloquear scroll de la página durante la ceremonia
    document.body.style.overflow = "hidden";

    // 0.90s: Instante del corte perfectamente sincronizado con el cierre de las hojas
    const tSnip = setTimeout(() => {
      setIsCut(true);
      playScissorSnipSound();

      // Confeti acelerado por hardware a 120 FPS
      try {
        confetti({
          particleCount: 95,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF", "#C9A24A"],
          scalar: 1.2,
          ticks: 180,
          disableForReducedMotion: true,
          zIndex: 100005
        });
      } catch (e) {}
    }, 900);

    // 1.55s: Desvanecimiento ultra-fluido del telón
    const tFade = setTimeout(() => {
      setIsFading(true);
    }, 1550);

    // 1.95s: Finalización total y entrega de la vista normal
    const tEnd = setTimeout(() => {
      finishAnimation();
    }, 1950);

    return () => {
      clearTimeout(tSnip);
      clearTimeout(tFade);
      clearTimeout(tEnd);
      document.body.style.overflow = "";
    };
  }, []);

  const introContent = (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center bg-[#090807] select-none overflow-hidden transition-opacity duration-400 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        contain: "strict",
        transform: "translate3d(0,0,0)",
        willChange: "opacity"
      }}
    >
      {/* ========================================================================= */}
      {/* KEYFRAMES NATIVOS DEL COMPOSITOR DE LA GPU (+120 FPS OFF-MAIN-THREAD)     */}
      {/* ========================================================================= */}
      <style>{`
        /* Vuelo general de la tijera (2.8s) */
        @keyframes scissorFlight120 {
          0% {
            transform: translate3d(75vw, -35px, 0) rotate(-18deg) scale(1.05);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          46% {
            transform: translate3d(0vw, 0px, 0) rotate(-3deg) scale(1.25);
          }
          53% {
            transform: translate3d(-10px, 4px, 0) rotate(-6deg) scale(1.28);
          }
          65% {
            transform: translate3d(-24vw, 22px, 0) rotate(-14deg) scale(1.15);
            opacity: 1;
          }
          100% {
            transform: translate3d(-85vw, 65px, 0) rotate(-28deg) scale(0.9);
            opacity: 0;
          }
        }

        /* Movimiento de la hoja superior (abre suavemente y cierra con firmeza) */
        @keyframes topBladeMotion120 {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-6deg);
          }
          45% {
            transform: rotate(-28deg);
          }
          53% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        /* Movimiento de la hoja inferior (abre suavemente y cierra con firmeza) */
        @keyframes bottomBladeMotion120 {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(6deg);
          }
          45% {
            transform: rotate(26deg);
          }
          53% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        /* Mitad izquierda del listón cortado */
        @keyframes leftRibbonSever120 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          30% {
            transform: translate3d(-35%, -6px, 0) rotate(-4deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(-125%, -14px, 0) rotate(-12deg);
            opacity: 0;
          }
        }

        /* Mitad derecha del listón cortado */
        @keyframes rightRibbonSever120 {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          30% {
            transform: translate3d(35%, -6px, 0) rotate(4deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(125%, -14px, 0) rotate(12deg);
            opacity: 0;
          }
        }

        /* Medallón central al cortarse */
        @keyframes medallionBreak120 {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          35% {
            transform: scale(1.4) rotate(15deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(0) rotate(35deg);
            opacity: 0;
          }
        }

        /* Destello radial del corte */
        @keyframes cutFlashBlast120 {
          0% {
            transform: scale(0.2);
            opacity: 1;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }

        .anim-scissor-120 {
          animation: scissorFlight120 1.7s cubic-bezier(0.18, 0.9, 0.28, 1) forwards;
          will-change: transform, opacity;
          transform-origin: center;
        }

        .anim-blade-top-120 {
          animation: topBladeMotion120 1.7s cubic-bezier(0.18, 0.9, 0.28, 1) forwards;
          transform-origin: 105px 120px;
          will-change: transform;
        }

        .anim-blade-bottom-120 {
          animation: bottomBladeMotion120 1.7s cubic-bezier(0.18, 0.9, 0.28, 1) forwards;
          transform-origin: 105px 120px;
          will-change: transform;
        }

        .anim-ribbon-left-sever {
          animation: leftRibbonSever120 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        .anim-ribbon-right-sever {
          animation: rightRibbonSever120 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        .anim-medallion-break {
          animation: medallionBreak120 0.5s ease-out forwards;
          will-change: transform, opacity;
        }

        .anim-cut-flash {
          animation: cutFlashBlast120 0.45s ease-out forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Iluminación radial suave y ultra-ligera */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(223, 183, 85, 0.28) 0%, rgba(184, 43, 43, 0.1) 45%, transparent 70%)",
            transform: "translate3d(0,0,0)"
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.85)_90%)]" />
      </div>

      {/* Botón Saltar */}
      <button
        type="button"
        onClick={finishAnimation}
        className="absolute top-6 right-6 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 hover:text-white text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg active:scale-95"
      >
        <span>Saltar</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* TÍTULO SUPERIOR INAUGURAL */}
      <div
        className={`absolute top-14 sm:top-20 text-center z-10 px-4 transition-all duration-300 ${
          isCut ? "opacity-30 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB755]/15 border border-[#DFB755]/40 text-[#DFB755] text-[11px] font-black uppercase tracking-widest mb-2.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-[#DFB755]" />
          <span>Ceremonia Inaugural</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          ¡Bienvenido, <span className="text-[#DFB755]">{clientName}</span>!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
          Abriendo las puertas de tu experiencia prémium en Tu Turno Barber
        </p>
      </div>

      {/* ============================================================== */}
      {/* EL LISTÓN INAUGURAL DORADO & ROJO BORGOÑA (DIVIDIDO EN DOS)   */}
      {/* ============================================================== */}
      <div className="relative w-full h-24 flex items-center justify-center z-10">
        {/* MITAD IZQUIERDA DEL LISTÓN */}
        <div
          className={`absolute left-0 right-1/2 h-14 sm:h-16 origin-right flex items-center justify-end overflow-hidden shadow-2xl ${
            isCut ? "anim-ribbon-left-sever" : ""
          }`}
          style={{
            background:
              "linear-gradient(90deg, #7A1717 0%, #A82424 25%, #C9932B 70%, #DFB755 95%, #FFF0A8 100%)",
            borderTop: "2px solid rgba(255,255,255,0.4)",
            borderBottom: "2px solid rgba(0,0,0,0.5)",
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
          }}
        >
          {/* Costuras doradas bordadas */}
          <div className="absolute inset-x-0 top-1.5 h-[1px] border-b border-dashed border-[#FFF3BD]/80" />
          <div className="absolute inset-x-0 bottom-1.5 h-[1px] border-t border-dashed border-[#FFF3BD]/80" />

          {/* Texto en relieve en el listón */}
          <div className="pr-10 text-zinc-950 font-black tracking-widest text-[11px] sm:text-xs uppercase flex items-center gap-2.5 opacity-90 drop-shadow-xs">
            <span>★ TU TURNO BARBER</span>
            <span>•</span>
            <span className="hidden sm:inline">CORTE INAUGURAL</span>
          </div>
        </div>

        {/* MITAD DERECHA DEL LISTÓN */}
        <div
          className={`absolute left-1/2 right-0 h-14 sm:h-16 origin-left flex items-center justify-start overflow-hidden shadow-2xl ${
            isCut ? "anim-ribbon-right-sever" : ""
          }`}
          style={{
            background:
              "linear-gradient(90deg, #FFF0A8 0%, #DFB755 5%, #C9932B 30%, #A82424 75%, #7A1717 100%)",
            borderTop: "2px solid rgba(255,255,255,0.4)",
            borderBottom: "2px solid rgba(0,0,0,0.5)",
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
          }}
        >
          {/* Costuras doradas bordadas */}
          <div className="absolute inset-x-0 top-1.5 h-[1px] border-b border-dashed border-[#FFF3BD]/80" />
          <div className="absolute inset-x-0 bottom-1.5 h-[1px] border-t border-dashed border-[#FFF3BD]/80" />

          {/* Texto en relieve en el listón */}
          <div className="pl-10 text-zinc-950 font-black tracking-widest text-[11px] sm:text-xs uppercase flex items-center gap-2.5 opacity-90 drop-shadow-xs">
            <span>MEMBRESÍA VIP</span>
            <span>•</span>
            <span className="hidden sm:inline">CALIDAD PRÉMIUM ★</span>
          </div>
        </div>

        {/* SELLO MEDALLÓN DORADO CENTRAL */}
        <div
          className={`absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FFF4B8] via-[#DFB755] to-amber-700 border-2 border-white/80 shadow-[0_0_30px_rgba(223,183,85,0.7)] flex items-center justify-center p-1 text-zinc-950 font-black ${
            isCut ? "anim-medallion-break" : "animate-pulse"
          }`}
          style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
        >
          <div className="w-full h-full rounded-full border border-dashed border-amber-950/60 flex flex-col items-center justify-center text-center p-1 bg-gradient-to-b from-amber-400/30 to-transparent">
            <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 -rotate-45" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5 leading-none">
              VIP
            </span>
          </div>
        </div>

        {/* DESTELLO DE CORTE (FLASH DE IMPACTO NATIVO GPU) */}
        {isCut && (
          <div
            className="absolute z-30 w-36 h-36 rounded-full bg-gradient-to-r from-[#DFB755] via-white to-[#DFB755] blur-sm pointer-events-none anim-cut-flash"
            style={{ transform: "translate3d(0,0,0)" }}
          />
        )}

        {/* ============================================================== */}
        {/* TIJERA DORADA EJECUTADA EN EL COMPOSITOR DE LA GPU (+120 FPS)  */}
        {/* ============================================================== */}
        <div
          className="absolute z-30 pointer-events-none anim-scissor-120"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
          }}
        >
          {/* SVG ÚNICO VECTORIAL OPTIMIZADO PARA V-SYNC NATIVO */}
          <svg
            viewBox="0 0 240 240"
            className="w-52 h-52 sm:w-64 sm:h-64 overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
            style={{ shapeRendering: "geometricPrecision" }}
          >
            <defs>
              <linearGradient id="goldGradient120" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF7C2" />
                <stop offset="30%" stopColor="#E2BD5E" />
                <stop offset="70%" stopColor="#B58B24" />
                <stop offset="100%" stopColor="#694C0D" />
              </linearGradient>
              <linearGradient id="bladeGleam120" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#FFEAA7" />
                <stop offset="100%" stopColor="#C99826" />
              </linearGradient>
            </defs>

            {/* HOJA SUPERIOR (Giro articulado directo en GPU) */}
            <g className="anim-blade-top-120">
              <path
                d="M 105 120 L 22 108 Q 14 107 10 103 Q 14 100 28 98 L 105 112 Z"
                fill="url(#goldGradient120)"
                stroke="#473105"
                strokeWidth="1.2"
              />
              <path
                d="M 105 119 L 24 108 L 30 104 L 105 115 Z"
                fill="url(#bladeGleam120)"
                opacity="0.95"
              />
              <path
                d="M 105 120 Q 132 130 152 144 Q 168 158 184 158 Q 204 158 204 138 Q 204 118 184 118 Q 164 118 138 114 Z"
                fill="url(#goldGradient120)"
                stroke="#473105"
                strokeWidth="1.5"
              />
              <circle cx="184" cy="138" r="13.5" fill="#090807" stroke="#B58B24" strokeWidth="2.5" />
            </g>

            {/* HOJA INFERIOR (Giro articulado directo en GPU) */}
            <g className="anim-blade-bottom-120">
              <path
                d="M 105 120 L 22 132 Q 14 133 10 137 Q 14 140 28 142 L 105 128 Z"
                fill="url(#goldGradient120)"
                stroke="#473105"
                strokeWidth="1.2"
              />
              <path
                d="M 105 121 L 24 132 L 30 136 L 105 125 Z"
                fill="url(#bladeGleam120)"
                opacity="0.95"
              />
              <path
                d="M 105 120 Q 132 110 152 96 Q 168 82 184 82 Q 204 82 204 102 Q 204 122 184 122 Q 164 122 138 126 Z"
                fill="url(#goldGradient120)"
                stroke="#473105"
                strokeWidth="1.5"
              />
              <path
                d="M 194 82 Q 210 76 218 62 Q 212 60 200 70 Z"
                fill="url(#goldGradient120)"
                stroke="#473105"
                strokeWidth="1"
              />
              <circle cx="184" cy="102" r="13.5" fill="#090807" stroke="#B58B24" strokeWidth="2.5" />
            </g>

            {/* TORNILLO CENTRAL DE PIVOTE ENJOYADO */}
            <circle cx="105" cy="120" r="8.5" fill="url(#goldGradient120)" stroke="#3B2803" strokeWidth="1.5" />
            <circle cx="105" cy="120" r="4.5" fill="#991B1B" stroke="#DFB755" strokeWidth="1.2" />
            <circle cx="103" cy="118" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* INDICADOR INFERIOR DE ACCESO DECORATIVO */}
      <div
        className={`absolute bottom-10 text-center text-xs font-semibold text-zinc-400 tracking-wide flex items-center gap-2 transition-all duration-300 ${
          isCut ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
        }`}
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#DFB755] animate-ping" />
        <span>Acceso Concedido • Salón VIP Tu Turno Barber</span>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(introContent, document.body) : introContent;
}
