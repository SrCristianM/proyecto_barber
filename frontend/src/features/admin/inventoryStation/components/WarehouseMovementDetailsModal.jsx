import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  Tag,
  CheckCircle2
} from "lucide-react";

export default function WarehouseMovementDetailsModal({
  isOpen,
  onClose,
  movement = null
}) {
  if (!isOpen || !movement) return null;

  const isCargo = (movement.tipo_movimiento || "").toLowerCase().includes("cargo");
  const qty = Number(movement.cantidad || 0);
  const stockAnterior = Number(movement.stock_anterior ?? 0);
  const stockNuevo = Number(movement.stock_nuevo ?? 0);
  const formattedId = `#MOV-${String(movement.id_movimiento || 0).padStart(4, "0")}`;

  const fechaFormateada = movement.fecha_movimiento
    ? new Date(movement.fecha_movimiento).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isCargo
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                {isCargo ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    Detalle del Ajuste de Bodega
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground border border-border/60">
                    {formattedId}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Auditoría y trazabilidad del inventario general
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

          <div className="mt-5 space-y-4">
            {/* Ficha del Insumo */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      {movement.insumo_nombre || "Insumo de Bodega"}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Tag className="w-3 h-3 text-[#DFB755]" />
                        {movement.insumo_categoria || "General"}
                      </span>
                      <span>•</span>
                      <span>Unidad: {movement.unidad_medida || "Unidad"}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    isCargo
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {movement.tipo_movimiento || (isCargo ? "Cargo por ajuste" : "Descargo por ajuste")}
                </span>
              </div>

              {movement.proveedor_nombre && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Proveedor habitual:
                  </span>
                  <span className="font-semibold text-foreground">
                    {movement.proveedor_nombre}
                  </span>
                </div>
              )}
            </div>

            {/* Evolución del Stock: Antes vs Después */}
            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-card border border-border/60 text-center items-center">
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  Stock Anterior
                </span>
                <span className="text-xl font-black text-foreground">{stockAnterior}</span>
                <span className="text-[10px] text-muted-foreground block">
                  {movement.unidad_medida || "uds"}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full border mb-1 ${
                    isCargo
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  }`}
                >
                  {isCargo ? `+${qty}` : `-${qty}`}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                  Ajustado
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isCargo
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  Stock Resultante
                </span>
                <span className="text-xl font-black">{stockNuevo}</span>
                <span className="text-[10px] text-muted-foreground block">
                  {movement.unidad_medida || "uds"}
                </span>
              </div>
            </div>

            {/* Observaciones del Movimiento */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Observaciones / Justificación del Ajuste:</span>
              </div>
              <p className="text-xs text-foreground/90 italic bg-card/60 p-3 rounded-xl border border-border/40 whitespace-pre-wrap leading-relaxed">
                "{movement.observaciones || "Sin observaciones registradas."}"
              </p>
            </div>

            {/* Fecha y Registro */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#DFB755]" />
                <span>Fecha y hora del movimiento:</span>
              </span>
              <span className="font-bold text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                {fechaFormateada}
              </span>
            </div>

            {/* Botón Cerrar */}
            <div className="flex items-center justify-end pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border/60 text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
