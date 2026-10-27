import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Truck,
  X,
  Sparkles
} from "lucide-react";
import { playHeavyStampSound } from "../../utils/barberAudioEffects";

export default function WarehouseAuditStampEffect({
  isOpen,
  onClose,
  data = null
}) {
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStamped(false);

      // 1. Estampar con mazo pesado al 0.45s
      const timerStamp = setTimeout(() => {
        setStamped(true);
        playHeavyStampSound();

        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { x: 0.5, y: 0.4 },
            colors: ["#DFB755", "#E8C466", "#10B981", "#FFFFFF"],
            scalar: 1.0,
            zIndex: 100010
          });
        } catch (e) {}
      }, 450);

      // 2. Auto-cierre extendido a 6.0s (suficiente tiempo para leer toda la información)
      const timerClose = setTimeout(() => {
        if (onClose) onClose();
      }, 6000);

      return () => {
        clearTimeout(timerStamp);
        clearTimeout(timerClose);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const isCargo = (data?.tipo_movimiento || "").toLowerCase().includes("cargo");
  const qty = Number(data?.cantidad_ajuste || data?.cantidad || 1);
  const stockAnterior = Number(data?.stock_anterior ?? 0);
  const stockNuevo = Number(
    data?.stock_nuevo ?? (isCargo ? stockAnterior + qty : Math.max(0, stockAnterior - qty))
  );

  const nowFormatted = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  const todayFormatted = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
        <motion.div
          animate={stamped ? { y: [-4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.22 }}
          className="relative flex flex-col items-center justify-center text-center w-full max-w-md pointer-events-auto"
        >
          {/* SELLO METÁLICO CAYENDO CON IMPACTO GRAVITACIONAL */}
          <div className="relative w-full h-28 flex items-center justify-center overflow-visible">
            {/* Sello descendiendo */}
            <motion.div
              initial={{ y: -180, scale: 1.6, opacity: 0 }}
              animate={stamped ? { y: 0, scale: 1, opacity: 1 } : { y: -180, opacity: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 24 }}
              className="z-30 drop-shadow-2xl"
            >
              {/* Estampa con borde de tinta tipo sello de lacre/auditoría */}
              <div
                className={`px-6 py-2.5 rounded-2xl border-4 font-black text-xs sm:text-sm tracking-wider uppercase rotate-[-5deg] shadow-2xl flex items-center gap-2 ${
                  isCargo
                    ? "border-emerald-500 bg-emerald-950/90 text-emerald-400 shadow-emerald-500/40"
                    : "border-rose-500 bg-rose-950/90 text-rose-400 shadow-rose-500/40"
                }`}
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>AUDITORÍA DE BODEGA OFICIAL</span>
              </div>
            </motion.div>
          </div>

          {/* TARJETA DETALLADA DE INFORMACIÓN DEL AJUSTE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={stamped ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="relative w-full rounded-3xl bg-card border border-border/60 shadow-2xl p-5 sm:p-6 space-y-4 text-left"
          >
            {/* Botón cerrar manual */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado: Título y Categoría */}
            <div className="pr-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DFB755] block">
                Movimiento Asentado en Bodega Central
              </span>
              <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 mt-0.5">
                <Package className="w-4 h-4 text-[#DFB755] shrink-0" />
                <span className="truncate">{data?.nombre || "Insumo de Bodega"}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {data?.categoria && (
                  <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[10px] font-bold">
                    {data.categoria}
                  </span>
                )}
                {data?.unidad_medida && (
                  <span className="px-2 py-0.5 rounded-md bg-[#DFB755]/10 text-[#DFB755] border border-[#DFB755]/20 text-[10px] font-bold">
                    {data.unidad_medida}
                  </span>
                )}
                {data?.proveedor_nombre && (
                  <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground text-[10px] flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {data.proveedor_nombre}
                  </span>
                )}
              </div>
            </div>

            {/* COMPARATIVA DE EVOLUCIÓN DE STOCK (ANTES ➔ DESPUÉS) */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Stock Anterior
                </span>
                <span className="text-base font-bold text-muted-foreground">
                  {stockAnterior} <span className="text-xs font-normal">uds</span>
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-2">
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full mb-0.5 flex items-center gap-1 ${
                    isCargo
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  }`}
                >
                  {isCargo ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isCargo ? `+${qty}` : `-${qty}`} uds
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Nuevo Stock Disponible
                </span>
                <span
                  className={`text-xl font-black ${
                    isCargo ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {stockNuevo} <span className="text-xs font-normal">uds</span>
                </span>
              </div>
            </div>

            {/* DETALLES DE AUDITORÍA EN CUADRÍCULA 2 COLUMNAS */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Tipo de Operación
                </span>
                <span
                  className={`font-black text-xs block mt-0.5 ${
                    isCargo ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {isCargo ? "Cargo por Ajuste (+)" : "Descargo por Ajuste (-)"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DFB755]" /> Fecha y Hora
                </span>
                <span className="font-bold text-foreground text-xs block mt-0.5">
                  {todayFormatted} • {nowFormatted}
                </span>
              </div>
            </div>

            {/* OBSERVACIONES / JUSTIFICACIÓN */}
            <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-[#DFB755]" />
                Observaciones del Movimiento:
              </span>
              <p className="text-foreground italic leading-relaxed text-[11px]">
                "{data?.observaciones || "Ajuste de inventario verificado en estantería central."}"
              </p>
            </div>

            {/* Botón de cierre o continuación */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md shadow-[#DDAE41]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continuar en Bodega</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
