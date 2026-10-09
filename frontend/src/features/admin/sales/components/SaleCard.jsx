import { DollarSign, Eye, Edit, Ban, Calendar, User, ShoppingBag, ShieldCheck } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function SaleCard({
  sale,
  clientName,
  onDetail,
  onEdit,
  onDeactivate,
  canEdit = true,
  canAnular = true
}) {
  const isAnulada = sale.estado !== "Activa";
  const itemsCount = (sale.detalles || []).reduce((sum, d) => sum + (Number(d.cantidad) || 1), 0);

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-sal-${sale.id_venta}`}
        data-highlight-id={`sal-${sale.id_venta}`}
        className={`bg-card border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between ${
          isAnulada ? "border-destructive/30 opacity-80" : "border-border"
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  Venta #{sale.id_venta}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                  <Calendar className="h-3 w-3 text-primary" />
                  {sale.fecha}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isAnulada ? "badge-glow-destructive" : "badge-glow-success"
              }`}
            >
              {sale.estado}
            </span>
          </div>

          {/* Datos principales */}
          <div className="space-y-2 py-3 border-y border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                Cliente
              </span>
              <span className="font-bold text-foreground truncate max-w-[160px] text-right" title={clientName}>
                {clientName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                Cobrado por
              </span>
              <span className="text-foreground font-medium truncate max-w-[160px]" title={sale.cobrado_por || sale.usuario_nombre}>
                {sale.cobrado_por || sale.usuario_nombre || "Personal de Caja"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ShoppingBag className="h-3.5 w-3.5 text-primary shrink-0" />
                Artículos
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-foreground bg-secondary rounded-lg truncate max-w-[160px]" title={(sale.detalles || []).map(d => d.nombre).join(", ")}>
                {sale.detalles?.length || 0} ítems ({itemsCount} uds)
              </span>
            </div>
          </div>

          {/* Total & Fidelización */}
          <div className="flex items-center justify-between py-2 border-b border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Total Cobrado</span>
            <div className="text-right">
              <span className={`text-base font-bold font-mono block ${isAnulada ? "line-through text-muted-foreground" : "text-primary"}`}>
                ${Number(sale.total).toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 pt-3 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(sale)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>

          {canEdit && !isAnulada && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(sale)}
              className="flex items-center justify-center p-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer shrink-0"
              title="Editar Venta"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {canAnular && (
            <button
              type="button"
              onClick={() => !isAnulada && onDeactivate && onDeactivate(sale)}
              disabled={isAnulada}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                isAnulada
                  ? "text-muted-foreground/30 opacity-40 cursor-not-allowed bg-secondary/30"
                  : "text-destructive bg-destructive/10 hover:bg-destructive/20 cursor-pointer"
              }`}
              title={isAnulada ? "Venta ya anulada" : "Anular Venta"}
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
