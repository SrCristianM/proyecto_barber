import { useState, useRef, useCallback } from "react";
import { Sparkles, MoveHorizontal, Scissors } from "lucide-react";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transformaciones Reales</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Antes y Después
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Desliza la barra horizontal para ver el cambio de imagen realizado por nuestros maestros barberos.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border self-start sm:self-auto">
          <MoveHorizontal className="w-4 h-4 text-[#DFB755]" />
          <span>Arrastra para comparar</span>
        </div>
      </div>

      {/* Contenedor interactivo del slider */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg border border-border select-none cursor-ew-resize touch-none"
      >
        {/* IMAGEN DESPUÉS (Fondo completo) */}
        <img
          src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1000&auto=format&fit=crop&q=80"
          alt="Después del corte - Estilo finalizado"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider border border-white/20 shadow-md">
          ✨ Después
        </div>

        {/* IMAGEN ANTES (Capa recortada mediante clip-path) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80"
            alt="Antes del corte - Estilo previo"
            className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
          />
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider border border-white/20 shadow-md">
            ⏳ Antes
          </div>
        </div>

        {/* LÍNEA SEPARADORA Y BOTÓN DESLIZANTE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-2xl z-20 flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-10 h-10 rounded-full bg-black/90 border-2 border-[#DFB755] text-[#DFB755] shadow-xl flex items-center justify-center -ml-0.5">
            <MoveHorizontal className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
