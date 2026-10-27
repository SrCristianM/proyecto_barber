import { memo, useState, useEffect } from "react";
import { useCelestialTime } from "./CelestialAtmosphereCanvas";

/**
 * Función auxiliar para distribuir partículas estratégicamente en los márgenes de la pantalla,
 * asegurando que nunca queden totalmente tapadas por las tarjetas centrales del dashboard.
 */
function generateMarginAwareParticles(count, seedMultiplier = 1) {
  return Array.from({ length: count }, (_, i) => {
    // 0: margen izquierdo (2% - 20%), 1: margen derecho (80% - 98%), 2: franja superior (3% - 22%), 3: franja inferior (78% - 96%)
    const zone = i % 4;
    let x, y;

    if (zone === 0) {
      x = (i * 13.7 * seedMultiplier) % 18 + 2; // Margen izquierdo
      y = (i * 19.3 * seedMultiplier) % 90 + 5;
    } else if (zone === 1) {
      x = 80 + ((i * 13.7 * seedMultiplier) % 18); // Margen derecho
      y = (i * 17.1 * seedMultiplier) % 90 + 5;
    } else if (zone === 2) {
      x = (i * 21.5 * seedMultiplier) % 92 + 4; // Margen superior
      y = (i * 7.3 * seedMultiplier) % 18 + 3;
    } else {
      x = (i * 23.1 * seedMultiplier) % 92 + 4; // Margen inferior
      y = 80 + ((i * 7.9 * seedMultiplier) % 16);
    }

    const sizeMultiplier = 1 + ((i % 4) * 0.35);
    const delay = (i * 0.35) % 5;
    const duration = 3.2 + ((i % 5) * 0.7);
    const variant = i % 3; // 0, 1, 2
    return { id: i, x, y, sizeMultiplier, delay, duration, variant };
  });
}

// 44 estrellas nocturnas distribuidas en márgenes y fondo
const AMBIENT_NIGHT_STARS = generateMarginAwareParticles(44, 1.1);

// 36 partículas de luz solar para la mañana
const MORNING_DUST_MOTES = generateMarginAwareParticles(36, 1.4);

// 36 destellos y motas solares doradas para la tarde
const AFTERNOON_SOLAR_MOTES = generateMarginAwareParticles(36, 1.7);

// 36 brasas crepusculares para el atardecer
const SUNSET_EMBERS = generateMarginAwareParticles(36, 2.1);

// 3 Aves matutinas minimalistas que surcan el horizonte en segundo plano
const MORNING_BIRDS = [
  { id: 1, top: "11%", delay: "0s", duration: "32s", scale: 0.85, flapSpeed: "0.75s" },
  { id: 2, top: "17%", delay: "1.4s", duration: "35s", scale: 0.7, flapSpeed: "0.65s" },
  { id: 3, top: "14%", delay: "2.8s", duration: "29s", scale: 0.95, flapSpeed: "0.85s" }
];

// 12 Destellos de acero pulido (tijeras/navajas) para la tarde en los márgenes
const BARBER_STEEL_FLARES = [
  { id: 1, left: "4%", top: "24%", size: 14, delay: "0.2s", duration: "4.2s", isGold: true },
  { id: 2, left: "93%", top: "30%", size: 16, delay: "1.4s", duration: "4.8s", isGold: false },
  { id: 3, left: "6%", top: "58%", size: 13, delay: "2.5s", duration: "3.9s", isGold: false },
  { id: 4, left: "91%", top: "70%", size: 15, delay: "0.8s", duration: "5.1s", isGold: true },
  { id: 5, left: "10%", top: "82%", size: 12, delay: "3.0s", duration: "4.3s", isGold: true },
  { id: 6, left: "87%", top: "16%", size: 17, delay: "1.9s", duration: "4.6s", isGold: false },
  { id: 7, left: "5%", top: "40%", size: 15, delay: "2.8s", duration: "4.9s", isGold: true },
  { id: 8, left: "94%", top: "52%", size: 13, delay: "0.5s", duration: "4.0s", isGold: false },
  { id: 9, left: "14%", top: "15%", size: 12, delay: "3.4s", duration: "4.6s", isGold: true },
  { id: 10, left: "89%", top: "84%", size: 14, delay: "2.1s", duration: "4.4s", isGold: false },
  { id: 11, left: "3%", top: "72%", size: 13, delay: "1.1s", duration: "4.7s", isGold: false },
  { id: 12, left: "95%", top: "42%", size: 15, delay: "2.3s", duration: "5.3s", isGold: true }
];

// 16 Luciérnagas / chispas doradas crepusculares en los márgenes
const SUNSET_FIREFLIES = [
  { id: 1, left: "5%", top: "28%", size: 4.5, delay: "0s", duration: "7.2s" },
  { id: 2, left: "92%", top: "35%", size: 5.2, delay: "1.5s", duration: "8.1s" },
  { id: 3, left: "7%", top: "62%", size: 4.0, delay: "2.8s", duration: "6.8s" },
  { id: 4, left: "89%", top: "68%", size: 4.8, delay: "0.9s", duration: "7.6s" },
  { id: 5, left: "12%", top: "80%", size: 5.5, delay: "3.2s", duration: "8.4s" },
  { id: 6, left: "86%", top: "22%", size: 4.2, delay: "2.1s", duration: "6.9s" },
  { id: 7, left: "4%", top: "46%", size: 5.0, delay: "1.2s", duration: "7.4s" },
  { id: 8, left: "94%", top: "82%", size: 4.6, delay: "2.9s", duration: "7.9s" },
  { id: 9, left: "16%", top: "18%", size: 4.2, delay: "0.4s", duration: "7.1s" },
  { id: 10, left: "88%", top: "50%", size: 5.4, delay: "3.5s", duration: "8.6s" },
  { id: 11, left: "8%", top: "90%", size: 4.8, delay: "1.8s", duration: "7.3s" },
  { id: 12, left: "92%", top: "12%", size: 5.0, delay: "2.4s", duration: "8.0s" },
  { id: 13, left: "3%", top: "34%", size: 4.4, delay: "0.7s", duration: "6.7s" },
  { id: 14, left: "96%", top: "64%", size: 4.9, delay: "1.6s", duration: "7.7s" },
  { id: 15, left: "11%", top: "52%", size: 5.2, delay: "2.7s", duration: "8.2s" },
  { id: 16, left: "85%", top: "76%", size: 4.3, delay: "3.1s", duration: "7.0s" }
];

/**
 * Componente AmbientCelestialBackground
 * 
 * - Activo, dinámico y con objetos/animaciones atmosféricas en TODAS las fases del día:
 *   1. Mañana: Haces volumétricos (God Rays) + Aves matutinas en vuelo + Brisa de polvo solar + Nubes de alba.
 *   2. Tarde: Anillos concéntricos de destello solar + Destellos de acero pulido (✦) + Filamentos de brisa cálida + Nubes doradas.
 *   3. Atardecer: Haces rasantes de hora dorada + Luciérnagas crepusculares + Nubes de arrebol + Brasas flotantes.
 *   4. Noche: Nubes cósmicas + Niebla nocturna + Firmamento estelar + Estrella fugaz.
 */
function AmbientCelestialBackgroundComponent({ isDark }) {
  const { phase } = useCelestialTime();

  // Detección reactiva de modo oscuro: si viene por prop no se monta MutationObserver
  const [domIsDark, setDomIsDark] = useState(() => {
    if (typeof isDark === "boolean") return isDark;
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (typeof isDark === "boolean") return; // Prop disponible: cero observadores ni re-renderings

    const checkDark = () => {
      if (typeof document === "undefined") return;
      const hasDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      setDomIsDark(hasDark);
    };

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [isDark]);

  const activeIsDark = typeof isDark === "boolean" ? isDark : domIsDark;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
      style={{
        isolation: "isolate",
        contain: "strict",
        transform: "translate3d(0, 0, 0)"
      }}
    >
      {/* =========================================================================
          1. FASE: TARDE SOLEADA (12:00 A 16:59)
          - Anillos de corona solar concéntricos
          - Destellos de acero pulido de tijeras/navajas (✦)
          - Remolinos de brisa cálida
          - Nubes cúmulos doradas + niebla solar + motas
          ========================================================================= */}
      {phase === "afternoon" && (
        <div className="absolute inset-0">
          {/* A. Resplandor solar de cénit superior derecho */}
          <div
            className="absolute -top-20 -right-20 w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(221, 174, 65, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.32) 0%, rgba(245, 158, 11, 0.18) 40%, transparent 75%)",
              animation: "ambientGlowPulse 10s ease-in-out infinite",
              willChange: "opacity"
            }}
          />

          {/* B. ANILLOS CONCÉNTRICOS DE DESTELLO SOLAR (SOLAR CORONA PULSE) */}
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              border: activeIsDark ? "1.5px solid rgba(223, 183, 85, 0.28)" : "2px solid rgba(217, 119, 6, 0.26)",
              boxShadow: activeIsDark ? "0 0 25px rgba(223, 183, 85, 0.18)" : "0 0 25px rgba(217, 119, 6, 0.2)",
              animation: "ambientCoronaPulse 12s ease-in-out infinite",
              willChange: "transform, opacity"
            }}
          />
          <div
            className="absolute -top-48 -right-48 w-[880px] h-[880px] rounded-full pointer-events-none"
            style={{
              border: activeIsDark ? "1px solid rgba(245, 158, 11, 0.18)" : "1.5px solid rgba(245, 158, 11, 0.22)",
              boxShadow: activeIsDark ? "0 0 35px rgba(245, 158, 11, 0.12)" : "0 0 35px rgba(245, 158, 11, 0.15)",
              animation: "ambientCoronaPulse 12s ease-in-out 3s infinite",
              willChange: "transform, opacity"
            }}
          />

          {/* C. NUBES CÚMULOS DORADAS FLOTANTES */}
          {/* Nube 1: Superior Izquierda */}
          <div
            className="absolute -top-24 -left-20 w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.20) 0%, rgba(180, 83, 9, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.30) 0%, rgba(251, 191, 36, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift1 48s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 2: Media Derecha */}
          <div
            className="absolute top-[20%] right-[-100px] w-[900px] h-[900px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(180, 83, 9, 0.18) 0%, rgba(120, 53, 15, 0.07) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.28) 0%, rgba(253, 230, 138, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift2 56s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 3: Inferior Izquierda */}
          <div
            className="absolute bottom-[-100px] left-[-80px] w-[880px] h-[880px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.07) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.26) 0%, rgba(254, 215, 170, 0.15) 40%, transparent 75%)",
              animation: "ambientCloudDrift3 42s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* D. REMOLINOS DE BRISA CÁLIDA (THERMAL WIND WISPS) */}
          <div
            className="absolute top-[38%] left-0 w-[45vw] h-[3px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "linear-gradient(90deg, transparent, rgba(223, 183, 85, 0.3) 45%, rgba(245, 158, 11, 0.15) 75%, transparent)"
                : "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.4) 45%, rgba(245, 158, 11, 0.2) 75%, transparent)",
              boxShadow: activeIsDark ? "0 0 10px rgba(223, 183, 85, 0.25)" : "0 0 10px rgba(217, 119, 6, 0.3)",
              animation: "ambientWindWisp 22s linear infinite",
              willChange: "transform, opacity"
            }}
          />
          <div
            className="absolute top-[68%] left-0 w-[55vw] h-[2.5px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.25) 45%, rgba(251, 191, 36, 0.12) 75%, transparent)"
                : "linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.35) 45%, rgba(251, 191, 36, 0.18) 75%, transparent)",
              boxShadow: activeIsDark ? "0 0 8px rgba(245, 158, 11, 0.2)" : "0 0 8px rgba(234, 88, 12, 0.25)",
              animation: "ambientWindWisp 24s linear 11s infinite",
              willChange: "transform, opacity"
            }}
          />

          {/* E. Bruma / Niebla solar fluida */}
          <div
            className="absolute top-[30%] -left-[5vw] w-[110vw] h-[550px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(221, 174, 65, 0.12) 0%, rgba(245, 158, 11, 0.05) 35%, transparent 75%)"
                : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(217, 119, 6, 0.22) 0%, rgba(251, 191, 36, 0.12) 35%, transparent 75%)",
              animation: "ambientMistFlow 26s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* F. DESTELLOS DE ACERO PULIDO (BARBER STEEL FLARES - ✦) */}
          <div className="absolute inset-0 pointer-events-none">
            {BARBER_STEEL_FLARES.map((flare) => {
              const color = activeIsDark
                ? flare.isGold ? "#FFE082" : "#FFFFFF"
                : flare.isGold ? "#D97706" : "#2563EB";

              return (
                <div
                  key={flare.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: flare.left,
                    top: flare.top,
                    width: `${flare.size}px`,
                    height: `${flare.size}px`,
                    color,
                    filter: `drop-shadow(0 0 4px ${color})`,
                    animation: `ambientDiamondSparkle ${flare.duration} ease-in-out ${flare.delay} infinite`,
                    willChange: "transform, opacity"
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M 12 0 Q 12 12 0 12 Q 12 12 12 24 Q 12 12 24 12 Q 12 12 12 0 Z" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* G. Campo de 36 destellos solares y motas doradas vivas en los márgenes */}
          <div className="absolute inset-0 pointer-events-none">
            {AFTERNOON_SOLAR_MOTES.map((mote) => {
              const size = activeIsDark ? 2.0 * mote.sizeMultiplier : 3.0 * mote.sizeMultiplier;
              const color = activeIsDark
                ? mote.variant === 0 ? "#FFE082" : mote.variant === 1 ? "#F59E0B" : "#FDE68A"
                : mote.variant === 0 ? "#D97706" : mote.variant === 1 ? "#B45309" : "#EA580C";

              const glow = activeIsDark
                ? `0 0 5px ${color}`
                : `0 0 7px ${color}`;

              return (
                <div
                  key={mote.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${mote.x}%`,
                    top: `${mote.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: glow,
                    animation: `ambientStarTwinkle ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
                    willChange: "transform, opacity"
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          2. FASE: MAÑANA / AMANECER (05:00 A 11:59)
          - Haces de luz solar volumétricos (God Rays)
          - Siluetas de aves matutinas en vuelo lejano
          - Brisa de rocío y polvo solar ascendente
          - Nubes de alba dorada + niebla
          ========================================================================= */}
      {phase === "morning" && (
        <div className="absolute inset-0">
          {/* A. Halo matutino superior */}
          <div
            className="absolute -top-20 -left-[5vw] w-[110vw] h-[650px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(245, 158, 11, 0.22) 0%, rgba(223, 183, 85, 0.09) 40%, transparent 75%)"
                : "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(245, 158, 11, 0.32) 0%, rgba(251, 191, 36, 0.18) 40%, transparent 75%)",
              animation: "ambientGlowPulse 9s ease-in-out infinite",
              willChange: "opacity"
            }}
          />

          {/* B. HACES DE LUZ VOLUMÉTRICOS MATUTINOS (GOD RAYS) */}
          <div
            className="absolute -top-32 -left-20 w-[600px] h-[950px] pointer-events-none origin-top-left"
            style={{
              background: activeIsDark
                ? "linear-gradient(125deg, rgba(223, 183, 85, 0.24) 0%, rgba(245, 158, 11, 0.12) 35%, transparent 75%)"
                : "linear-gradient(125deg, rgba(245, 158, 11, 0.32) 0%, rgba(251, 191, 36, 0.16) 40%, transparent 75%)",
              filter: "blur(28px)",
              animation: "ambientSunbeamSway 14s ease-in-out infinite",
              willChange: "transform, opacity"
            }}
          />
          <div
            className="absolute -top-20 left-[15vw] w-[450px] h-[850px] pointer-events-none origin-top-left"
            style={{
              background: activeIsDark
                ? "linear-gradient(130deg, rgba(245, 158, 11, 0.18) 0%, rgba(251, 191, 36, 0.08) 35%, transparent 70%)"
                : "linear-gradient(130deg, rgba(251, 191, 36, 0.26) 0%, rgba(254, 215, 170, 0.12) 35%, transparent 70%)",
              filter: "blur(24px)",
              animation: "ambientSunbeamSway 16s ease-in-out 3s infinite reverse",
              willChange: "transform, opacity"
            }}
          />

          {/* C. SILUETAS DE AVES MATUTINAS EN VUELO LEJANO */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {MORNING_BIRDS.map((bird) => {
              const birdColor = activeIsDark ? "rgba(223, 183, 85, 0.65)" : "rgba(71, 85, 105, 0.6)";
              return (
                <div
                  key={bird.id}
                  className="absolute pointer-events-none"
                  style={{
                    top: bird.top,
                    left: 0,
                    color: birdColor,
                    animation: `ambientBirdsFlight ${bird.duration} linear ${bird.delay} infinite`,
                    willChange: "transform, opacity"
                  }}
                >
                  <div style={{ transform: `scale(${bird.scale})` }}>
                    <svg
                      viewBox="0 0 24 10"
                      className="w-6 h-3 fill-current"
                      style={{ animation: `ambientBirdWingFlap ${bird.flapSpeed} ease-in-out infinite` }}
                    >
                      <path d="M 1 7 Q 6 1 12 7 Q 18 1 23 7 Q 12 11 1 7 Z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* D. NUBES MATUTINAS FLOTANTES */}
          {/* Nube 1: Superior Izquierda */}
          <div
            className="absolute -top-24 -left-20 w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.20) 0%, rgba(217, 119, 6, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.30) 0%, rgba(253, 230, 138, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift1 48s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 2: Media Derecha */}
          <div
            className="absolute top-[20%] right-[-100px] w-[900px] h-[900px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.18) 0%, rgba(180, 83, 9, 0.07) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.28) 0%, rgba(254, 215, 170, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift2 56s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 3: Inferior Izquierda */}
          <div
            className="absolute bottom-[-100px] left-[-80px] w-[880px] h-[880px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.07) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(253, 230, 138, 0.30) 0%, rgba(254, 215, 170, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift3 42s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* E. Bruma matutina inferior en flujo */}
          <div
            className="absolute -bottom-24 -left-[5vw] w-[110vw] h-[550px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59, 30, 40, 0.20) 0%, rgba(245, 158, 11, 0.06) 35%, transparent 75%)"
                : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(253, 230, 138, 0.30) 0%, rgba(254, 215, 170, 0.16) 35%, transparent 75%)",
              animation: "ambientMistFlow 22s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* F. Campo de 36 partículas de polvo solar matutino ascendente */}
          <div className="absolute inset-0 pointer-events-none">
            {MORNING_DUST_MOTES.map((mote) => {
              const size = activeIsDark ? 2.2 * mote.sizeMultiplier : 3.2 * mote.sizeMultiplier;
              const color = activeIsDark ? "#FFE082" : "#D97706";
              return (
                <div
                  key={mote.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${mote.x}%`,
                    top: `${mote.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: activeIsDark
                      ? "0 0 5px #DFB755"
                      : "0 0 7px rgba(217, 119, 6, 0.6)",
                    animation: `ambientParticleFloat ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
                    willChange: "transform, opacity"
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. FASE: ATARDECER / HORA DORADA (17:00 A 18:59)
          - Haces rasantes de hora dorada (Sunset Twilight Beams)
          - Luciérnagas / Chispas doradas crepusculares en vuelo
          - Nubes de arrebol coral y magenta
          - Brasas crepusculares flotantes
          ========================================================================= */}
      {phase === "sunset" && (
        <div className="absolute inset-0">
          {/* A. Resplandor crepuscular superior */}
          <div
            className="absolute -top-20 -left-[5vw] w-[110vw] h-[600px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(192, 38, 211, 0.20) 0%, rgba(147, 51, 234, 0.08) 40%, transparent 75%)"
                : "radial-gradient(ellipse 60% 45% at 50% 40%, rgba(192, 38, 211, 0.30) 0%, rgba(147, 51, 234, 0.16) 40%, transparent 75%)",
              animation: "ambientGlowPulse 10s ease-in-out infinite",
              willChange: "opacity"
            }}
          />

          {/* B. HACES RASANTES DE HORA DORADA (SUNSET TWILIGHT BEAMS) */}
          <div
            className="absolute top-[52%] left-0 w-full h-[180px] pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(249, 115, 22, 0.16) 0%, rgba(225, 29, 72, 0.08) 50%, transparent 75%)"
                : "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(249, 115, 22, 0.26) 0%, rgba(244, 63, 94, 0.15) 50%, transparent 75%)",
              animation: "ambientTwilightBeam 16s ease-in-out infinite",
              willChange: "transform, opacity"
            }}
          />
          <div
            className="absolute top-[70%] left-0 w-full h-[160px] pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 65% 45% at 55% 50%, rgba(223, 183, 85, 0.14) 0%, rgba(249, 115, 22, 0.07) 50%, transparent 75%)"
                : "radial-gradient(ellipse 65% 45% at 55% 50%, rgba(245, 158, 11, 0.24) 0%, rgba(234, 88, 12, 0.12) 50%, transparent 75%)",
              animation: "ambientTwilightBeam 18s ease-in-out 4s infinite reverse",
              willChange: "transform, opacity"
            }}
          />

          {/* C. NUBES DE ARREBOL CORAL Y VIOLETA */}
          {/* Nube 1: Superior Izquierda */}
          <div
            className="absolute -top-24 -left-20 w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(192, 38, 211, 0.20) 0%, rgba(147, 51, 234, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(192, 38, 211, 0.28) 0%, rgba(244, 63, 94, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift1 48s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 2: Media Derecha */}
          <div
            className="absolute top-[20%] right-[-100px] w-[900px] h-[900px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.22) 0%, rgba(223, 183, 85, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.30) 0%, rgba(251, 146, 60, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift2 56s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 3: Inferior Izquierda */}
          <div
            className="absolute bottom-[-100px] left-[-80px] w-[880px] h-[880px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.20) 0%, rgba(190, 18, 60, 0.07) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.26) 0%, rgba(251, 146, 60, 0.15) 40%, transparent 75%)",
              animation: "ambientCloudDrift3 42s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* D. Resplandor inferior cálido terracota / naranja */}
          <div
            className="absolute -bottom-20 -left-[5vw] w-[110vw] h-[600px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(249, 115, 22, 0.24) 0%, rgba(223, 183, 85, 0.09) 40%, transparent 75%)"
                : "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(249, 115, 22, 0.34) 0%, rgba(244, 63, 94, 0.18) 40%, transparent 75%)",
              animation: "ambientGlowPulse 8s ease-in-out infinite reverse",
              willChange: "opacity"
            }}
          />

          {/* E. LUCIÉRNAGAS CREPUSCULARES EN VUELO ERRÁTICO SUAVE */}
          <div className="absolute inset-0 pointer-events-none">
            {SUNSET_FIREFLIES.map((fly) => {
              const color = activeIsDark ? "#FBBF24" : "#EA580C";
              return (
                <div
                  key={fly.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: fly.left,
                    top: fly.top,
                    width: `${fly.size}px`,
                    height: `${fly.size}px`,
                    backgroundColor: color,
                    boxShadow: activeIsDark
                      ? "0 0 8px rgba(251, 191, 36, 0.9), 0 0 16px rgba(245, 158, 11, 0.5)"
                      : "0 0 8px rgba(234, 88, 12, 0.8), 0 0 14px rgba(249, 115, 22, 0.4)",
                    animation: `ambientFireflyGaze ${fly.duration} ease-in-out ${fly.delay} infinite`,
                    willChange: "transform, opacity"
                  }}
                />
              );
            })}
          </div>

          {/* F. Campo de 36 brasas crepusculares vivas */}
          <div className="absolute inset-0 pointer-events-none">
            {SUNSET_EMBERS.map((ember) => {
              const size = activeIsDark ? 2.5 * ember.sizeMultiplier : 3.5 * ember.sizeMultiplier;
              const color = ember.variant === 0
                ? activeIsDark ? "#FB7185" : "#E11D48"
                : activeIsDark ? "#F97316" : "#EA580C";

              return (
                <div
                  key={ember.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${ember.x}%`,
                    top: `${ember.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: activeIsDark
                      ? `0 0 5px ${color}`
                      : `0 0 7px ${color}`,
                    animation: `ambientEmberDrift ${ember.duration}s ease-out ${ember.delay}s infinite`,
                    willChange: "transform, opacity"
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. FASE: NOCHE ESTELAR (19:00 A 04:59)
          - Resplandor lunar
          - Nubes cósmicas índigo y violeta
          - Niebla nocturna
          - 44 estrellas titilantes + estrella fugaz
          ========================================================================= */}
      {phase === "night" && (
        <div className="absolute inset-0">
          {/* Resplandor lunar suave en la esquina superior */}
          <div
            className="absolute -top-20 -right-20 w-[780px] h-[780px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.22) 0%, rgba(67, 56, 202, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.32) 0%, rgba(147, 197, 253, 0.18) 40%, transparent 75%)",
              animation: "ambientGlowPulse 10s ease-in-out infinite",
              willChange: "opacity"
            }}
          />

          {/* Nube 1: Superior Izquierda (Lavender Indigo) */}
          <div
            className="absolute -top-24 -left-20 w-[850px] h-[850px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(67, 56, 202, 0.22) 0%, rgba(49, 46, 129, 0.09) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.30) 0%, rgba(165, 180, 252, 0.16) 40%, transparent 75%)",
              animation: "ambientCloudDrift1 48s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 2: Media Derecha (Violet Amethyst) */}
          <div
            className="absolute top-[20%] right-[-100px] w-[900px] h-[900px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.20) 0%, rgba(49, 46, 129, 0.08) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.28) 0%, rgba(196, 181, 253, 0.15) 40%, transparent 75%)",
              animation: "ambientCloudDrift2 56s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Nube 3: Inferior Izquierda (Deep Midnight Azure) */}
          <div
            className="absolute bottom-[-100px] left-[-80px] w-[880px] h-[880px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(circle at 50% 50%, rgba(30, 27, 75, 0.26) 0%, rgba(15, 23, 42, 0.09) 40%, transparent 75%)"
                : "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.26) 0%, rgba(147, 197, 253, 0.15) 40%, transparent 75%)",
              animation: "ambientCloudDrift3 42s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Niebla nocturna fluida */}
          <div
            className="absolute top-[32%] -left-[5vw] w-[110vw] h-[550px] rounded-full pointer-events-none"
            style={{
              background: activeIsDark
                ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99, 102, 241, 0.14) 0%, rgba(148, 163, 184, 0.05) 35%, transparent 75%)"
                : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99, 102, 241, 0.24) 0%, rgba(165, 180, 252, 0.12) 35%, transparent 75%)",
              animation: "ambientMistFlow 26s ease-in-out infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)"
            }}
          />

          {/* Campo de 44 estrellas titilantes en los márgenes y fondo */}
          <div className="absolute inset-0 pointer-events-none">
            {AMBIENT_NIGHT_STARS.map((star) => {
              const starSize = activeIsDark ? 1.8 * star.sizeMultiplier : 2.8 * star.sizeMultiplier;
              const starColor = activeIsDark
                ? star.variant === 0 ? "#FFE082" : star.variant === 1 ? "#BAE6FD" : "#FFFFFF"
                : star.variant === 0 ? "#D97706" : star.variant === 1 ? "#2563EB" : "#7C3AED";

              const starGlow = activeIsDark
                ? `0 0 5px ${starColor}`
                : `0 0 7px ${starColor}`;

              return (
                <div
                  key={star.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${starSize}px`,
                    height: `${starSize}px`,
                    backgroundColor: starColor,
                    boxShadow: starGlow,
                    animation: `ambientStarTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                    willChange: "transform, opacity"
                  }}
                />
              );
            })}
          </div>

          {/* Estrella fugaz ocasional */}
          <div
            className="absolute top-16 right-24 w-[180px] h-[2.5px] pointer-events-none opacity-0"
            style={{
              background: activeIsDark
                ? "linear-gradient(90deg, #DFB755, rgba(255, 255, 255, 0.9), transparent)"
                : "linear-gradient(90deg, #D97706, #2563EB 60%, transparent)",
              boxShadow: activeIsDark
                ? "0 0 8px rgba(223, 183, 85, 0.6)"
                : "0 0 10px rgba(217, 119, 6, 0.65)",
              animation: "ambientShootingStarPass 14s cubic-bezier(0.25, 0.1, 0.25, 1) infinite",
              willChange: "transform, opacity",
              transform: "translate3d(0, 0, 0)"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(AmbientCelestialBackgroundComponent);
