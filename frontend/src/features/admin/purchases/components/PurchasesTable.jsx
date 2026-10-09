import { ShoppingBag, Eye, Edit, Trash2, Ban, FileDown } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { downloadPurchaseInvoicePDF } from "../../../../shared/utils/pdfInvoiceGenerator";
import { getSupplierObject as defaultGetSupplierObject, getUserObject as defaultGetUserObject } from "../hooks/usePurchases";

export default function PurchasesTable({
  purchases,
  totalCount,
  sortField,
  sortDir,
  onSort,
  getSupplierName,
  getUserName,
  getSupplierObject,
  getUserObject,
  onDetail,
  onEdit,
  onCancel,
  onDelete
}) {
  const resolveSupplierObj = getSupplierObject || defaultGetSupplierObject;
  const resolveUserObj = getUserObject || defaultGetUserObject;
  return (
    <>
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[500px] sm:min-w-[700px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Compra #" field="id_compra" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Proveedor" field="id_proveedor" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Fecha" field="fecha" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4 hidden md:table-cell">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ítems</span>
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4 hidden lg:table-cell">
                <SortHeader label="Usuario" field="id_usuario" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-center py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 sm:py-3 sm:px-4 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const isAnulada = purchase.estado === "Anulada";
              const itemsCount = (purchase.detalles || []).reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0);

              return (
                <tr
                  key={purchase.id_compra}
                  id={`row-pur-${purchase.id_compra}`}
                  data-highlight-id={`pur-${purchase.id_compra}`}
                  className={`border-b border-border hover:bg-accent/40 transition-colors ${
                    isAnulada ? "opacity-75 bg-muted/20" : ""
                  }`}
                >
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-md sm:rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                        <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <span className="font-bold text-foreground text-xs sm:text-sm">#{purchase.id_compra}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <p className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1 max-w-[110px] sm:max-w-none">{getSupplierName(purchase.id_proveedor, purchase)}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-[110px] sm:max-w-none">
                      {(purchase.detalles || []).map((d) => d.nombre_producto || d.producto_nombre).filter(Boolean).join(", ").slice(0, 30)}...
                    </p>
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-foreground whitespace-nowrap">
                    {purchase.fecha}
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                    <span className="bg-secondary/70 px-2 py-0.5 rounded-md font-medium text-foreground text-xs whitespace-nowrap">
                      {purchase.detalles?.length || 0} prods ({itemsCount} uds)
                    </span>
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                    {getUserName(purchase.id_usuario, purchase)}
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-right">
                    <span className={`font-bold text-xs sm:text-sm font-mono whitespace-nowrap ${isAnulada ? "line-through text-muted-foreground" : "text-primary"}`}>
                      ${Number(purchase.total).toLocaleString("es-CO")}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${
                        purchase.estado === "Registrada" ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                    >
                      {purchase.estado}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(purchase)}
                        className="p-1 sm:p-1.5 hover:bg-secondary rounded-md text-foreground transition-colors cursor-pointer"
                        title="Ver Detalle"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() =>
                          downloadPurchaseInvoicePDF(
                            purchase,
                            resolveSupplierObj(purchase.id_proveedor, purchase),
                            resolveUserObj(purchase.id_usuario, purchase)
                          )
                        }
                        className="p-1 sm:p-1.5 hover:bg-primary/10 rounded-md text-primary transition-colors cursor-pointer"
                        title="Descargar Factura Oficial del Proveedor (PDF)"
                      >
                        <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {onCancel && (
                        <button
                          onClick={() => !isAnulada && onCancel(purchase)}
                          disabled={isAnulada}
                          className={`p-1.5 rounded-md transition-colors ${
                            isAnulada
                              ? "text-muted-foreground/40 opacity-40 cursor-not-allowed hover:bg-transparent"
                              : "hover:bg-warning/10 text-warning cursor-pointer"
                          }`}
                          title={isAnulada ? "Factura ya anulada (acción no disponible)" : "Anular Compra"}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      {!isAnulada && onEdit && (
                        <button
                          onClick={() => onEdit(purchase)}
                          className="p-1.5 hover:bg-secondary rounded-md text-primary transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(purchase)}
                          className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>
          Mostrando {purchases.length} de {totalCount} compras
        </p>
      </div>
    </>
  );
}
