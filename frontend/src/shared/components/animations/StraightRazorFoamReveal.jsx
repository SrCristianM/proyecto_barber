import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  DollarSign,
  CheckCircle2,
  X,
  CreditCard,
  FileCheck,
  Receipt,
  Sparkles
} from "lucide-react";
import { playRazorSwishSound } from "../../utils/barberAudioEffects";

export default function StraightRazorFoamReveal({
  isOpen,
  onClose,
  saleData = null
}) {
  const [sliceProgress, setSliceProgress] = useState("waiting"); // 'waiting' | 'slicing' | 'revealed'

  useEffect(() => {
    if (isOpen) {
      setSliceProgress("waiting");

      // 1. Iniciar deslizamiento de la navaja a los 0.65s (permite apreciar la espuma)
      const timerStartSlice = setTimeout(() => {
        setSliceProgress("slicing");
        playRazorSwishSound();
      }, 650);

      // 2. Revelar comprobante al 1.6s y lanzar destellos de confeti
      const timerReveal = setTimeout(() => {
        setSliceProgress("revealed");
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#DFB755", "#E8C466", "#10B981", "#FFFFFF"],
            scalar: 1.0,
            zIndex: 100010
          });
        } catch (e) {}
      }, 1600);

      return () => {
        clearTimeout(timerStartSlice);
        clearTimeout(timerReveal);
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const data = saleData || {
    id_venta: 82,
    total: 45000,
    metodo_pago: "Efectivo",
    cliente_nombre: "Cliente General",
    barbero_nombre: "Carlos Rodríguez",
    fecha: new Date().toLocaleDateString("es-CO")
  };

  const isSlicing = sliceProgress === "slicing" || sliceProgress === "revealed";
  const isRevealed = sliceProgress === "revealed";

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl p-6 text-center"
        >
          {/* Botón cerrar sólo activo al revelarse el comprobante */}
          {isRevealed && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer z-30"
              title="Cerrar comprobante"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* ÁREA DE ANIMACIÓN: ESPUMA Y CORTE DE NAVAJA */}
          <div className="relative min-h-[330px] flex flex-col justify-center overflow-hidden rounded-2xl">
            {/* Navaja Barbera: Se desliza suavemente y sale 100% de la pantalla sin dejar residuos */}
            <motion.div
              initial={{ x: "-160%", y: "-90%", rotate: -25, opacity: 0 }}
              animate={
                isSlicing
                  ? {
                      x: ["-160%", "15%", "290%"],
                      y: ["-90%", "0%", "180%"],
                      rotate: [-25, -20, -15],
                      opacity: [1, 1, 0]
                    }
                  : { opacity: 0 }
              }
              transition={{
                duration: 1.35,
                times: [0, 0.45, 1],
                ease: "easeInOut"
              }}
              className="absolute z-40 pointer-events-none drop-shadow-2xl"
              style={{ display: isRevealed ? "none" : "block" }}
            >
              {/* Ilustración de Navaja Barbera Clásica con Hoja Metálica Plateada y Mango de Ébano */}
              <div className="flex items-center">
                {/* Mango en madera noble oscura */}
                <div className="w-24 h-4 bg-gradient-to-r from-[#21140A] via-[#4A2D19] to-[#120B05] rounded-l-full border border-amber-950 shadow-md" />
                {/* Remache pasador dorado */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#DFB755] border border-black -ml-1 z-10 shadow" />
                {/* Hoja de Acero Inoxidable con filo brillante */}
                <div className="w-32 h-6 bg-gradient-to-b from-white via-[#E2E8F0] to-[#94A3B8] rounded-r-md border-t border-r border-white shadow-lg flex items-center justify-end pr-3">
                  <span className="text-[7px] font-black tracking-widest text-slate-500 uppercase">
                    TU TURNO STEEL
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Capa de Espuma Suave que se desvanece al paso de la navaja */}
            <AnimatePresence>
              {!isRevealed && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55 }}
                  className="absolute inset-0 z-20 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-200 shadow-inner"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-slate-700/80 shadow-md flex items-center justify-center mb-3">
                    <Receipt className="w-7 h-7 text-[#DFB755] animate-pulse" />
                  </div>
                  <h4 className="text-base font-black tracking-wide text-foreground">
                    Cerrando Cobro en Caja...
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#DFB755]" />
                    Generando comprobante de pago
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CONTENIDO REVELADO: COMPROBANTE DE PAGO LIMPIO (100% VISIBLE SIN OBSTRUCCIONES) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={isRevealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-4 pt-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/15">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">
                  Cobro Registrado
                </span>
                <h3 className="text-3xl font-black text-foreground mt-0.5">
                  ${Number(data.total || 0).toLocaleString("es-CO")}
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID Recibo:</span>
                  <span className="font-mono font-bold text-foreground">
                    #REC-{String(data.id_venta || 0).padStart(4, "0")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">
                    {data.cliente_nombre || "Cliente General"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-bold text-[#DFB755] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    {data.metodo_pago || "Efectivo"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md shadow-[#DDAE41]/20 transition-all cursor-pointer"
              >
                Cerrar Comprobante
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
