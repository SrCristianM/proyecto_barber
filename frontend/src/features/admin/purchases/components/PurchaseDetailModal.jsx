import { ShoppingBag, Building2, CheckCircle2, Ban, FileDown, FileText } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { availableSuppliers, availableUsers, availableProducts } from "../hooks/usePurchases";
import { downloadPurchaseInvoicePDF } from "../../../../shared/utils/pdfInvoiceGenerator";

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
    <Modal title={`Detalle de la Compra #${purchase.id_compra}`} onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="space-y-5">
        {/* Header Icon + Info General */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">ID Compra</span>
            <span className="text-xl font-bold text-foreground">#{purchase.id_compra}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">Estado</span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                purchase.estado === "Registrada"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {purchase.estado === "Registrada" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Ban className="h-3.5 w-3.5" />
              )}
              {purchase.estado}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">Fecha Registro</span>
            <span className="text-sm font-medium text-foreground">{purchase.fecha}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">Registrado Por</span>
            <span className="text-sm font-semibold text-foreground">{user?.nombre || "Administrador"}</span>
          </div>
        </div>

        {/* Proveedor Info y Factura Adjunta */}
        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Información del Proveedor</h4>
            </div>
            <button
              onClick={() => downloadPurchaseInvoicePDF(purchase, supplier, user)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Descargar Factura Oficial en PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-foreground text-base">{supplier?.nombre || "Proveedor"}</span>
            <span className="text-xs text-muted-foreground font-medium">{supplier?.nit ? `NIT: ${supplier.nit}` : "Sin NIT registrado"}</span>
          </div>

          {/* Factura PDF adjunta si existe */}
          {purchase.factura_pdf && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-[11px] border border-red-500/20 shrink-0">
                  PDF
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-foreground truncate">
                    {purchase.factura_pdf.nombre || `Factura_Compra_#${purchase.id_compra}.pdf`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {purchase.factura_pdf.tamano || "Documento PDF"} • {purchase.factura_pdf.fecha || "Adjunto"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadPurchaseInvoicePDF(purchase, supplier, user)}
                className="text-xs text-primary font-semibold hover:underline shrink-0 cursor-pointer"
              >
                Descargar
              </button>
            </div>
          )}
        </div>

        {/* Desglose de Productos (detalle_compra) */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Productos Adquiridos en Factura</h4>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Producto</th>
                  <th className="text-center py-3 px-4 font-semibold">Cantidad</th>
                  <th className="text-right py-3 px-4 font-semibold">Precio Unitario</th>
                  <th className="text-right py-3 px-4 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(purchase.detalles || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {getProdName(item.id_producto, item.nombre_producto)}
                    </td>
                    <td className="py-3 px-4 text-center text-foreground font-medium">
                      {item.cantidad} uds.
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      ${Number(item.precio_unitario).toLocaleString("es-CO")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      ${Number(item.subtotal).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/30 border-t border-border">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                    Total de la Compra:
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-primary text-base sm:text-lg">
                    ${Number(purchase.total).toLocaleString("es-CO")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => downloadPurchaseInvoicePDF(purchase, supplier, user)}
            className="flex-1 py-3 bg-secondary/80 hover:bg-secondary border border-border rounded-xl transition-colors text-foreground font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <FileDown className="h-4 w-4 text-primary" />
            <span>Descargar Factura PDF</span>
          </button>
          {!isAnulada && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
            >
              Editar Compra
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
