import { ShoppingBag, Eye, Edit, Trash2, Ban } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

export default function PurchasesTable({
  purchases,
  totalCount,
  sortField,
  sortDir,
  onSort,
  getSupplierName,
  getUserName,
  onDetail,
  onEdit,
  onCancel,
  onDelete
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Compra #" field="id_compra" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Proveedor" field="id_proveedor" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Fecha" field="fecha" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ítems</span>
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Usuario" field="id_usuario" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-center py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  className={`border-b border-border hover:bg-accent/40 transition-colors ${
                    isAnulada ? "opacity-75 bg-muted/20" : ""
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-foreground text-sm">#{purchase.id_compra}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-foreground text-sm">{getSupplierName(purchase.id_proveedor)}</p>
                    <p className="text-xs text-muted-foreground">
                      {(purchase.detalles || []).map((d) => d.nombre_producto).join(", ").slice(0, 35)}...
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-sm text-foreground whitespace-nowrap">
                    {purchase.fecha}
                  </td>

                  <td className="py-3.5 px-4 text-sm text-muted-foreground">
                    <span className="bg-secondary/70 px-2 py-0.5 rounded-md font-medium text-foreground text-xs">
                      {purchase.detalles?.length || 0} prods ({itemsCount} uds)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-sm text-muted-foreground">
                    {getUserName(purchase.id_usuario)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className={`font-bold text-sm ${isAnulada ? "line-through text-muted-foreground" : "text-primary"}`}>
                      ${Number(purchase.total).toLocaleString("es-CO")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        purchase.estado === "Registrada"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {purchase.estado}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(purchase)}
                        className="p-1.5 hover:bg-secondary rounded-md text-foreground transition-colors"
                        title="Ver Detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!isAnulada && (
                        <button
                          onClick={() => onCancel(purchase)}
                          className="p-1.5 hover:bg-warning/10 rounded-md text-warning transition-colors"
                          title="Anular Compra"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      {!isAnulada && (
                        <button
                          onClick={() => onEdit(purchase)}
                          className="p-1.5 hover:bg-secondary rounded-md text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(purchase)}
                        className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
