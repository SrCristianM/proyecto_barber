import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scissors, Sparkles, FastForward } from "lucide-react";
import { playLeatherStropSound } from "../../utils/barberAudioEffects";

export default function LeatherStropBarberIntro({
  onComplete,
  barberName = "Barbero"
}) {
  const [step, setStep] = useState(0); // 0: stropping, 1: ready

  // Saludo dinámico según la hora del día
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "¡Buenos días", emoji: "🌅" };
    if (hour >= 12 && hour < 19) return { text: "¡Buenas tardes", emoji: "☀️" };
    return { text: "¡Buenas noches", emoji: "🌙" };
  }, []);

  useEffect(() => {
    // Iniciar sonido de asentado al 0.3s
    const timerSound = setTimeout(() => {
      playLeatherStropSound();
    }, 300);

    // Pasar a estado Listo al 1.3s
    const timerReady = setTimeout(() => {
      setStep(1);
    }, 1300);

    // Auto-cierre al 2.8s
    const timerFinish = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);

    return () => {
      clearTimeout(timerSound);
      clearTimeout(timerReady);
      clearTimeout(timerFinish);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        {/* Botón saltar */}
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer z-10"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Saltar</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center justify-center text-center max-w-sm"
        >
          {/* ILUSTRACIÓN DEL ASENTADOR DE CUERO (LEATHER STROP) */}
          <div className="relative w-48 h-64 flex items-center justify-center">
            {/* Gancho de latón superior */}
            <div className="absolute top-2 w-6 h-6 rounded-full border-4 border-[#DFB755] shadow-md -mb-1" />

            {/* Correa de Cuero Vintage */}
            <div className="w-20 h-52 rounded-xl bg-gradient-to-r from-[#3D2314] via-[#5C341D] to-[#2B180D] border-x-2 border-[#804928] shadow-2xl relative overflow-hidden flex flex-col justify-between py-2">
              <div className="w-full h-1 bg-[#804928]" />
              <span className="text-[7px] font-black uppercase tracking-widest text-[#DFB755]/60 text-center">
                Genuine Leather Strop
              </span>
              <div className="w-full h-1 bg-[#804928]" />
            </div>

            {/* Navaja subiendo y bajando rápidamente contra el cuero */}
            <motion.div
              animate={
                step === 0
                  ? {
                      y: [-40, 40, -40, 40, -20],
                      x: [-5, 5, -5, 5, 0],
                      rotate: [-5, 5, -5, 5, 0]
                    }
                  : { y: 0, scale: 1.15, rotate: 15 }
              }
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute z-20 drop-shadow-2xl"
            >
              <div className="flex items-center">
                {/* Mango en marfil/dorado */}
                <div className="w-16 h-3.5 bg-gradient-to-r from-[#DFB755] to-[#B38318] rounded-l-full border border-[#FFF2B2] shadow-md" />
                {/* Hoja de Acero */}
                <div className="w-24 h-5 bg-gradient-to-b from-white via-[#E2E8F0] to-[#94A3B8] rounded-r-md border-t border-white shadow-lg flex items-center justify-center">
                  <span className="text-[7px] font-black tracking-widest text-slate-500 uppercase">
                    BARBER STEEL
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* MENSAJE DE BIENVENIDA AL BARBERO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFB755]/15 border border-[#DFB755]/30 text-[#DFB755] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>¡HERRAMIENTAS AFILADAS Y LISTAS!</span>
            </div>

            <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5 flex-wrap">
              <span>{timeGreeting.text}, {barberName}!</span>
              <span>{timeGreeting.emoji}</span>
            </h3>
            <p className="text-xs text-white/70 max-w-xs">
              Bienvenido a tu estación. Herramientas afiladas y preparadas para tu jornada con máxima precisión.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
