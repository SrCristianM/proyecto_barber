import { motion, AnimatePresence } from "motion/react";
import {
  X,
  FileText,
  Calendar,
  Package,
  Building2,
  DollarSign,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Layers,
  FileQuestion,
  RotateCcw
} from "lucide-react";

export default function StockEntryDetailsModal({
  isOpen,
  onClose,
  entry,
  onOpenCancel
}) {
  if (!isOpen || !entry) return null;

  const isAnulada = Number(entry.estado) === 0;
  const totalCost = Number(entry.cantidad_ingresada || 0) * Number(entry.costo_unitario || 0);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "No registrada";
    try {
      return new Date(dateStr).toLocaleString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isAnulada
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                }`}
              >
                {isAnulada ? <Ban className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">Detalle de Entrada de Mercancía</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isAnulada
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {isAnulada ? (
                      <>
                        <Ban className="w-2.5 h-2.5" />
                        ANULADA
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        ACTIVA
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comprobante #ENT-{String(entry.id_entrada).padStart(4, "0")} • Almacén General
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Banner destacado si la entrada está ANULADA */}
            {isAnulada && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Entrada Anulada en el Sistema</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Fecha de anulación:</strong> {formatDateTime(entry.fecha_anulacion)}
                  </p>
                  <div className="p-2.5 rounded-xl bg-background/60 border border-rose-500/20 text-foreground font-medium italic">
                    "{entry.motivo_anulacion || "Sin motivo registrado"}"
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    ✓ La cantidad ingresada ({entry.cantidad_ingresada} {entry.unidad_medida}) fue descontada automáticamente del inventario central para restaurar el balance original.
                  </p>
                </div>
              </div>
            )}

            {/* Grid de información principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Insumo */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Package className="w-3.5 h-3.5 text-cyan-400" /> Insumo Ingresado
                </span>
                <p className="text-sm font-bold text-foreground">{entry.insumo_nombre}</p>
                <p className="text-[11px] text-muted-foreground">Unidad: {entry.unidad_medida || "Unidad"}</p>
              </div>

              {/* Proveedor */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#DFB755]" /> Proveedor
                </span>
                <p className="text-sm font-bold text-foreground">{entry.proveedor_nombre}</p>
                <p className="text-[11px] text-muted-foreground">ID Proveedor: #{entry.id_proveedor}</p>
              </div>

              {/* Cantidad Ingresada */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Cantidad
                </span>
                <p
                  className={`text-base font-black ${
                    isAnulada ? "line-through text-muted-foreground" : "text-cyan-400"
                  }`}
                >
                  +{entry.cantidad_ingresada} {entry.unidad_medida || "unidades"}
                </p>
                {isAnulada && (
                  <span className="text-[10px] text-rose-400 font-semibold block">
                    (Revertido / Descontado de bodega)
                  </span>
                )}
              </div>

              {/* Costos */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Costos
                </span>
                <p className="text-xs font-semibold text-foreground">
                  Unitario: <span className="text-emerald-400 font-bold">${Number(entry.costo_unitario || 0).toLocaleString("es-CO")}</span>
                </p>
                <p className="text-xs font-black text-foreground pt-0.5">
                  Total: <span className="text-emerald-400 font-extrabold">${totalCost.toLocaleString("es-CO")}</span>
                </p>
              </div>
            </div>

            {/* Fecha de ingreso */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#DFB755]" /> Fecha y Hora de Ingreso
              </span>
              <p className="text-xs font-bold text-foreground">{formatDateTime(entry.fecha_ingreso)}</p>
            </div>

            {/* Observaciones registradas */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1">
                <FileQuestion className="w-3.5 h-3.5 text-muted-foreground" /> Observaciones de Registro
              </span>
              <p className="text-xs text-foreground italic">
                {entry.observaciones || "Sin observaciones adicionales"}
              </p>
            </div>
          </div>

          {/* Footer y Acciones */}
          <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-border/60">
            <div>
              {!isAnulada && onOpenCancel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCancel(entry);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Anular Esta Entrada</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
