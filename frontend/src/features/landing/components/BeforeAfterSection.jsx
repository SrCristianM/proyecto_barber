import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Scissors, Clock, ArrowLeftRight, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const BEFORE_IMG = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000";
const AFTER_IMG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000";

export default function BeforeAfterSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const positionPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(positionPercentage);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1 || e.type === "mousemove") {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-24 bg-[#0B0B0B] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-gold w-[450px] h-[450px] top-1/2 -left-20 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
            <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
              TRANSFORMACIONES REALES
            </span>
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
            El poder de un <span className="text-gold-gradient">cambio de look</span>
          </h2>
          <p className="text-[#8E8E93] text-sm mt-3">
            Desliza el control interactivo para apreciar la precisión y el detalle de nuestras transformaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Interactive Before/After Slider (7 cols) */}
          <div className="lg:col-span-7">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] group"
            >
              {/* After Image (Background layer) */}
              <div className="absolute inset-0 w-full h-full">
                <ImageWithFallback
                  src={AFTER_IMG}
                  alt="Resultado final del corte y barba"
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.9) contrast(1.05)" }}
                />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C9A24A]/60 text-[#C9A24A] text-[0.68rem] font-bold uppercase tracking-widest z-10 shadow-lg">
                  DESPUÉS ✨
                </div>
              </div>

              {/* Before Image (Foreground clipped layer) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <ImageWithFallback
                  src={BEFORE_IMG}
                  alt="Estado inicial antes del corte"
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.75) grayscale(30%)" }}
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#A0A0A0] text-[0.68rem] font-bold uppercase tracking-widest z-10 shadow-lg">
                  ANTES
                </div>
              </div>

              {/* Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#C9A24A] to-transparent shadow-[0_0_15px_#C9A24A]"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Drag Handle Button */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#C9A24A] text-black border-2 border-black flex items-center justify-center shadow-[0_0_20px_rgba(201,162,74,0.8)] cursor-grab active:cursor-grabbing">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
              </div>

              {/* Hint badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[#8E8E93] text-[0.68rem] font-medium pointer-events-none flex items-center gap-1.5">
                <span>👈 Arrastra para comparar 👉</span>
              </div>
            </div>
          </div>

          {/* Details & Action Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="p-7 rounded-2xl bg-[#141414] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
              <span className="px-3 py-1 rounded-full bg-[#C9A24A]/20 border border-[#C9A24A]/40 text-[#C9A24A] text-xs font-bold uppercase tracking-wider inline-block mb-3">
                CASO DESTACADO
              </span>
              
              <h3 className="text-white text-xl font-bold mb-2">
                Transformación Integral: Mid Fade + Ritual de Barba
              </h3>
              
              <p className="text-[#8E8E93] text-xs leading-relaxed mb-6">
                Cliente con crecimiento irregular y barba sin definición. Se aplicó visagismo para resaltar la línea de mandíbula y degradado medio afeitado a navaja.
              </p>

              <div className="space-y-2.5 border-t border-white/5 pt-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-[#B5B5B5]">
                  <Check className="w-4 h-4 text-[#C9A24A]" />
                  <span>Degradado Skin Fade con acabado mate</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#B5B5B5]">
                  <Check className="w-4 h-4 text-[#C9A24A]" />
                  <span>Perfilado simétrico a navaja y toalla tibia</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#B5B5B5]">
                  <Check className="w-4 h-4 text-[#C9A24A]" />
                  <span>Aceite de argán hidratante y bálsamo fijador</span>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 px-6 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#E0B85C] shadow-[0_0_20px_rgba(201,162,74,0.3)] transition-all duration-300"
              >
                <span>QUIERO UNA TRANSFORMACIÓN ASÍ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
