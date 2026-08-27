import { ShoppingBag, Eye, Edit, Trash2, Ban, Calendar, User, Building2, Package } from "lucide-react";
import { motion } from "motion/react";

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
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`bg-card border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        isAnulada ? "border-destructive/30 opacity-80" : "border-border"
      }`}
    >
      <div>
        {/* Header de la Card */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-base">Compra #{purchase.id_compra}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {purchase.fecha}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              purchase.estado === "Registrada"
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {purchase.estado}
          </span>
        </div>

        {/* Proveedor y Usuario */}
        <div className="space-y-2 py-3 border-y border-border/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Proveedor:
            </span>
            <span className="font-semibold text-foreground truncate max-w-[180px] text-right" title={getSupplierName(purchase.id_proveedor)}>
              {getSupplierName(purchase.id_proveedor)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Registrado por:
            </span>
            <span className="text-foreground font-medium">
              {getUserName(purchase.id_usuario)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Ítems / Unidades:
            </span>
            <span className="text-foreground font-medium">
              {purchase.detalles?.length || 0} productos ({itemsCount} uds.)
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mt-3 pt-1">
          <span className="text-xs font-medium text-muted-foreground">Total Invertido:</span>
          <span className={`text-lg font-bold ${isAnulada ? "line-through text-muted-foreground" : "text-primary"}`}>
            ${Number(purchase.total).toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between gap-1 pt-4 mt-2 border-t border-border/40">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDetail(purchase)}
            className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors"
            title="Ver Detalle de Compra"
          >
            <Eye className="h-4 w-4" />
          </button>
          {!isAnulada && (
            <button
              onClick={() => onCancel(purchase)}
              className="p-2 hover:bg-warning/10 text-warning rounded-lg transition-colors"
              title="Anular Compra"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isAnulada && (
            <button
              onClick={() => onEdit(purchase)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
          <button
            onClick={() => onDelete(purchase)}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
            title="Eliminar Compra"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
