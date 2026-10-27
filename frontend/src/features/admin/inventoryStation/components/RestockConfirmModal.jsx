import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertTriangle, Package, Clock, User, ArrowRight, MessageSquare } from "lucide-react";

export default function RestockConfirmModal({
  isOpen,
  onClose,
  stationItem,
  onConfirm,
  isSubmitting = false
}) {
  if (!isOpen || !stationItem) return null;

  const bodegaStock = Number(stationItem.stock_actual || 0);
  const days = stationItem.dias_en_estacion !== undefined ? stationItem.dias_en_estacion : (stationItem.dias_en_uso || 0);

  // Intentar extraer la cantidad solicitada por el barbero desde las notas o props
  const parseRequestedQty = () => {
    if (stationItem?.requestedQty) {
      return bodegaStock > 0 ? Math.min(Number(stationItem.requestedQty), bodegaStock) : Number(stationItem.requestedQty);
    }
    if (!stationItem?.notas) return 1;
    const match =
      stationItem.notas.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) ||
      stationItem.notas.match(/(\d+)\s*unidad/i);
    if (match && match[1]) {
      const q = parseInt(match[1], 10);
      return bodegaStock > 0 ? Math.min(q, bodegaStock) : q;
    }
    return 1;
  };

  const [cantidad, setCantidad] = useState(() => parseRequestedQty());
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    setCantidad(parseRequestedQty());
    setObservaciones("");
  }, [stationItem?.id_estacion_insumo, stationItem?.id_estacion_item]);

  const hasStock = bodegaStock >= cantidad;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasStock) return;
    onConfirm(stationItem, cantidad, observaciones);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Aprobar Reposición de Insumo</h3>
                <p className="text-xs text-muted-foreground">Descuento de stock en almacén y reinicio de semáforo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Resumen del insumo y barbero */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E8C466]" /> Barbero:
                </span>
                <span className="text-xs font-bold text-foreground">
                  {stationItem.barbero_nombre || "Barbero Asignado"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" /> Insumo:
                </span>
                <span className="text-xs font-extrabold text-foreground">
                  {stationItem.insumo_nombre}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Duración del ciclo anterior:
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {days === 0 ? "Hoy (0 días)" : `${days} días transcurridos`}
                </span>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Stock actual en bodega:</span>
                <span
                  className={`text-xs font-black ${
                    bodegaStock > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {bodegaStock} {stationItem.unidad_medida || "unidades"}
                </span>
              </div>

              {stationItem.notas && (
                <div className="pt-2 border-t border-border/40 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-extrabold text-[11px] block text-amber-400">Mensaje / Solicitud del Barbero:</span>
                    <span className="italic">{stationItem.notas}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Advertencia si no hay stock */}
            {!hasStock && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No hay stock suficiente en la bodega general para entregar este insumo. Por favor cargue mercancía de un proveedor antes de continuar.
                </span>
              </div>
            )}

            {/* Cantidad a entregar */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Cantidad a Entregar / Descontar:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, bodegaStock)}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E8C466]"
                />
                <span className="text-xs text-muted-foreground">
                  Quedarán en bodega: <strong className="text-foreground">{Math.max(0, bodegaStock - cantidad)}</strong> unidades
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Notas de Entrega (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Insumo nuevo entregado en estación 1"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-[#E8C466]"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!hasStock || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-lg shadow-[#DDAE41]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Procesando..." : "Confirmar Reposición"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
