import { DollarSign, Eye, Edit, Trash2 } from "lucide-react";
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
  onDelete
}) {
  const getClientName = (id_cliente) => {
    const c = clients.find((client) => client.id_cliente === Number(id_cliente));
    return c ? c.nombre : "Cliente Desconocido";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
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
              <th className="text-left py-3 px-4">Artículos / Servicios</th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id_venta} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4 font-mono text-sm text-foreground">#{sale.id_venta}</td>
                <td className="py-4 px-4 text-foreground text-sm">{sale.fecha}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{getClientName(sale.id_cliente)}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground text-sm">
                  {(sale.detalles || []).map((d) => d.nombre).join(", ") || "—"}
                </td>
                <td className="py-4 px-4 font-semibold text-foreground">${Number(sale.total).toLocaleString()}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      sale.estado === "Activa" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {sale.estado}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(sale)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(sale)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(sale)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Anterior</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Siguiente</button>
        </div>
      </div>
    </>
  );
}
