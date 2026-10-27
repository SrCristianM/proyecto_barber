import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Poste de Barbería Clásico Animado con Iluminación Inteligente Día/Noche
 * - Franjas continuas matemáticamente perfectas (sin tirones, sin cortes y sin zonas vacías).
 * - Rotación constante con velocidad lineal fluida.
 * - En la noche: Enciende una bombilla vintage superior con filamento cálido y cono de luz.
 * - Al hacer clic y de forma automática periódica: Aceleración turbo con destello de bombilla y burbujas de afeitado + destellos de navaja.
 */
export default function CelestialBarberPole({
  className = "w-10 h-24",
  isNight = false,
  animated = true
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [sparks, setSparks] = useState([]);

  // Paleta clásica de barbería: Rojo carmesí, Blanco puro, Azul real y Oro metálico
  const colors = useMemo(() => ["#DC2626", "#FFFFFF", "#2563EB", "#DFB755"], []);
  const dY = 7; // Distancia exacta entre franjas
  const period = 28; // 4 colores * 7px = 28px de período exacto vertical

  // Generamos suficientes franjas continuas para cubrir holgadamente el cilindro (18 a 72)
  // Rango de i: de -8 a 16 (desde y=-56 hasta y=112), más del triple de la altura necesaria
  const stripes = useMemo(() => {
    const list = [];
    for (let i = -8; i <= 16; i++) {
      const baseY = i * dY;
      const color = colors[((i % 4) + 4) % 4];
      list.push(
        <line
          key={`stripe-${i}`}
          x1="8"
          y1={baseY}
          x2="32"
          y2={baseY + 16}
          stroke={color}
          strokeWidth="5.5"
          strokeLinecap="square"
        />
      );
    }
    return list;
  }, [colors]);

  // Disparador del efecto Turbo + Destello de filamento + Burbujas de barbero
  const triggerTurbo = useCallback((isManual = false) => {
    // Activar modo turbo por 1.8 segundos
    setIsTurbo(true);
    setTimeout(() => setIsTurbo(false), 1800);

    // Generar burbujas de espuma de afeitar y destellos de corte que flotan hacia arriba
    const now = Date.now();
    const newSparks = [];
    const symbols = ["🫧", "✨", "✂️", "✦", "🫧", "⭐"];

    for (let i = 0; i < 9; i++) {
      newSparks.push({
        id: `${now}-${i}`,
        x: (Math.random() - 0.5) * 50,
        y: -(Math.random() * 55 + 35),
        symbol: symbols[i % symbols.length],
        size: Math.random() * 6 + 13,
        rotate: (Math.random() - 0.5) * 90,
        duration: Math.random() * 0.4 + 1.0,
        delay: Math.random() * 0.15
      });
    }

    setSparks(newSparks);
    setTimeout(() => setSparks([]), 1600);
  }, []);

  // Manejador del clic interactivo
  const handleClick = (e) => {
    e.stopPropagation();
    triggerTurbo(true);
  };

  // Disparo automático del efecto turbo de vez en cuando (armónico y balanceado)
  useEffect(() => {
    if (!animated) return;

    // Disparo inicial a los 8 segundos (desfasado del pulso lunar inicial de 4.5s)
    const initialTimer = setTimeout(() => {
      triggerTurbo(false);
    }, 8000);

    // Ciclo recurrente cada 28 segundos (de vez en cuando)
    const interval = setInterval(() => {
      triggerTurbo(false);
    }, 28000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [animated, triggerTurbo]);

  return (
    <motion.div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        rotate: isTurbo ? [-3, 3, -3, 3, -1, 1, 0] : 0,
        scale: isTurbo ? [1, 1.08, 1] : isHovered ? 1.05 : 1
      }}
      transition={{
        rotate: { duration: 0.5, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 400, damping: 20 }
      }}
      className={`relative inline-flex flex-col items-center justify-center shrink-0 cursor-pointer select-none ${className}`}
      title={
        isNight
          ? "Farol Nocturno de Barbería • Haz clic para giro turbo y burbujas"
          : "Poste Clásico de Barbería • Haz clic para giro turbo y burbujas"
      }
    >
      {/* BURBUJAS DE AFEITADO Y DESTELLOS FLOTANTES AL CLIC */}
      <AnimatePresence>
        {sparks.map((sp) => (
          <motion.div
            key={sp.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5, rotate: 0 }}
            animate={{
              opacity: [1, 0.9, 0],
              x: sp.x,
              y: sp.y,
              scale: [0.5, 1.2, 0.8],
              rotate: sp.rotate
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: sp.duration,
              delay: sp.delay,
              ease: "easeOut"
            }}
            className="absolute -top-3 z-40 pointer-events-none select-none text-center"
            style={{ fontSize: `${sp.size}px` }}
          >
            {sp.symbol}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 1. LUZ VINTAGE NOCTURNA (FAROL SUPERIOR ENCENDIDO) */}
      {(isNight || isTurbo) && (
        <div className="absolute -top-6 flex flex-col items-center pointer-events-none z-30">
          {/* Bombilla esférica con filamento cálido */}
          <motion.div
            animate={{
              scale: isTurbo ? [1, 1.45, 1.15, 1] : 1,
              boxShadow: isTurbo
                ? "0 0 28px rgba(253,224,71,1)"
                : "0 0 16px rgba(253,224,71,0.9)"
            }}
            transition={{ duration: 0.4 }}
            className="relative w-4 h-4 rounded-full bg-gradient-to-b from-[#FFFBEB] via-[#FDE047] to-[#DFB755] border border-white/70 flex items-center justify-center"
          >
            {/* Filamento incandescente */}
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </motion.div>

          {/* Halo cónico descendente sobre el cilindro */}
          <div
            className="w-16 h-28 pointer-events-none -mt-1 opacity-75"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(253, 224, 71, 0.4) 0%, rgba(223, 183, 85, 0.15) 50%, transparent 80%)"
            }}
          />
        </div>
      )}

      {/* 2. SVG DEL POSTE CON REFLEJOS EN VIDRIO Y GIRO CONTINUO FLUIDO */}
      <svg
        viewBox="0 0 40 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl overflow-visible relative z-20"
      >
        <defs>
          {/* Degradado metálico dorado de tapas superior e inferior */}
          <linearGradient id="brassMetallic" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8A6717" />
            <stop offset="25%" stopColor="#FFE082" />
            <stop offset="60%" stopColor="#DFB755" />
            <stop offset="100%" stopColor="#664600" />
          </linearGradient>

          {/* Reflejo y profundidad 3D del cilindro de cristal */}
          <linearGradient id="glass3DReflection" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0.75)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="80%" stopColor="rgba(0,0,0,0.12)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </linearGradient>

          {/* Máscara de recorte exacta para el cilindro de vidrio */}
          <clipPath id="cylinderClipExact">
            <rect x="10" y="18" width="20" height="54" rx="2" />
          </clipPath>
        </defs>

        {/* Tapa Superior Metálica */}
        <circle cx="20" cy="8" r="4.5" fill="url(#brassMetallic)" />
        <path d="M12 14 Q20 11 28 14 L30 18 Q20 16 10 18 Z" fill="url(#brassMetallic)" />

        {/* Sombra de la base */}
        <ellipse cx="20" cy="86" rx="11" ry="2" fill="rgba(0,0,0,0.35)" />

        {/* Soporte de montaje vintage izquierdo */}
        <path d="M10 24 H4 V27 H10 Z" fill="url(#brassMetallic)" opacity="0.9" />
        <path d="M10 65 H4 V68 H10 Z" fill="url(#brassMetallic)" opacity="0.9" />
        <rect x="2" y="20" width="3" height="52" rx="1.5" fill="#4D3200" opacity="0.8" />

        {/* Cilindro de vidrio exterior con reborde metálico */}
        <rect
          x="9"
          y="17"
          width="22"
          height="56"
          rx="3"
          stroke="url(#brassMetallic)"
          strokeWidth="1.5"
          fill="#1E232D"
        />

        {/* INTERIOR GIRATORIO CONTINUO CON MÁSCARA
            Totalmente cubierto por encima y por debajo para garantizar que NUNCA quede gris */}
        <g clipPath="url(#cylinderClipExact)">
          {/* Fondo blanco base para el cilindro */}
          <rect x="10" y="18" width="20" height="54" fill="#FFFFFF" />

          {/* Franjas diagonales continuas con traslación matemática perfecta */}
          {animated ? (
            <motion.g
              animate={{ y: [0, period] }}
              transition={{
                duration: isTurbo ? 0.45 : isHovered ? 1.1 : 2.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {stripes}
            </motion.g>
          ) : (
            <g>{stripes}</g>
          )}

          {/* Sombra y profundidad 3D del vidrio */}
          <rect
            x="10"
            y="18"
            width="20"
            height="54"
            fill="url(#glass3DReflection)"
            pointerEvents="none"
          />

          {/* Brillo especular longitudinal en el cristal */}
          <rect
            x="12"
            y="19"
            width="2.5"
            height="52"
            rx="1"
            fill="rgba(255,255,255,0.4)"
            pointerEvents="none"
          />

          {/* Destello solar cruzado en modo día */}
          {!isNight && (
            <motion.rect
              x="8"
              y="18"
              width="24"
              height="8"
              fill="rgba(255,255,255,0.45)"
              transform="rotate(-20 20 45)"
              animate={{ y: [0, 50, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* Tapa Inferior Metálica */}
        <path d="M10 72 Q20 74 30 72 L28 76 Q20 79 12 76 Z" fill="url(#brassMetallic)" />
        <circle cx="20" cy="81" r="3.5" fill="url(#brassMetallic)" />
      </svg>
    </motion.div>
  );
}
