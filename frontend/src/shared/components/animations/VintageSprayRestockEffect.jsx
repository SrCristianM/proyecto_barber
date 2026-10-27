import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { playSprayPumpSound } from "../../utils/barberAudioEffects";

export default function VintageSprayRestockEffect({
  isOpen,
  onClose,
  barberName = "Barbero",
  itemCount = 1
}) {
  const [sprayState, setSprayState] = useState("entering"); // 'entering' | 'spraying' | 'done'

  useEffect(() => {
    if (isOpen) {
      setSprayState("entering");

      // 1. Presionar spray al 0.5s
      const timerSpray = setTimeout(() => {
        setSprayState("spraying");
        playSprayPumpSound();
      }, 500);

      // 2. Transición final al 1.6s
      const timerDone = setTimeout(() => {
        setSprayState("done");
      }, 1600);

      // 3. Auto-cierre al 3.2s
      const timerClose = setTimeout(() => {
        if (onClose) onClose();
      }, 3200);

      return () => {
        clearTimeout(timerSpray);
        clearTimeout(timerDone);
        clearTimeout(timerClose);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative flex flex-col items-center justify-center text-center"
        >
          {/* ILUSTRACIÓN DEL ATOMIZADOR VINTAGE DE VIDRIO CON PERA DE GOMA */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Pera de Goma (Bulb) */}
            <motion.div
              animate={
                sprayState === "spraying"
                  ? { scaleX: 0.65, scaleY: 0.9, x: 8 }
                  : { scaleX: 1, scaleY: 1, x: 0 }
              }
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute -left-3 top-6 w-12 h-12 rounded-full bg-gradient-to-r from-[#262626] to-[#171717] border-2 border-[#404040] shadow-xl z-20 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#DFB755] opacity-60" />
            </motion.div>

            {/* Boquilla de Bronce */}
            <div className="absolute left-6 top-10 w-8 h-3.5 bg-gradient-to-b from-[#FFF2B2] via-[#E8C466] to-[#99731E] rounded-md shadow z-10" />

            {/* Frasco de Vidrio Labrado Ámbar */}
            <div className="relative w-20 h-24 rounded-3xl bg-gradient-to-b from-[#E8C466]/40 via-[#B38318]/50 to-[#594008]/80 border-2 border-[#E8C466]/60 backdrop-blur-xs shadow-2xl flex flex-col items-center justify-center p-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full border border-[#FFF2B2]/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FFF2B2] animate-pulse" />
              </div>
              <span className="text-[7px] font-black tracking-widest text-[#FFF2B2] uppercase mt-1">
                Lotion Barbers
              </span>
            </div>

            {/* NUBE DE PARTICULAS Y ROCÍO PULVERIZADO */}
            <AnimatePresence>
              {sprayState === "spraying" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.2, x: 20 }}
                  animate={{ opacity: 1, scale: 2.2, x: 120 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute right-0 top-6 w-32 h-32 pointer-events-none"
                >
                  {/* Gotas de rocío doradas estilizadas */}
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[#DFB755]/60 via-[#E8C466]/40 to-transparent blur-md" />
                  <div className="absolute inset-2 rounded-full bg-[#FFF2B2]/50 blur-xs animate-ping" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MENSAJE DE REPOSICIÓN COMPLETADA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 rounded-3xl bg-card/90 border border-emerald-500/40 shadow-2xl backdrop-blur-md max-w-sm pointer-events-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>¡PUESTO REABASTECIDO Y SEMÁFORO EN VERDE!</span>
            </div>

            <h4 className="text-base font-black text-foreground">
              Estación de {barberName}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Se han despachado {itemCount} {itemCount === 1 ? "insumo" : "insumos"} desde bodega central.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
