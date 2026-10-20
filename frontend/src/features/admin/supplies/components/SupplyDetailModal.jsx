import { Boxes, User, Calendar, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function SupplyDetailModal({ supply, onClose, onCancel, canAnular = true }) {
  if (!supply) return null;

  const isAnulado = supply.estado === "Anulado";
  const items = supply.detalles || [];
  const totalUnits = items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);

  return (
    <Modal
      title={`Vale de Abastecimiento #${String(supply.id_abastecimiento).padStart(4, "0")}`}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Encabezado y Estado */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border flex-wrap gap-3">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">
              Folio de Despacho
            </span>
            <p className="text-xl font-black text-foreground font-mono">
              AB-{String(supply.id_abastecimiento).padStart(5, "0")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAnulado ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" />
                Despacho Anulado (Stock Restituido)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Despacho Registrado (Stock Descontado)
              </span>
            )}
          </div>
        </div>

        {/* Tarjetas de Barbero y Despachador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5 text-primary" />
              Barbero Destinatario
            </span>
            <p className="text-sm font-bold text-foreground">{supply.barbero_nombre || "Barbero"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {supply.barbero_especialidad || "Estilista"}
            </p>
            {supply.barbero_correo && (
              <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-mono">{supply.barbero_correo}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Fecha y Responsable
            </span>
            <p className="text-sm font-bold text-foreground font-mono">{supply.fecha}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Despachado por: <span className="text-foreground font-semibold">{supply.usuario_nombre || "Personal de Caja"}</span>
            </p>
          </div>
        </div>

        {/* Observaciones */}
        {supply.observaciones && (
          <div className="p-3 rounded-xl bg-secondary/20 border border-border text-xs">
            <span className="font-bold text-muted-foreground block mb-0.5">Observaciones / Notas:</span>
            <p className="text-foreground italic">&quot;{supply.observaciones}&quot;</p>
          </div>
        )}

        {/* Lista de Insumos Despachados */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
            <span>Insumos Consumidos en el Servicio ({items.length})</span>
            <span className="text-foreground font-mono font-bold">{totalUnits} unidades en total</span>
          </h4>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3">Insumo</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-right">Costo Estimado</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-foreground">{item.producto_nombre || "Producto"}</p>
                      {item.producto_presentacion && (
                        <p className="text-[11px] text-muted-foreground">{item.producto_presentacion}</p>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold text-foreground font-mono">
                      {item.cantidad} un.
                    </td>
                    <td className="p-3 text-right text-muted-foreground font-mono">
                      ${Number(item.precio_unitario || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="p-3 text-right font-bold text-foreground font-mono">
                      ${Number(item.subtotal || 0).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Pie de Tabla */}
            <div className="p-3.5 bg-secondary/40 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Valor total estimado de consumibles:
              </span>
              <span className="text-base font-black text-foreground font-mono">
                ${Number(supply.total_estimado || 0).toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-border flex-wrap gap-3">
          <div>
            {!isAnulado && canAnular && (
              <button
                type="button"
                onClick={() => onCancel(supply)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Anular Despacho y Restaurar Stock
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
