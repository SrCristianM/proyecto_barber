import { motion } from "motion/react";

/**
 * Indicador de Nivel Tipo Cápsula de Líquido con reflejo de cristal y gradiente fluido
 */
export default function LiquidLevelIndicator({
  current = 0,
  max = 100,
  min = 10,
  size = "md", // 'sm' | 'md' | 'lg'
  showBadge = true,
  unit = "un."
}) {
  const safeCurrent = Math.max(0, Number(current) || 0);
  const safeMax = Math.max(1, Number(max) || 1);
  const percent = Math.min(Math.round((safeCurrent / safeMax) * 100), 100);

  // Determinar paleta según el estado de abastecimiento
  let fluidGradient = "from-emerald-500 via-teal-400 to-emerald-600";
  let fluidGlow = "shadow-[0_0_12px_rgba(16,185,129,0.5)]";
  let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  let statusText = "Óptimo";

  if (safeCurrent <= Number(min) || percent <= 20) {
    fluidGradient = "from-rose-500 via-rose-400 to-red-600";
    fluidGlow = "shadow-[0_0_14px_rgba(244,63,94,0.7)]";
    badgeColor = "text-rose-400 bg-rose-500/15 border-rose-500/30 glow-pulse-red";
    statusText = "Bajo Stock";
  } else if (percent <= 45) {
    fluidGradient = "from-amber-500 via-[#E8C466] to-amber-600";
    fluidGlow = "shadow-[0_0_12px_rgba(245,158,11,0.55)]";
    badgeColor = "text-amber-400 bg-amber-500/15 border-amber-500/30 glow-pulse-amber";
    statusText = "Medio";
  }

  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-3.5" : "h-2.5";

  return (
    <div className="w-full space-y-1.5">
      {showBadge && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
            <span>Nivel de Bodega:</span>
            <strong className="text-foreground font-mono">{safeCurrent} {unit}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${badgeColor}`}>
            {percent}% · {statusText}
          </span>
        </div>
      )}

      {/* Cápsula de Cristal */}
      <div
        className={`relative w-full ${heightClass} rounded-full bg-neutral-200/80 dark:bg-black/50 border border-neutral-300 dark:border-white/15 p-[1px] overflow-hidden backdrop-blur-xs`}
        title={`Stock: ${safeCurrent} / ${safeMax} (${percent}%)`}
      >
        {/* Reflejo brillante de cristal superior */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none z-10" />

        {/* Líquido animado constantemente con movimiento fluido */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${fluidGradient} ${fluidGlow} animate-liquid-flow relative transition-all overflow-hidden`}
        >
          {/* Ola de brillo y movimiento constante a través del líquido */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full pointer-events-none animate-liquid-shimmer" />

          {/* Menisco / Brillo dinámico en el extremo del líquido */}
          <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/60 blur-[0.5px] rounded-r-full" />
        </motion.div>
      </div>
    </div>
  );
}
