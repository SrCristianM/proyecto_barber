import { DollarSign, Eye, Edit, Ban } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { clients } from "../hooks/useSales";

export default function SalesTable({
  sales,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onEdit,
  onDelete,
  onDeactivate
}) {
  const getClientName = (id_cliente) => {
    const c = clients.find((client) => client.id_cliente === Number(id_cliente));
    return c ? c.nombre : "Cliente Desconocido";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="ID" field="id_venta" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Fecha" field="fecha" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Cliente" field="id_cliente" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Artículos</th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id_venta} className="border-b border-border hover:bg-accent/40 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">#{sale.id_venta}</td>
                <td className="py-3 px-4 text-foreground text-xs">{sale.fecha}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground text-xs">{getClientName(sale.id_cliente)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs max-w-[180px] truncate">
                  {(sale.detalles || []).map((d) => d.nombre).join(", ") || "—"}
                </td>
                <td className="py-3 px-4 font-semibold text-foreground text-sm">
                  ${Number(sale.total).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      sale.estado === "Activa" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {sale.estado}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onDetail(sale)}
                      className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(sale)}
                      className="p-1.5 hover:bg-accent rounded-lg text-primary hover:text-primary/80 transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {sale.estado === "Activa" && (
                      <button
                        onClick={() => onDeactivate(sale)}
                        className="p-1.5 hover:bg-accent rounded-lg text-destructive hover:text-destructive/80 transition-colors"
                        title="Anular venta"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando {sales.length} de {totalCount} ventas
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-accent text-foreground text-xs transition-colors">Anterior</button>
          <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs">1</button>
          <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-accent text-foreground text-xs transition-colors">Siguiente</button>
        </div>
      </div>
    </>
  );
}
