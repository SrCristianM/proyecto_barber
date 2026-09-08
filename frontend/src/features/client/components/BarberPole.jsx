import { motion } from "motion/react";

/**
 * Componente de Poste de Barbería Retro Clásico Animado en SVG puro
 */
export default function BarberPole({ className = "w-6 h-12", animated = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 40 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-hidden"
      >
        <defs>
          {/* Degradado metálico dorado de las tapas superior e inferior */}
          <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C49733" />
            <stop offset="35%" stopColor="#F5D77F" />
            <stop offset="65%" stopColor="#E5B94E" />
            <stop offset="100%" stopColor="#9E761E" />
          </linearGradient>

          {/* Patrón de franjas en ángulo para animación de giro */}
          <pattern
            id="barberStripes"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* Franja roja */}
            <rect width="7" height="28" fill="#DC2626" />
            {/* Franja blanca */}
            <rect x="7" width="7" height="28" fill="#FFFFFF" />
            {/* Franja azul rey */}
            <rect x="14" width="7" height="28" fill="#2563EB" />
            {/* Franja dorada/blanca sutil */}
            <rect x="21" width="7" height="28" fill="#FFFFFF" />
          </pattern>

          {/* Sombra y brillo de cilindro de cristal */}
          <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="18%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="80%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
          </linearGradient>

          {/* Máscara del cilindro interno */}
          <clipPath id="cylinderClip">
            <rect x="10" y="18" width="20" height="54" rx="2" />
          </clipPath>
        </defs>

        {/* Tapa Superior Metálica (Bola y base) */}
        <circle cx="20" cy="8" r="4.5" fill="url(#brassGrad)" />
        <path d="M12 14 Q20 11 28 14 L30 18 Q20 16 10 18 Z" fill="url(#brassGrad)" />

        {/* Cilindro de Franjas Animadas */}
        <g clipPath="url(#cylinderClip)">
          {/* Fondo */}
          <rect x="10" y="18" width="20" height="54" fill="#FFFFFF" />

          {/* Animación continua en SVG nativo para 0 overhead */}
          <g>
            <rect x="-10" y="0" width="60" height="90" fill="url(#barberStripes)" opacity="0.95">
              {animated && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="0 28"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Reflejo y sombra cilíndrica de vidrio */}
          <rect x="10" y="18" width="20" height="54" fill="url(#glassReflection)" pointerEvents="none" />
        </g>

        {/* Borde del cilindro */}
        <rect
          x="10"
          y="18"
          width="20"
          height="54"
          rx="2"
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.8"
        />

        {/* Tapa Inferior Metálica */}
        <path d="M10 72 Q20 74 30 72 L28 77 Q20 79 12 77 Z" fill="url(#brassGrad)" />
        <circle cx="20" cy="81" r="3.5" fill="url(#brassGrad)" />
      </svg>
    </div>
  );
}
