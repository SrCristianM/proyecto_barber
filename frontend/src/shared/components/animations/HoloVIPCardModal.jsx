import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Award, Star, Shield, QrCode } from "lucide-react";
import { playHoloShimmerSound } from "../../utils/barberAudioEffects";

export default function HoloVIPCardModal({
  isOpen,
  onClose,
  client = null
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      playHoloShimmerSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const data = client || {
    nombre: "Cliente Registrado",
    nivel: "Nuevo",
    puntos: 0,
    visitas: 0,
    descuento: "Acumulación de puntos activos",
    fechaMiembro: "Miembro del Club"
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md p-6 text-center"
        >
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-0 right-2 p-2 rounded-xl text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFB755]/20 border border-[#DFB755]/40 text-[#FFF2B2] text-xs font-black mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#DFB755]" />
              <span>MEMBRESÍA EXCLUSIVA TU TURNO BARBER</span>
            </span>
            <p className="text-[11px] text-white/60">
              Mueve el cursor sobre la tarjeta para apreciar el efecto holográfico 3D
            </p>
          </div>

          {/* TARJETA 3D HOLOGRÁFICA */}
          <div
            style={{ perspective: 1000 }}
            className="flex justify-center cursor-pointer"
          >
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-sm h-56 rounded-3xl p-6 overflow-hidden border-2 border-[#DFB755]/70 shadow-2xl flex flex-col justify-between text-left select-none"
              style={{
                background:
                  "linear-gradient(135deg, #1C1917 0%, #292524 40%, #44403C 70%, #1C1917 100%)",
                boxShadow: "0 25px 50px -12px rgba(223, 183, 85, 0.35)"
              }}
            >
              {/* Brillo holográfico móvil */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-all"
                style={{
                  background: `radial-gradient(circle at ${50 + rotateY * 3}% ${
                    50 - rotateX * 3
                  }%, rgba(255,242,178,0.8), rgba(223,183,85,0.4) 40%, transparent 70%)`
                }}
              />

              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h4 className="text-lg font-black tracking-wider text-white">
                    TU TURNO <span className="text-[#DFB755]">VIP</span>
                  </h4>
                  <span className="text-[10px] text-white/60 tracking-widest uppercase">
                    Club de Fidelidad de Caballeros
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#DFB755]/30 border border-[#DFB755] text-[10px] font-black text-[#FFF2B2] flex items-center gap-1 shadow">
                  <Award className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span>{data.nivel}</span>
                </div>
              </div>

              {/* Centro: Chip y puntos */}
              <div className="flex items-center justify-between relative z-10 my-auto">
                <div className="w-10 h-7 rounded-lg bg-gradient-to-tr from-[#E8C466] to-[#FFF2B2] border border-[#B38318] shadow-inner flex items-center justify-center">
                  <div className="w-6 h-4 border border-[#8C6415]/40 rounded-sm" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/60 uppercase font-bold block">
                    Puntos Acumulados
                  </span>
                  <span className="text-xl font-black text-[#FFF2B2] tracking-wide">
                    {Number(data.puntos ?? 0)} <span className="text-xs text-white/70">pts</span>
                  </span>
                </div>
              </div>

              {/* Footer de la tarjeta */}
              <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
                <div>
                  <span className="text-sm font-bold text-white block truncate max-w-[180px]">
                    {data.nombre}
                  </span>
                  <span className="text-[10px] text-[#DFB755] font-semibold block">
                    {data.descuento}
                  </span>
                </div>
                <div className="p-1 rounded-lg bg-white/10 backdrop-blur-xs text-white/80">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-lg shadow-[#DDAE41]/25 transition-all cursor-pointer"
            >
              Cerrar Tarjeta
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
