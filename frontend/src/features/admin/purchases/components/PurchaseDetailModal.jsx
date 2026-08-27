import { ShoppingBag, Building2, User, Calendar, CheckCircle2, Ban } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { availableSuppliers, availableUsers, availableProducts } from "../hooks/usePurchases";

export default function PurchaseDetailModal({ purchase, onEdit, onClose }) {
  if (!purchase) return null;

  const supplier = availableSuppliers.find((s) => s.id_proveedor === Number(purchase.id_proveedor));
  const user = availableUsers.find((u) => u.id_usuario === Number(purchase.id_usuario));
  const isAnulada = purchase.estado === "Anulada";

  const getProdName = (id_producto, storedName) => {
    if (storedName) return storedName;
    return availableProducts.find((p) => p.id_producto === Number(id_producto))?.nombre || "Producto";
  };

  return (
    <Modal title={`Detalle de la Compra #${purchase.id_compra}`} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Header Icon + Info General */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-secondary/30 rounded-xl border border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block mb-1">ID Compra</span>
            <span className="font-bold text-foreground text-sm">#{purchase.id_compra}</span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">Estado</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-semibold rounded-full border ${
                purchase.estado === "Registrada"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {purchase.estado === "Registrada" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Ban className="h-3 w-3" />
              )}
              {purchase.estado}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">Fecha Registro</span>
            <span className="font-medium text-foreground">{purchase.fecha}</span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">Registrado Por</span>
            <span className="font-medium text-foreground">{user?.nombre || "Admin"}</span>
          </div>
        </div>

        {/* Proveedor Info */}
        <div className="p-3.5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Información del Proveedor</h4>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
            <span className="font-semibold text-foreground text-sm">{supplier?.nombre || "Proveedor"}</span>
            <span className="text-muted-foreground">{supplier?.nit ? `NIT: ${supplier.nit}` : "Sin NIT"}</span>
          </div>
        </div>

        {/* Desglose de Productos (detalle_compra) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Productos Adquiridos</h4>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-2.5 px-3">Producto</th>
                  <th className="text-center py-2.5 px-3">Cantidad</th>
                  <th className="text-right py-2.5 px-3">Precio Unitario</th>
                  <th className="text-right py-2.5 px-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(purchase.detalles || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {getProdName(item.id_producto, item.nombre_producto)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-foreground font-medium">
                      {item.cantidad} uds.
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      ${Number(item.precio_unitario).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                      ${Number(item.subtotal).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-card border-t border-border">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right font-bold text-foreground text-sm">
                    Total de la Compra:
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-primary text-base">
                    ${Number(purchase.total).toLocaleString("es-CO")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          {!isAnulada && (
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
            >
              Editar Compra
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
