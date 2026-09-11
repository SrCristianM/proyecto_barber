import { motion } from "motion/react";

export default function BarberPoleIndicator({ variant = "gold", label = "En Turno", showPulse = true }) {
  const isGold = variant === "gold";

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 dark:bg-card/80 border border-[#DFB755]/30 backdrop-blur-xs shadow-inner">
      {/* Mini Barber Pole Cylinder */}
      <div className="relative w-3.5 h-6 rounded-full overflow-hidden border border-[#E8C466]/70 shadow-xs flex flex-col justify-between items-center py-0.5 bg-background">
        {/* Top metallic cap */}
        <div className="w-2.5 h-1 rounded-xs bg-gradient-to-r from-[#DFB755] via-amber-200 to-[#996515] z-10 shrink-0" />
        
        {/* Animated striped cylinder body */}
        <div className={`absolute inset-0 w-full h-full ${isGold ? "barber-pole-cylinder" : "barber-pole-classic"} opacity-95`} />
        
        {/* Glass reflection highlight */}
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/40 to-transparent pointer-events-none z-10" />

        {/* Bottom metallic cap */}
        <div className="w-2.5 h-1 rounded-xs bg-gradient-to-r from-[#DFB755] via-amber-200 to-[#996515] z-10 shrink-0" />
      </div>

      {label && (
        <span className="text-[11px] font-black uppercase tracking-wider text-[#DFB755] select-none flex items-center gap-1.5">
          {label}
          {showPulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFB755] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DFB755]" />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
