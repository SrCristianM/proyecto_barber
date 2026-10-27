import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Sunrise,
  Sunset
} from "lucide-react";
import { playHoloShimmerSound } from "../../utils/barberAudioEffects";

/**
 * Hook para calcular la fase celeste del día según la hora local
 */
export function useCelestialTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Actualizar cada 60 segundos para mantener sincronizada la fase
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const info = useMemo(() => {
    const hour = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeFormatted = `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;

    // 1. Mañana / Amanecer (05:00 a 11:59)
    if (hour >= 5 && hour < 12) {
      return {
        phase: "morning",
        saludo: "¡Buenos días",
        emoji: "🌅",
        periodName: "Jornada Matutina",
        clientMessage: "Empieza tu jornada con un corte impecable y la mejor atención de nuestro equipo de barberos profesionales.",
        barberMessage: "Prepara tus herramientas y tu estación para una jornada productiva y llena de estilo en Tu Turno Barber.",
        bgClass: "from-[#140F1D] via-[#241728] to-[#3B1E28]",
        radialGradient: "radial-gradient(circle at 85% 25%, rgba(245, 158, 11, 0.42) 0%, rgba(223, 183, 85, 0.22) 50%, transparent 70%)",
        accentColor: "#DFB755",
        timeFormatted,
        isNight: false
      };
    }

    // 2. Tarde Soleada (12:00 a 16:59)
    if (hour >= 12 && hour < 17) {
      return {
        phase: "afternoon",
        saludo: "¡Buenas tardes",
        emoji: "☀️",
        periodName: "Turno Tarde",
        clientMessage: "Es el momento perfecto para renovar tu estilo, perfilar tu barba y recargar energías en Tu Turno Barber.",
        barberMessage: "Continúa brindando la mejor experiencia y precisión en cada corte y perfilado a tus clientes.",
        bgClass: "from-[#14121A] via-[#241A12] to-[#3B280E]",
        radialGradient: "radial-gradient(circle at 85% 25%, rgba(221, 174, 65, 0.45) 0%, rgba(245, 158, 11, 0.22) 50%, transparent 70%)",
        accentColor: "#E5B94E",
        timeFormatted,
        isNight: false
      };
    }

    // 3. Hora Dorada / Atardecer (17:00 a 18:59)
    if (hour >= 17 && hour < 19) {
      return {
        phase: "sunset",
        saludo: "¡Buen atardecer",
        emoji: "🌇",
        periodName: "Hora Dorada",
        clientMessage: "La hora dorada ha llegado. Regálate un tiempo de cuidado personal y estilo antes de culminar tu día.",
        barberMessage: "La hora pico de mayor afluencia. Mantén el ritmo con tu técnica impecable en cada servicio.",
        bgClass: "from-[#140C1E] via-[#261022] to-[#3D1418]",
        radialGradient: "radial-gradient(circle at 85% 25%, rgba(249, 115, 22, 0.48) 0%, rgba(223, 183, 85, 0.22) 45%, transparent 70%)",
        accentColor: "#F97316",
        timeFormatted,
        isNight: false
      };
    }

    // 4. Noche Estelar (19:00 a 04:59)
    return {
      phase: "night",
      saludo: "¡Buenas noches",
      emoji: "🌙",
      periodName: "Turno Nocturno",
      clientMessage: "Relájate y asegura tu turno con tu barbero de confianza para lucir impecable esta semana.",
      barberMessage: "Cierra tu jornada con broche de oro, revisa tus atenciones y deja todo listo para el siguiente turno.",
      bgClass: "from-[#080B14] via-[#0F172A] to-[#1E1B4B]",
      radialGradient: "radial-gradient(circle at 85% 25%, rgba(99, 102, 241, 0.4) 0%, rgba(223, 183, 85, 0.2) 45%, transparent 70%)",
      accentColor: "#DFB755",
      timeFormatted,
      isNight: true
    };
  }, [now]);

  return info;
}

/**
 * Componente para el Emoji animado del saludo según la fase del día (Mañana, Tarde, Atardecer, Noche)
 * Proporciona movimiento fluido característico a cada icono del día
 */
export function CelestialTimeEmoji({ phase, emoji, className = "" }) {
  const animation = useMemo(() => {
    switch (phase) {
      case "morning":
        // Amanecer: flotación vertical suave, balanceo de calidez y pulso
        return {
          animate: {
            y: [2, -5, 2],
            rotate: [-4, 4, -4],
            scale: [1, 1.12, 1]
          },
          transition: {
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "afternoon":
        // Tarde soleada: rotación solar y pulsación de rayos dorados
        return {
          animate: {
            rotate: [0, 18, -14, 0],
            scale: [1, 1.18, 1]
          },
          transition: {
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "sunset":
        // Atardecer: movimiento suave hacia el horizonte con vaivén crepuscular
        return {
          animate: {
            y: [-3, 3, -3],
            rotate: [-7, 7, -7],
            scale: [1.06, 0.94, 1.06]
          },
          transition: {
            duration: 3.6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case "night":
      default:
        // Noche: balanceo de cuna lunar (rocking) y levitación cósmica
        return {
          animate: {
            rotate: [-16, 16, -16],
            y: [-4, 4, -4],
            scale: [1, 1.14, 1]
          },
          transition: {
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
    }
  }, [phase]);

  return (
    <motion.span
      className={`inline-block select-none cursor-default filter drop-shadow-[0_2px_8px_rgba(223,183,85,0.45)] ${className}`}
      {...animation}
    >
      {emoji}
    </motion.span>
  );
}

/**
 * Constantes estáticas para 120 FPS sin regeneración ni cálculo en JS
 */
const BURST_PARTICLES = [
  { id: 1, x: 0, y: -72, rot: 0, sym: "✦" },
  { id: 2, x: 38, y: -60, rot: 30, sym: "✨" },
  { id: 3, x: 65, y: -38, rot: 60, sym: "☀️" },
  { id: 4, x: 72, y: 0, rot: 90, sym: "✦" },
  { id: 5, x: 65, y: 38, rot: 120, sym: "✧" },
  { id: 6, x: 38, y: 60, rot: 150, sym: "✂️" },
  { id: 7, x: 0, y: 72, rot: 180, sym: "✦" },
  { id: 8, x: -38, y: 60, rot: 210, sym: "⚡" },
  { id: 9, x: -65, y: 38, rot: 240, sym: "✨" },
  { id: 10, x: -72, y: 0, rot: 270, sym: "✦" },
  { id: 11, x: -65, y: -38, rot: 300, sym: "✧" },
  { id: 12, x: -38, y: -60, rot: 330, sym: "☀️" }
];

const NIGHT_STARS = [
  { top: "14%", left: "16%", size: 2.2, delay: 0.1, duration: 2.2 },
  { top: "28%", left: "26%", size: 3.2, delay: 0.7, duration: 2.9 },
  { top: "12%", left: "36%", size: 2.0, delay: 1.2, duration: 2.4 },
  { top: "45%", left: "20%", size: 2.8, delay: 0.4, duration: 3.1 },
  { top: "22%", left: "46%", size: 2.4, delay: 1.6, duration: 2.7 },
  { top: "62%", left: "32%", size: 1.8, delay: 0.8, duration: 2.5 },
  { top: "18%", left: "54%", size: 3.0, delay: 0.3, duration: 3.2 },
  { top: "72%", left: "44%", size: 2.5, delay: 1.1, duration: 2.8 },
  { top: "68%", left: "62%", size: 2.8, delay: 1.4, duration: 3.0 },
  { top: "82%", left: "70%", size: 2.2, delay: 0.9, duration: 2.4 },
  { top: "75%", left: "82%", size: 2.0, delay: 0.5, duration: 2.6 }
];

// 18 partículas de polvo solar dorado matutino/vespertino flotando suavemente en la corriente térmica
const DAY_GOLDEN_MOTES = [
  { left: "42%", bottom: "16%", size: 3.0, duration: 6.2, delay: 0.2 },
  { left: "48%", bottom: "28%", size: 4.0, duration: 5.5, delay: 1.8 },
  { left: "55%", bottom: "12%", size: 2.5, duration: 6.8, delay: 0.8 },
  { left: "62%", bottom: "24%", size: 4.5, duration: 5.2, delay: 2.4 },
  { left: "68%", bottom: "14%", size: 3.2, duration: 6.0, delay: 0.0 },
  { left: "74%", bottom: "35%", size: 2.8, duration: 7.0, delay: 1.5 },
  { left: "79%", bottom: "18%", size: 4.2, duration: 5.8, delay: 2.9 },
  { left: "84%", bottom: "26%", size: 3.5, duration: 6.5, delay: 0.5 },
  { left: "88%", bottom: "15%", size: 5.0, duration: 4.8, delay: 1.1 },
  { left: "93%", bottom: "32%", size: 3.0, duration: 6.0, delay: 2.2 },
  { left: "52%", bottom: "45%", size: 2.4, duration: 7.2, delay: 3.1 },
  { left: "59%", bottom: "58%", size: 3.6, duration: 5.9, delay: 1.6 },
  { left: "66%", bottom: "48%", size: 4.0, duration: 6.4, delay: 0.4 },
  { left: "72%", bottom: "62%", size: 3.2, duration: 5.4, delay: 2.7 },
  { left: "77%", bottom: "52%", size: 4.8, duration: 6.1, delay: 1.9 },
  { left: "83%", bottom: "66%", size: 2.6, duration: 6.7, delay: 0.9 },
  { left: "89%", bottom: "54%", size: 3.8, duration: 5.3, delay: 3.3 },
  { left: "95%", bottom: "42%", size: 3.4, duration: 6.3, delay: 2.1 }
];

// 8 Destellos de Acero Pulido / Diamantes de Corte (Barber Steel Glints ✦)
const DAY_STEEL_FLARES = [
  { left: "46%", top: "28%", size: 13, delay: 0.4, duration: 4.2 },
  { left: "58%", top: "22%", size: 16, delay: 1.8, duration: 4.8 },
  { left: "67%", top: "34%", size: 12, delay: 2.9, duration: 3.9 },
  { left: "75%", top: "18%", size: 18, delay: 1.1, duration: 5.2 },
  { left: "82%", top: "38%", size: 14, delay: 2.4, duration: 4.5 },
  { left: "86%", top: "12%", size: 16, delay: 0.7, duration: 4.1 },
  { left: "92%", top: "25%", size: 15, delay: 3.2, duration: 4.7 },
  { left: "63%", top: "48%", size: 12, delay: 1.5, duration: 5.0 }
];

// Destellos de lente óptico a lo largo del eje del sol
const DAY_LENS_FLARES = [
  { left: "77%", top: "36%", size: "w-7 h-7 sm:w-9 sm:h-9", delay: "0s", duration: "5.5s", type: "ring" },
  { left: "65%", top: "54%", size: "w-10 h-10 sm:w-14 sm:h-14", delay: "1.2s", duration: "6.2s", type: "disc" },
  { left: "54%", top: "70%", size: "w-4 h-4 sm:w-6 sm:h-6", delay: "2.4s", duration: "4.8s", type: "dot" }
];

const NIGHT_METEORS = [
  {
    id: "meteor-a",
    top: "5%",
    left: "8%",
    angle: 31,
    animName: "celMeteorGlideA 9.5s cubic-bezier(0.22, 1, 0.36, 1) infinite 1s",
    tailWidth: 125,
    headSize: 4.5
  },
  {
    id: "meteor-b",
    top: "14%",
    left: "34%",
    angle: 33,
    animName: "celMeteorGlideB 12s cubic-bezier(0.22, 1, 0.36, 1) infinite 4.5s",
    tailWidth: 110,
    headSize: 4.0
  },
  {
    id: "meteor-c",
    top: "6%",
    left: "58%",
    angle: 29,
    animName: "celMeteorGlideC 14s cubic-bezier(0.22, 1, 0.36, 1) infinite 8s",
    tailWidth: 135,
    headSize: 5.0
  },
  {
    id: "meteor-d",
    top: "16%",
    left: "72%",
    angle: 32,
    animName: "celMeteorGlideD 11s cubic-bezier(0.22, 1, 0.36, 1) infinite 2.5s",
    tailWidth: 115,
    headSize: 4.2
  }
];

/**
 * Escenario Celestial con Luna, Sol, Rayos, Constelaciones Autónomas y Chispas Temáticas
 * Optimizado para 120 FPS por hardware GPU (cero caídas de cuadros en clic o navegación).
 */
function CelestialAtmosphereCanvasComponent({ isNight, phase, className = "" }) {
  const [isSkyHovered, setIsSkyHovered] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [clickMeteorKey, setClickMeteorKey] = useState(0);

  // Manejo de clic ultra-rápido en la animación: 0 re-renderings pesados, 100% GPU
  const handleOrbClick = useCallback((e) => {
    e.stopPropagation();
    setIsBouncing(true);
    setBurstKey(Date.now());
    if (isNight) setClickMeteorKey(Date.now());
    try {
      playHoloShimmerSound();
    } catch (err) {}

    setTimeout(() => {
      setIsBouncing(false);
    }, 450);
  }, [isNight]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsSkyHovered(true)}
      onMouseLeave={() => setIsSkyHovered(false)}
      style={{ contain: "strict", transform: "translate3d(0, 0, 0)" }}
    >
      {/* 1. MODO NOCHE: CAMPO DE ESTRELLAS TITILANTES Y CONSTELACIÓN ELEGANTE */}
      {isNight && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Estrellas titilantes aceleradas por GPU */}
          {NIGHT_STARS.map((st, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.85)]"
              style={{
                top: st.top,
                left: st.left,
                width: `${st.size}px`,
                height: `${st.size}px`,
                animation: `celStarTwinkleFast ${st.duration}s ease-in-out ${st.delay}s infinite`,
                willChange: "transform, opacity"
              }}
            />
          ))}

          {/* METEOROS / COMETAS NATURALES QUE CAEN FLUIDOS Y SUAVES */}
          {NIGHT_METEORS.map((m) => (
            <div
              key={m.id}
              className="absolute pointer-events-none z-10"
              style={{
                top: m.top,
                left: m.left,
                transform: `rotate(${m.angle}deg)`,
                transformOrigin: "0 50%"
              }}
            >
              <div
                className="flex items-center"
                style={{
                  animation: m.animName,
                  willChange: "transform, opacity"
                }}
              >
                {/* Estela iónica luminosa (Tail) que sigue exactamente el ángulo de vuelo */}
                <div
                  className="h-[2px] rounded-full"
                  style={{
                    width: `${m.tailWidth}px`,
                    background: "linear-gradient(90deg, transparent 0%, rgba(147,197,253,0.18) 35%, rgba(223,183,85,0.4) 75%, #FFFFFF 100%)",
                    filter: "drop-shadow(0 0 3px rgba(186,230,253,0.5))"
                  }}
                />
                {/* Núcleo estelar incandescente (Head) al frente guiando la trayectoria */}
                <div
                  className="rounded-full bg-white -ml-1 shrink-0"
                  style={{
                    width: `${m.headSize}px`,
                    height: `${m.headSize}px`,
                    boxShadow: "0 0 6px 2px #FFFFFF, 0 0 12px 3px #93C5FD, 0 0 18px 5px rgba(223,183,85,0.45)"
                  }}
                />
              </div>
            </div>
          ))}

          {/* Meteoro suave adicional activado al interactuar con la luna */}
          {clickMeteorKey > 0 && (
            <div
              key={`click-meteor-${clickMeteorKey}`}
              className="absolute pointer-events-none z-10"
              style={{
                top: "10%",
                left: "22%",
                transform: "rotate(32deg)",
                transformOrigin: "0 50%"
              }}
            >
              <div
                className="flex items-center"
                style={{
                  animation: "celMeteorClickPass 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  willChange: "transform, opacity"
                }}
              >
                <div
                  className="h-[2px] rounded-full"
                  style={{
                    width: "135px",
                    background: "linear-gradient(90deg, transparent 0%, rgba(147,197,253,0.2) 30%, rgba(223,183,85,0.45) 75%, #FFFFFF 100%)",
                    filter: "drop-shadow(0 0 4px rgba(186,230,253,0.6))"
                  }}
                />
                <div
                  className="rounded-full bg-white -ml-1 shrink-0"
                  style={{
                    width: "5px",
                    height: "5px",
                    boxShadow: "0 0 6px 2px #FFFFFF, 0 0 14px 4px #93C5FD, 0 0 20px 6px rgba(223,183,85,0.5)"
                  }}
                />
              </div>
            </div>
          )}

          {/* MAPA CELESTIAL DE CONSTELACIONES REALISTAS (ORIÓN, OSA MAYOR, CASIOPEA, POLARIS Y PLÉYADES) */}
          <div
            className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-1000 ${
              isSkyHovered ? "opacity-100" : "opacity-85"
            }`}
          >
            <svg
              viewBox="0 0 1000 240"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* 1. Vía Láctea / Nebulosidad cósmica de fondo */}
                <linearGradient id="milkyWayHaze" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#4338CA" stopOpacity="0.09" />
                  <stop offset="35%" stopColor="#6366F1" stopOpacity="0.14" />
                  <stop offset="65%" stopColor="#3B82F6" stopOpacity="0.11" />
                  <stop offset="100%" stopColor="#DFB755" stopOpacity="0.05" />
                </linearGradient>

                {/* 2. Nebulosa de Orión (M42) */}
                <radialGradient id="orionNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.5" />
                  <stop offset="35%" stopColor="#A855F7" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>

                {/* 3. Velo de reflexión de las Pléyades */}
                <radialGradient id="pleiadesNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.45" />
                  <stop offset="45%" stopColor="#60A5FA" stopOpacity="0.22" />
                  <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
                </radialGradient>

                {/* 4. Filamento estelar translúcido (Luz tenue entre estrellas) */}
                <linearGradient id="constellationFilament" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#DFB755" stopOpacity="0.32" />
                </linearGradient>

                <linearGradient id="faintFilament" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.22" />
                </linearGradient>

                {/* 5. Halos de estrellas de diversas magnitudes y clases espectrales */}
                {/* Estrella Blanca / Azul (Clase O/B/A como Rigel, Sirio, Polaris) */}
                <radialGradient id="starGlowWhite" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#BAE6FD" stopOpacity="0.6" />
                  <stop offset="65%" stopColor="#60A5FA" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                </radialGradient>

                {/* Estrella Ámbar / Dorada (Supergigante roja/naranja como Betelgeuse o Dubhe) */}
                <radialGradient id="starGlowAmber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#D97706" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                </radialGradient>

                {/* Halo estelar suave para estrellas medianas */}
                <radialGradient id="starGlowSmall" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#93C5FD" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ------------------------------------------------------------- */}
              {/* CAPA 1: POLVO CÓSMICO Y NEBULOSAS DEL ESPACIO PROFUNDO        */}
              {/* ------------------------------------------------------------- */}
              <g className="pointer-events-none select-none">
                {/* Brazo de la Vía Láctea con ondulación galáctica suave */}
                <ellipse
                  cx="620"
                  cy="125"
                  rx="320"
                  ry="85"
                  fill="url(#milkyWayHaze)"
                  transform="rotate(-14 620 125)"
                  style={{
                    animation: "celMilkyWayDrift 22s ease-in-out infinite",
                    willChange: "transform, opacity"
                  }}
                />
                <ellipse
                  cx="190"
                  cy="135"
                  rx="160"
                  ry="65"
                  fill="url(#milkyWayHaze)"
                  transform="rotate(8 190 135)"
                  style={{
                    animation: "celMilkyWayDrift 26s ease-in-out infinite 4s",
                    willChange: "transform, opacity"
                  }}
                  opacity="0.6"
                />

                {/* Nebulosa de Orión (M42) respiración cósmica */}
                <ellipse
                  cx="640"
                  cy="142"
                  rx="18"
                  ry="12"
                  fill="url(#orionNebula)"
                  style={{
                    animation: "celNebulaGlow 7s ease-in-out infinite 0.8s",
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    willChange: "transform, opacity"
                  }}
                />

                {/* Velo nebuloso de las Pléyades */}
                <ellipse
                  cx="745"
                  cy="84"
                  rx="24"
                  ry="16"
                  fill="url(#pleiadesNebula)"
                  transform="rotate(-15 745 84)"
                  style={{
                    animation: "celNebulaGlow 6.2s ease-in-out infinite 2.4s",
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    willChange: "transform, opacity"
                  }}
                />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* CAPA 2: MICRO-CAMPO DE ESTRELLAS DE FONDO (MAGNITUDES 5 Y 6)   */}
              {/* ------------------------------------------------------------- */}
              <g fill="#FFFFFF" opacity="0.75">
                <circle cx="35" cy="85" r="0.8" style={{ animation: "celMicroStarFlicker 3.2s ease-in-out infinite 0.2s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="75" cy="35" r="1.1" style={{ animation: "celMicroStarFlicker 2.7s ease-in-out infinite 1.4s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="120" cy="65" r="0.9" style={{ animation: "celMicroStarFlicker 3.8s ease-in-out infinite 0.8s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="165" cy="180" r="1.2" style={{ animation: "celMicroStarFlicker 2.9s ease-in-out infinite 2.1s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="215" cy="45" r="0.8" style={{ animation: "celMicroStarFlicker 4.1s ease-in-out infinite 1.1s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="280" cy="140" r="1.0" style={{ animation: "celMicroStarFlicker 3.5s ease-in-out infinite 2.6s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="310" cy="195" r="1.3" style={{ animation: "celMicroStarFlicker 2.4s ease-in-out infinite 0.5s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="360" cy="120" r="0.9" style={{ animation: "celMicroStarFlicker 3.6s ease-in-out infinite 1.9s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="415" cy="165" r="1.2" style={{ animation: "celMicroStarFlicker 3.0s ease-in-out infinite 0.4s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="455" cy="30" r="0.8" style={{ animation: "celMicroStarFlicker 4.3s ease-in-out infinite 2.2s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="495" cy="185" r="1.1" style={{ animation: "celMicroStarFlicker 2.8s ease-in-out infinite 1.6s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="535" cy="130" r="0.9" style={{ animation: "celMicroStarFlicker 3.4s ease-in-out infinite 0.7s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="560" cy="210" r="1.2" style={{ animation: "celMicroStarFlicker 3.1s ease-in-out infinite 2.5s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="615" cy="25" r="0.8" style={{ animation: "celMicroStarFlicker 4.0s ease-in-out infinite 1.3s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="665" cy="195" r="1.1" style={{ animation: "celMicroStarFlicker 2.6s ease-in-out infinite 0.9s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="715" cy="115" r="0.9" style={{ animation: "celMicroStarFlicker 3.7s ease-in-out infinite 2.0s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="750" cy="190" r="1.3" style={{ animation: "celMicroStarFlicker 2.5s ease-in-out infinite 0.3s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="790" cy="55" r="0.8" style={{ animation: "celMicroStarFlicker 4.2s ease-in-out infinite 1.7s", transformBox: "fill-box", transformOrigin: "center" }} />
                <circle cx="820" cy="160" r="1.0" style={{ animation: "celMicroStarFlicker 3.3s ease-in-out infinite 2.8s", transformBox: "fill-box", transformOrigin: "center" }} />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* CAPA 3: FILAMENTOS DE LUZ ESTELAR (LÍNEAS SUTILES Y ETÉREAS)  */}
              {/* ------------------------------------------------------------- */}
              <g strokeLinecap="round">
                {/* --- A. CONSTELACIÓN OSA MAYOR (EL GRAN CARRO) --- */}
                <g
                  stroke="url(#constellationFilament)"
                  strokeWidth="0.75"
                  strokeOpacity="0.32"
                  style={{
                    animation: "celConstellationBreathe 9s ease-in-out infinite",
                    willChange: "transform, opacity"
                  }}
                >
                  {/* Mango del carro */}
                  <line x1="55" y1="148" x2="98" y2="130" />
                  <line x1="98" y1="130" x2="142" y2="124" />
                  <line x1="142" y1="124" x2="186" y2="116" />
                  {/* Cuenco del carro */}
                  <line x1="186" y1="116" x2="180" y2="168" />
                  <line x1="180" y1="168" x2="242" y2="162" />
                  <line x1="242" y1="162" x2="256" y2="106" />
                  <line x1="256" y1="106" x2="186" y2="116" />
                </g>

                {/* Rayo puntero astronómico desde Merak & Dubhe hacia Polaris con pulso */}
                <line
                  x1="256"
                  y1="106"
                  x2="330"
                  y2="44"
                  stroke="url(#faintFilament)"
                  strokeWidth="0.75"
                  strokeDasharray="3 6"
                  style={{
                    animation: "celPointerPulse 5s ease-in-out infinite",
                    willChange: "opacity"
                  }}
                />

                {/* --- B. CONSTELACIÓN CASIOPEA (LA REINA / EL TRONO 'W') --- */}
                <g
                  stroke="url(#constellationFilament)"
                  strokeWidth="0.75"
                  strokeOpacity="0.34"
                  style={{
                    animation: "celConstellationBreathe 10.5s ease-in-out infinite 1.8s",
                    willChange: "transform, opacity"
                  }}
                >
                  <line x1="385" y1="76" x2="425" y2="98" />
                  <line x1="425" y1="98" x2="468" y2="58" />
                  <line x1="468" y1="58" x2="510" y2="82" />
                  <line x1="510" y1="82" x2="550" y2="52" />
                </g>

                {/* --- C. CONSTELACIÓN ORIÓN (EL GRAN CAZADOR CELESTIAL) --- */}
                <g
                  stroke="url(#constellationFilament)"
                  strokeWidth="0.8"
                  strokeOpacity="0.36"
                  style={{
                    animation: "celConstellationBreathe 8.5s ease-in-out infinite 0.7s",
                    willChange: "transform, opacity"
                  }}
                >
                  {/* Hombros superiores */}
                  <line x1="585" y1="68" x2="680" y2="56" />
                  {/* Conexión hombros hacia el cinturón */}
                  <line x1="585" y1="68" x2="658" y2="122" />
                  <line x1="680" y1="56" x2="622" y2="112" />
                  {/* El Cinturón de Orión (Las Tres Marías) */}
                  <line x1="622" y1="112" x2="640" y2="117" strokeWidth="0.95" strokeOpacity="0.48" />
                  <line x1="640" y1="117" x2="658" y2="122" strokeWidth="0.95" strokeOpacity="0.48" />
                  {/* Conexión cinturón hacia las piernas */}
                  <line x1="658" y1="122" x2="600" y2="185" />
                  <line x1="622" y1="112" x2="692" y2="172" />
                  {/* Base de las piernas */}
                  <line x1="600" y1="185" x2="692" y2="172" strokeOpacity="0.28" />
                  {/* Filamento sutil hacia la espada / Nebulosa M42 */}
                  <line x1="640" y1="117" x2="640" y2="140" stroke="url(#faintFilament)" strokeWidth="0.6" strokeOpacity="0.32" />
                </g>

                {/* --- D. CÚMULO DE LAS PLÉYADES (HILOS SUTILES) --- */}
                <g
                  stroke="url(#faintFilament)"
                  strokeWidth="0.5"
                  strokeOpacity="0.24"
                  style={{
                    animation: "celClusterGlimmer 5.2s ease-in-out infinite",
                    willChange: "transform, opacity"
                  }}
                >
                  <line x1="732" y1="80" x2="738" y2="72" />
                  <line x1="738" y1="72" x2="745" y2="83" />
                  <line x1="745" y1="83" x2="758" y2="90" />
                  <line x1="745" y1="83" x2="736" y2="92" />
                  <line x1="758" y1="90" x2="760" y2="84" />
                </g>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* CAPA 4: ESTRELLAS NODALES CON MAGNITUDES Y PICOS ÓPTICOS     */}
              {/* ------------------------------------------------------------- */}
              <g className="pointer-events-none">
                {/* ========================================================= */}
                {/* A. ESTRELLAS DE LA OSA MAYOR                              */}
                {/* ========================================================= */}
                {/* Alkaid */}
                <g style={{ animation: "celStarScintillate 4.2s ease-in-out infinite 0.3s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="55" cy="148" r="5" fill="url(#starGlowSmall)" />
                  <circle cx="55" cy="148" r="1.9" fill="#FFFFFF" />
                </g>

                {/* Mizar y Alcor (estrella doble auténtica) */}
                <g style={{ animation: "celStarScintillate 3.8s ease-in-out infinite 1.1s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="98" cy="130" r="5.5" fill="url(#starGlowSmall)" />
                  <circle cx="98" cy="130" r="2.2" fill="#FFFFFF" />
                </g>
                <circle
                  cx="102"
                  cy="126"
                  r="0.9"
                  fill="#BAE6FD"
                  opacity="0.85"
                  style={{ animation: "celMicroStarFlicker 2.4s ease-in-out infinite 0.5s", transformBox: "fill-box", transformOrigin: "center" }}
                />

                {/* Alioth (la más brillante del carro) */}
                <g style={{ animation: "celStarScintillate 3.4s ease-in-out infinite 1.8s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="142" cy="124" r="6" fill="url(#starGlowSmall)" />
                  <circle cx="142" cy="124" r="2.4" fill="#FFFFFF" />
                </g>

                {/* Megrez */}
                <g style={{ animation: "celStarScintillate 4.6s ease-in-out infinite 2.2s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="186" cy="116" r="4.5" fill="url(#starGlowSmall)" />
                  <circle cx="186" cy="116" r="1.8" fill="#FFFFFF" />
                </g>

                {/* Phecda */}
                <g style={{ animation: "celStarScintillate 3.9s ease-in-out infinite 0.9s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="180" cy="168" r="5" fill="url(#starGlowSmall)" />
                  <circle cx="180" cy="168" r="2.0" fill="#FFFFFF" />
                </g>

                {/* Merak */}
                <g style={{ animation: "celStarScintillate 3.6s ease-in-out infinite 2.7s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="242" cy="162" r="5.5" fill="url(#starGlowSmall)" />
                  <circle cx="242" cy="162" r="2.2" fill="#FFFFFF" />
                </g>

                {/* Dubhe (Estrella Alpha naranja-dorada de la Osa Mayor) */}
                <g
                  transform="translate(256, 106)"
                  style={{
                    animation: "celDiffractionGlitter 6.2s ease-in-out infinite 0.4s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="9" fill="url(#starGlowAmber)" />
                  <circle r="2.8" fill="#FFFBEB" />
                  <circle r="1.4" fill="#F59E0B" />
                  {/* Micro pico de difracción */}
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#FFFBEB" strokeWidth="0.7" opacity="0.75" strokeLinecap="round" />
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#FFFBEB" strokeWidth="0.7" opacity="0.75" strokeLinecap="round" />
                </g>

                {/* ========================================================= */}
                {/* POLARIS (ESTRELLA POLAR - ALPHA URSAE MINORIS)            */}
                {/* Con pico de difracción estelar de telescopio a 4 puntas   */}
                {/* ========================================================= */}
                <g
                  transform="translate(330, 44)"
                  style={{
                    animation: "celDiffractionGlitter 7.5s ease-in-out infinite",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  {/* Gran corona azulada */}
                  <circle r="14" fill="url(#starGlowWhite)" />
                  {/* Picos de difracción de alta precisión */}
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
                  <line x1="0" y1="-15" x2="0" y2="15" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />
                  {/* Rayos diagonales tenues */}
                  <line x1="-6" y1="-6" x2="6" y2="6" stroke="#BAE6FD" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
                  <line x1="6" y1="-6" x2="-6" y2="6" stroke="#BAE6FD" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
                  {/* Núcleo estelar brillante */}
                  <circle r="3.2" fill="#FFFFFF" />
                  <circle r="1.6" fill="#DFB755" />
                </g>

                {/* ========================================================= */}
                {/* B. ESTRELLAS DE CASIOPEA (EL 'W' CELESTIAL)               */}
                {/* ========================================================= */}
                {/* Caph */}
                <g style={{ animation: "celStarScintillate 4.0s ease-in-out infinite 0.8s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="385" cy="76" r="5" fill="url(#starGlowSmall)" />
                  <circle cx="385" cy="76" r="2.1" fill="#FFFFFF" />
                </g>

                {/* Schedar (Alpha Cassiopeiae, gigante ámbar) */}
                <g
                  transform="translate(425, 98)"
                  style={{
                    animation: "celDiffractionGlitter 6.8s ease-in-out infinite 1.2s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="8" fill="url(#starGlowAmber)" />
                  <circle r="2.6" fill="#FFFBEB" />
                  <circle r="1.3" fill="#F59E0B" />
                  <line x1="-6" y1="0" x2="6" y2="0" stroke="#FFFBEB" strokeWidth="0.6" opacity="0.65" strokeLinecap="round" />
                  <line x1="0" y1="-6" x2="0" y2="6" stroke="#FFFBEB" strokeWidth="0.6" opacity="0.65" strokeLinecap="round" />
                </g>

                {/* Gamma Cassiopeiae (Navi, centro azul brillante) */}
                <g style={{ animation: "celStarScintillate 3.5s ease-in-out infinite 2.1s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="468" cy="58" r="6" fill="url(#starGlowSmall)" />
                  <circle cx="468" cy="58" r="2.4" fill="#BAE6FD" />
                </g>

                {/* Ruchbah */}
                <g style={{ animation: "celStarScintillate 4.3s ease-in-out infinite 1.4s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="510" cy="82" r="5" fill="url(#starGlowSmall)" />
                  <circle cx="510" cy="82" r="2.0" fill="#FFFFFF" />
                </g>

                {/* Segin */}
                <g style={{ animation: "celStarScintillate 3.7s ease-in-out infinite 0.2s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="550" cy="52" r="4.5" fill="url(#starGlowSmall)" />
                  <circle cx="550" cy="52" r="1.8" fill="#BAE6FD" />
                </g>

                {/* ========================================================= */}
                {/* C. ESTRELLAS DE ORIÓN (EL GIGANTE DEL CIELO)              */}
                {/* ========================================================= */}
                {/* BETELGEUSE (Alpha Orionis - Supergigante Roja / Ámbar) */}
                <g
                  transform="translate(585, 68)"
                  style={{
                    animation: "celDiffractionGlitter 5.8s ease-in-out infinite 0.6s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="15" fill="url(#starGlowAmber)" />
                  {/* Difracción estelar cálida */}
                  <line x1="-16" y1="0" x2="16" y2="0" stroke="#FFFBEB" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
                  <line x1="0" y1="-16" x2="0" y2="16" stroke="#FFFBEB" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
                  <line x1="-7" y1="-7" x2="7" y2="7" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
                  <line x1="7" y1="-7" x2="-7" y2="7" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
                  <circle r="3.6" fill="#FFFBEB" />
                  <circle r="1.8" fill="#F59E0B" />
                </g>

                {/* Bellatrix (Gamma Orionis, gigante azul) */}
                <g
                  transform="translate(680, 56)"
                  style={{
                    animation: "celStarScintillate 3.9s ease-in-out infinite 2.5s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="7.5" fill="url(#starGlowSmall)" />
                  <circle r="2.5" fill="#BAE6FD" />
                  <circle r="1.2" fill="#FFFFFF" />
                </g>

                {/* CINTURÓN DE ORIÓN (LAS TRES MARÍAS) */}
                {/* Mintaka */}
                <g style={{ animation: "celStarScintillate 3.6s ease-in-out infinite 1.2s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="622" cy="112" r="5" fill="url(#starGlowSmall)" />
                  <circle cx="622" cy="112" r="2.1" fill="#BAE6FD" />
                </g>

                {/* Alnilam (supergigante luminosa central) */}
                <g
                  transform="translate(640, 117)"
                  style={{
                    animation: "celDiffractionGlitter 5.4s ease-in-out infinite 0.3s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="6.5" fill="url(#starGlowSmall)" />
                  <circle r="2.6" fill="#FFFFFF" />
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.75" />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.75" />
                </g>

                {/* Alnitak */}
                <g style={{ animation: "celStarScintillate 3.8s ease-in-out infinite 1.9s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="658" cy="122" r="5.5" fill="url(#starGlowSmall)" />
                  <circle cx="658" cy="122" r="2.3" fill="#BAE6FD" />
                </g>

                {/* Saiph */}
                <g style={{ animation: "celStarScintillate 4.1s ease-in-out infinite 0.7s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="600" cy="185" r="5.5" fill="url(#starGlowSmall)" />
                  <circle cx="600" cy="185" r="2.2" fill="#E0F2FE" />
                </g>

                {/* RIGEL (Beta Orionis - Supergigante Azul-Blanco deslumbrante) */}
                <g
                  transform="translate(692, 172)"
                  style={{
                    animation: "celDiffractionGlitter 6.4s ease-in-out infinite 1.5s",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  <circle r="16" fill="url(#starGlowWhite)" />
                  {/* Difracción estelar azul-diamante */}
                  <line x1="-17" y1="0" x2="17" y2="0" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity="0.95" />
                  <line x1="0" y1="-17" x2="0" y2="17" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity="0.95" />
                  <line x1="-7" y1="-7" x2="7" y2="7" stroke="#93C5FD" strokeWidth="0.6" strokeLinecap="round" opacity="0.55" />
                  <line x1="7" y1="-7" x2="-7" y2="7" stroke="#93C5FD" strokeWidth="0.6" strokeLinecap="round" opacity="0.55" />
                  <circle r="3.7" fill="#FFFFFF" />
                  <circle r="1.8" fill="#93C5FD" />
                </g>

                {/* Nebulosa de Orión núcleo (Trapecio M42) */}
                <g style={{ animation: "celNebulaGlow 4.8s ease-in-out infinite 0.5s", transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle cx="640" cy="142" r="2.2" fill="#E9D5FF" opacity="0.8" />
                  <circle cx="640" cy="142" r="1.1" fill="#FFFFFF" />
                </g>

                {/* ========================================================= */}
                {/* D. CÚMULO DE LAS PLÉYADES (LAS SIETE HERMANAS)            */}
                {/* ========================================================= */}
                <g
                  className="opacity-95"
                  style={{
                    animation: "celClusterGlimmer 6.5s ease-in-out infinite",
                    transformBox: "fill-box",
                    transformOrigin: "center"
                  }}
                >
                  {/* Alcyone (la más brillante) */}
                  <g style={{ animation: "celStarScintillate 3.2s ease-in-out infinite 0.2s", transformBox: "fill-box", transformOrigin: "center" }}>
                    <circle cx="745" cy="83" r="4" fill="url(#starGlowSmall)" />
                    <circle cx="745" cy="83" r="2.0" fill="#FFFFFF" />
                  </g>
                  {/* Atlas */}
                  <circle cx="758" cy="90" r="1.6" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 2.8s ease-in-out infinite 0.7s", transformBox: "fill-box", transformOrigin: "center" }} />
                  {/* Electra */}
                  <circle cx="732" cy="80" r="1.7" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 3.1s ease-in-out infinite 1.2s", transformBox: "fill-box", transformOrigin: "center" }} />
                  {/* Maia */}
                  <circle cx="738" cy="72" r="1.6" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 2.5s ease-in-out infinite 0.4s", transformBox: "fill-box", transformOrigin: "center" }} />
                  {/* Merope */}
                  <circle cx="736" cy="92" r="1.5" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 3.4s ease-in-out infinite 1.8s", transformBox: "fill-box", transformOrigin: "center" }} />
                  {/* Taygeta */}
                  <circle cx="728" cy="70" r="1.4" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 2.9s ease-in-out infinite 0.9s", transformBox: "fill-box", transformOrigin: "center" }} />
                  {/* Pleione */}
                  <circle cx="760" cy="84" r="1.3" fill="#BAE6FD" style={{ animation: "celMicroStarFlicker 3.6s ease-in-out infinite 1.5s", transformBox: "fill-box", transformOrigin: "center" }} />
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 2. MODO DÍA / ATARDECER: ATMÓSFERA COMPLETA (RAYOS VOLUMÉTRICOS, NUBES DORADAS, AVES Y PARTICULAS) */}
      {!isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* A. HACES DE LUZ VOLUMÉTRICOS (GOD RAYS) DIAGONALES DESDE EL SOL */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isSkyHovered ? "opacity-95" : "opacity-80"
            }`}
            style={{
              animation: "celGodRaysWave 9s ease-in-out infinite",
              transformOrigin: "88% 22%",
              willChange: "transform, opacity"
            }}
          >
            <svg
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                {/* Gradientes para haces volumétricos */}
                <linearGradient id="godRayA" x1="88%" y1="20%" x2="45%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" stopOpacity={phase === "sunset" ? "0.28" : "0.22"} />
                  <stop offset="45%" stopColor={phase === "sunset" ? "#F97316" : "#DFB755"} stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#DFB755" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="godRayB" x1="88%" y1="20%" x2="25%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#DFB755" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#DFB755" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="godRayC" x1="88%" y1="20%" x2="70%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#DFB755" stopOpacity="0.11" />
                  <stop offset="100%" stopColor="#DFB755" stopOpacity="0" />
                </linearGradient>

                {/* Gradientes para las nubes matutinas */}
                <linearGradient id="cloudGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={phase === "sunset" ? "#EA580C" : "#DFB755"} stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#140F1D" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="cloudGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={phase === "sunset" ? "#F97316" : "#FFE082"} stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#140F1D" stopOpacity="0.02" />
                </linearGradient>

                <linearGradient id="cloudRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DFB755" stopOpacity="0.08" />
                  <stop offset="45%" stopColor="#FFE082" stopOpacity="0.45" />
                  <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#FFE082" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Haces de luz solar que cruzan suavemente el cielo */}
              <polygon points="880,48 420,240 560,240" fill="url(#godRayA)" />
              <polygon points="885,50 210,240 340,240" fill="url(#godRayB)" />
              <polygon points="875,46 660,240 780,240" fill="url(#godRayC)" />
              <polygon points="890,52 80,240 180,240" fill="url(#godRayB)" opacity="0.6" />

              {/* NUBES Y BRUMAS MATUTINAS/VESPERTINAS EN EL HORIZONTE */}
              <g style={{ animation: "celCloudDriftSlow 38s ease-in-out infinite" }}>
                <path
                  d="M 320,240 Q 400,182 490,196 T 640,178 T 790,192 T 910,172 T 1000,186 L 1000,240 Z"
                  fill="url(#cloudGradBack)"
                />
              </g>

              <g style={{ animation: "celCloudDriftMedium 26s ease-in-out infinite" }}>
                <path
                  d="M 420,240 Q 510,192 590,206 T 720,188 T 850,202 T 960,182 T 1000,196 L 1000,240 Z"
                  fill="url(#cloudGradFront)"
                  stroke="url(#cloudRimGrad)"
                  strokeWidth="1.2"
                />
              </g>

              {/* AVES EN EL HORIZONTE MATUTINO (Bandada en vuelo elegante) */}
              <g
                style={{
                  animation: "celBirdSoar 24s ease-in-out infinite",
                  transformOrigin: "560px 65px"
                }}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                {/* Ave 1 - Líder */}
                <g transform="translate(565, 62) scale(0.95)">
                  <path
                    d="M -10,3 Q -5,-5 0,0 Q 5,-5 10,3 Q 5,-2 0,1 Q -5,-2 -10,3 Z"
                    fill={phase === "sunset" ? "#FED7AA" : "#FFE082"}
                    style={{ animation: "celBirdWingFlap 1.1s ease-in-out infinite" }}
                  />
                </g>
                {/* Ave 2 - Seguidora izquierda */}
                <g transform="translate(535, 78) scale(0.75)">
                  <path
                    d="M -10,3 Q -5,-5 0,0 Q 5,-5 10,3 Q 5,-2 0,1 Q -5,-2 -10,3 Z"
                    fill={phase === "sunset" ? "#FED7AA" : "#FFE082"}
                    style={{ animation: "celBirdWingFlap 1.25s ease-in-out infinite 0.2s" }}
                  />
                </g>
                {/* Ave 3 - Seguidora derecha */}
                <g transform="translate(605, 72) scale(0.8)">
                  <path
                    d="M -10,3 Q -5,-5 0,0 Q 5,-5 10,3 Q 5,-2 0,1 Q -5,-2 -10,3 Z"
                    fill={phase === "sunset" ? "#FED7AA" : "#FFE082"}
                    style={{ animation: "celBirdWingFlap 1.05s ease-in-out infinite 0.4s" }}
                  />
                </g>
              </g>
            </svg>
          </div>

          {/* B. DESTELLOS DE LENTE ÓPTICOS (LENS FLARES) ALINEADOS CON EL SOL */}
          {DAY_LENS_FLARES.map((lf, idx) => (
            <div
              key={`lens-flare-${idx}`}
              className={`absolute rounded-full pointer-events-none ${lf.size} ${
                lf.type === "ring"
                  ? "border border-[#FFE082]/35 bg-[#DFB755]/10 backdrop-blur-xs shadow-[0_0_12px_rgba(255,224,130,0.3)]"
                  : lf.type === "disc"
                  ? "bg-gradient-to-tr from-[#FFE082]/15 via-[#DFB755]/10 to-transparent shadow-[0_0_20px_rgba(223,183,85,0.25)]"
                  : "bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              }`}
              style={{
                left: lf.left,
                top: lf.top,
                animation: `celLensFlareFloat ${lf.duration} ease-in-out ${lf.delay} infinite`,
                willChange: "transform, opacity"
              }}
            />
          ))}

          {/* C. POLVO SOLAR DORADO FLOTANTE (18 MOTAS EN CORRIENTE TÉRMICA) */}
          {DAY_GOLDEN_MOTES.map((mote, i) => (
            <div
              key={`day-mote-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: mote.left,
                bottom: mote.bottom,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                background: phase === "sunset"
                  ? "linear-gradient(135deg, #FDBA74 0%, #EA580C 100%)"
                  : "linear-gradient(135deg, #FFF9E6 0%, #DFB755 60%, #C59835 100%)",
                boxShadow: phase === "sunset"
                  ? "0 0 6px rgba(249, 115, 22, 0.7)"
                  : "0 0 6px rgba(223, 183, 85, 0.75)",
                animation: `celSunMoteFloat ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
                willChange: "transform, opacity"
              }}
            />
          ))}

          {/* D. DESTELLOS DE ACERO PULIDO / DIAMANTES DE CORTE (BARBER STEEL FLARES ✦) */}
          {DAY_STEEL_FLARES.map((flare, i) => (
            <div
              key={`day-flare-${i}`}
              className="absolute pointer-events-none select-none flex items-center justify-center font-black"
              style={{
                left: flare.left,
                top: flare.top,
                fontSize: `${flare.size}px`,
                color: phase === "sunset" ? "#FED7AA" : "#FFF9E6",
                textShadow: phase === "sunset"
                  ? "0 0 8px rgba(249, 115, 22, 0.9)"
                  : "0 0 8px rgba(255, 224, 130, 0.95)",
                animation: `celDiamondGleam ${flare.duration}s ease-in-out ${flare.delay}s infinite`,
                willChange: "transform, opacity"
              }}
            >
              ✦
            </div>
          ))}
        </div>
      )}

      {/* 3. EL ASTRO CELESTIAL DINÁMICO (LUNA, SOL 3D VIP, ATARDECER) */}
      <div className="absolute top-2 sm:top-3 right-0 sm:right-1 md:right-2 lg:right-2 w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 pointer-events-auto flex items-center justify-center">
        {/* ONDA EXPANSIVA Y CHISPAS EN EL CLIC (100% GPU ACCELERATED) */}
        {burstKey > 0 && (
          <div key={burstKey} className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Anillo de onda expansiva */}
            <div
              className={`absolute rounded-full border pointer-events-none ${
                phase === "night"
                  ? "border-indigo-300/80 shadow-[0_0_15px_rgba(147,197,253,0.6)]"
                  : phase === "sunset"
                  ? "border-orange-400/80 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                  : "border-amber-300/80 shadow-[0_0_15px_rgba(255,224,130,0.7)]"
              }`}
              style={{
                width: "90px",
                height: "90px",
                animation: "celShockwaveBurst 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                willChange: "transform, opacity"
              }}
            />

            {/* Chispas radiales ultraligeras */}
            {BURST_PARTICLES.map((p) => (
              <div
                key={p.id}
                className="absolute pointer-events-none select-none text-sm font-black"
                style={{
                  "--burst-x": `${p.x}px`,
                  "--burst-y": `${p.y}px`,
                  "--burst-rot": `${p.rot}deg`,
                  color: phase === "night" ? "#BAE6FD" : phase === "sunset" ? "#FDBA74" : "#FFE082",
                  animation: "celParticleBurst 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  willChange: "transform, opacity"
                }}
              >
                {p.sym}
              </div>
            ))}
          </div>
        )}

        {/* Noche: LUNA CRECIENTE 3D GLASSMORPHIC */}
        {isNight && (
          <div
            onClick={handleOrbClick}
            className="relative cursor-pointer group select-none"
            style={{
              animation: isBouncing ? "celOrbClickPulse 0.45s ease-out forwards" : "celOrbFloat 5s ease-in-out infinite",
              willChange: "transform"
            }}
            title="Luna Estelar • Haz clic para destellos estelares"
          >
            {/* Halo lunar suave azul índigo */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-indigo-500/25 via-[#DFB755]/15 to-transparent blur-xl group-hover:blur-2xl transition-all pointer-events-none" />

            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-[0_0_15px_rgba(223,183,85,0.35)] transition-transform group-hover:scale-105 active:scale-95"
            >
              <defs>
                <linearGradient id="moonGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" />
                  <stop offset="35%" stopColor="#DFB755" />
                  <stop offset="75%" stopColor="#9C781E" />
                  <stop offset="100%" stopColor="#1E1B4B" />
                </linearGradient>
              </defs>

              <path
                d="M 68,14 A 38,38 0 1,0 68,86 A 29,29 0 0,1 68,14 Z"
                fill="url(#moonGlowGrad)"
              />

              <circle cx="38" cy="46" r="4" fill="#8A6717" opacity="0.45" />
              <circle cx="48" cy="62" r="3" fill="#8A6717" opacity="0.35" />
              <circle cx="34" cy="68" r="2.5" fill="#8A6717" opacity="0.4" />
              <circle cx="68" cy="14" r="2.2" fill="#FFFFFF" opacity="0.95" />
            </svg>
          </div>
        )}

        {/* Modo Día / Tarde / Atardecer: SOL TRIDIMENSIONAL VIP BARBER CON CORONA DE PRECISIÓN */}
        {!isNight && (
          <div
            onClick={handleOrbClick}
            className="relative cursor-pointer group select-none flex items-center justify-center"
            style={{
              animation: isBouncing ? "celOrbClickPulse 0.45s ease-out forwards" : "celOrbFloat 5s ease-in-out infinite",
              willChange: "transform"
            }}
            title={
              phase === "morning"
                ? "Sol Matutino VIP • Haz clic para llamarada solar matutina"
                : phase === "afternoon"
                ? "Sol Cenital Dorado • Haz clic para llamarada de alta potencia"
                : "Atardecer Dorado • Haz clic para llamarada crepuscular"
            }
          >
            {/* 1. Halo áurico y corona expansiva de luz solar */}
            <div
              className={`absolute -inset-6 sm:-inset-8 rounded-full pointer-events-none transition-all duration-500 blur-2xl group-hover:blur-3xl ${
                phase === "sunset"
                  ? "bg-gradient-to-tr from-orange-600/35 via-amber-500/30 to-rose-900/20"
                  : "bg-gradient-to-tr from-amber-500/25 via-[#DFB755]/35 to-[#FFE082]/30"
              }`}
              style={{
                animation: "celSunHaloBreathe 4.5s ease-in-out infinite",
                willChange: "transform, opacity"
              }}
            />

            {/* 2. Anillo de pulso térmico concéntrico */}
            <div
              className={`absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border pointer-events-none ${
                phase === "sunset" ? "border-orange-400/35" : "border-[#FFE082]/40"
              }`}
              style={{
                animation: "ambientCoronaPulse 3.8s ease-in-out infinite",
                willChange: "transform, opacity"
              }}
            />

            {/* 3. Corona Solar de Barbería (16 Rayos Facetados estilo Diamond Razor) */}
            <svg
              viewBox="0 0 140 140"
              className="absolute w-28 h-28 sm:w-36 sm:h-36 pointer-events-none"
              style={{
                animation: isSkyHovered
                  ? "celSunDialSpinClockwise 25s linear infinite"
                  : "celSunDialSpinClockwise 50s linear infinite",
                willChange: "transform"
              }}
            >
              <defs>
                <linearGradient id="sunRayGradDay" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#FFE082" stopOpacity="0.85" />
                  <stop offset="75%" stopColor={phase === "sunset" ? "#EA580C" : "#DFB755"} stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8A6717" stopOpacity="0" />
                </linearGradient>
              </defs>

              {Array.from({ length: 16 }).map((_, idx) => {
                const angle = idx * 22.5;
                const isMajor = idx % 2 === 0;
                return (
                  <g key={`sun-ray-${idx}`} transform={`rotate(${angle} 70 70)`}>
                    {isMajor ? (
                      // Rayo mayor facetado estilo navaja barber
                      <polygon
                        points="70,6 74,22 70,27 66,22"
                        fill="url(#sunRayGradDay)"
                        filter="drop-shadow(0 0 4px rgba(255,224,130,0.65))"
                      />
                    ) : (
                      // Rayo secundario de aguja
                      <line
                        x1="70"
                        y1="12"
                        x2="70"
                        y2="26"
                        stroke={phase === "sunset" ? "#FDBA74" : "#FFE082"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        opacity="0.75"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 4. Anillo de Precisión de Alta Relojería y Barbería VIP (Contrarrotatorio) */}
            <svg
              viewBox="0 0 140 140"
              className="absolute w-28 h-28 sm:w-36 sm:h-36 pointer-events-none"
              style={{
                animation: isSkyHovered
                  ? "celSunDialSpinCounter 18s linear infinite"
                  : "celSunDialSpinCounter 36s linear infinite",
                willChange: "transform"
              }}
            >
              <defs>
                <linearGradient id="sunBevelGradDay" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9E6" />
                  <stop offset="50%" stopColor="#DFB755" />
                  <stop offset="100%" stopColor="#8A6717" />
                </linearGradient>
              </defs>

              {/* Anillo graduado con micro-ticks */}
              <circle
                cx="70"
                cy="70"
                r="41"
                fill="none"
                stroke="url(#sunBevelGradDay)"
                strokeWidth="0.9"
                strokeDasharray="1.5 5.6"
                opacity="0.7"
              />

              {/* 4 Puntos cardinales de diamante */}
              {[0, 90, 180, 270].map((deg) => (
                <polygon
                  key={`cardinal-sun-${deg}`}
                  points="70,26 72.5,29 70,32 67.5,29"
                  fill="#FFF9E6"
                  transform={`rotate(${deg} 70 70)`}
                  filter="drop-shadow(0 0 3px rgba(255,255,255,0.9))"
                />
              ))}
            </svg>

            {/* 5. Núcleo Solar Glassmórfico Tridimensional con Relieve Especular */}
            <div
              className={`relative w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-108 active:scale-95 shadow-[0_0_35px_rgba(255,224,130,0.7),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-4px_8px_rgba(138,103,23,0.65)] ${
                phase === "sunset"
                  ? "bg-gradient-to-tr from-[#9A3412] via-[#F97316] to-[#FED7AA]"
                  : phase === "afternoon"
                  ? "bg-gradient-to-tr from-[#B8860B] via-[#DFB755] to-[#FFFFFF]"
                  : "bg-gradient-to-tr from-[#C59835] via-[#DFB755] to-[#FFF6D1]"
              }`}
            >
              {/* Brillo especular cóncavo superior 3D */}
              <div className="absolute top-1.5 left-2.5 right-2.5 h-4 rounded-full bg-gradient-to-b from-white/75 to-transparent pointer-events-none" />

              {/* Icono central temático según la fase */}
              {phase === "morning" && (
                <div className="relative flex items-center justify-center">
                  <Sunrise className="w-9 h-9 sm:w-10 sm:h-10 text-[#422B00] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]" strokeWidth={2.4} />
                </div>
              )}
              {phase === "afternoon" && (
                <div className="relative flex items-center justify-center">
                  <Sun className="w-10 h-10 sm:w-11 sm:h-11 text-[#422B00] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]" strokeWidth={2.4} />
                </div>
              )}
              {phase === "sunset" && (
                <div className="relative flex items-center justify-center">
                  <Sunset className="w-9 h-9 sm:w-10 sm:h-10 text-[#3C1400] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]" strokeWidth={2.4} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CelestialAtmosphereCanvasComponent);

