import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  AlertTriangle,
  Ban,
  Package,
  Building2,
  Calendar,
  Layers,
  RotateCcw,
  MessageSquare
} from "lucide-react";

export default function CancelStockEntryModal({
  isOpen,
  onClose,
  entry,
  onConfirm,
  isSubmitting = false
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState(null);
  const [hasShake, setHasShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMotivo("");
      setError(null);
      setHasShake(false);
    }
  }, [isOpen]);

  if (!isOpen || !entry) return null;

  const triggerShake = () => {
    setHasShake(true);
    setTimeout(() => setHasShake(false), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = (motivo || "").trim();

    if (!clean) {
      setError("El motivo de la anulación es estrictamente obligatorio.");
      triggerShake();
      return;
    }

    if (clean.length < 5) {
      setError("Por favor ingresa una justificación más detallada (mínimo 5 caracteres).");
      triggerShake();
      return;
    }

    setError(null);
    onConfirm(entry.id_entrada, clean);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: hasShake ? [-10, 10, -8, 8, -4, 4, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-rose-500/40 shadow-2xl p-6"
        >

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Anular Entrada de Mercancía</h3>
                <p className="text-xs text-muted-foreground">
                  Comprobante #ENT-{String(entry.id_entrada).padStart(4, "0")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Resumen del movimiento a anular */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" /> Insumo:
                </span>
                <span className="font-bold text-foreground">{entry.insumo_nombre}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#DFB755]" /> Proveedor:
                </span>
                <span className="font-semibold text-foreground">{entry.proveedor_nombre}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-400" /> Cantidad a devolver/descontar:
                </span>
                <span className="font-black text-rose-400">
                  -{entry.cantidad_ingresada} {entry.unidad_medida || "unidades"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Fecha de ingreso original:
                </span>
                <span className="font-medium text-muted-foreground">
                  {new Date(entry.fecha_ingreso).toLocaleString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            {/* Advertencia obligatoria de auditoría */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="leading-relaxed text-[11px]">
                <strong className="block text-amber-300 font-bold mb-0.5">Control de Inventario y Auditoría:</strong>
                Se restará la cantidad del insumo en la Bodega Central. Esta entrada <strong>permanecerá visible</strong> en el historial marcada como <span className="font-bold text-rose-400">ANULADA</span> junto a tu justificación.
              </div>
            </div>

            {/* Campo OBLIGATORIO: Motivo de la anulación */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="motivo_anulacion" className="block text-xs font-bold text-foreground">
                  Motivo / Razón de la Anulación <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {motivo.length} caracteres (mín. 5)
                </span>
              </div>

              <div className="relative">
                <textarea
                  id="motivo_anulacion"
                  rows={3}
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ej: Factura duplicada por error, producto defectuoso devuelto al proveedor, error en cantidad digitada..."
                  className={`w-full p-3 rounded-2xl bg-background border text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 transition-all resize-none placeholder:text-muted-foreground/60 ${
                    error
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                      : "border-border/80 hover:border-border focus:border-rose-500 focus:ring-rose-500/20"
                  }`}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black shadow-lg shadow-rose-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban className="w-4 h-4" />
                <span>{isSubmitting ? "Anulando..." : "Confirmar Anulación"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
