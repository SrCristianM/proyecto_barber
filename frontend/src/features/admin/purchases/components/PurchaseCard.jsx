import { ShoppingBag, Eye, Edit, Trash2, Ban, Calendar, User, Building2, Package } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function PurchaseCard({
  purchase,
  getSupplierName,
  getSupplierNit,
  getUserName,
  onDetail,
  onEdit,
  onCancel,
  onDelete
}) {
  const isAnulada = purchase.estado === "Anulada";
  const itemsCount = (purchase.detalles || []).reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0);

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div className={`bg-card border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between ${
        isAnulada ? "border-destructive/30 opacity-80" : "border-border"
      }`}>
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  Compra #{purchase.id_compra}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                  <Calendar className="h-3 w-3 text-primary" />
                  {purchase.fecha}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isAnulada ? "badge-glow-destructive" : "badge-glow-success"
              }`}
            >
              {purchase.estado}
            </span>
          </div>

          {/* Proveedor y Usuario */}
          <div className="space-y-2 py-3 border-y border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                Proveedor
              </span>
              <span className="font-bold text-foreground truncate max-w-[160px] text-right" title={getSupplierName(purchase.id_proveedor)}>
                {getSupplierName(purchase.id_proveedor)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                Registrado por
              </span>
              <span className="text-foreground font-medium truncate max-w-[160px]">
                {getUserName(purchase.id_usuario)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                Artículos
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-foreground bg-secondary rounded-lg">
                {purchase.detalles?.length || 0} prods ({itemsCount} uds)
              </span>
            </div>
          </div>

          {/* Total Invertido */}
          <div className="flex items-center justify-between py-2 border-b border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Total Invertido</span>
            <span className={`text-base font-bold font-mono ${isAnulada ? "line-through text-muted-foreground" : "text-primary"}`}>
              ${Number(purchase.total).toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-3 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(purchase)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          {!isAnulada && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(purchase)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
          {!isAnulada && (
            <button
              type="button"
              onClick={() => onCancel && onCancel(purchase)}
              className="p-2 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-colors cursor-pointer"
              title="Anular Compra"
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete && onDelete(purchase)}
            className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
