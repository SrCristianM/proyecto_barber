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
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="ID" field="id_venta" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Fecha" field="fecha" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Cliente" field="id_cliente" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">Artículos</th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3.5 px-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id_venta}
                id={`row-sal-${sale.id_venta}`}
                data-highlight-id={`sal-${sale.id_venta}`}
                className="table-row-accent border-b border-border transition-colors"
              >
                <td className="py-3.5 px-4 font-mono text-sm text-muted-foreground font-bold">#{sale.id_venta}</td>
                <td className="py-3.5 px-4 text-foreground text-sm font-medium">{sale.fecha}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{getClientName(sale.id_cliente)}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground text-sm max-w-[200px] truncate font-medium">
                  {(sale.detalles || []).map((d) => d.nombre).join(", ") || "—"}
                </td>
                <td className="py-3.5 px-4">
                  <div className="space-y-1 min-w-[110px]">
                    <span className="font-bold text-foreground text-base font-mono block">
                      ${Number(sale.total).toLocaleString("es-CO")}
                    </span>
                    <div className="w-24 h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/40">
                      <div
                        className={`h-full rounded-full ${
                          Number(sale.total) >= 70000
                            ? "w-full loyalty-progress-gold"
                            : Number(sale.total) >= 40000
                            ? "w-2/3 loyalty-progress-silver"
                            : "w-1/3 loyalty-progress-new"
                        }`}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${
                      sale.estado === "Activa" ? "badge-glow-success" : "badge-glow-destructive"
                    }`}
                  >
                    {sale.estado}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onDetail(sale)}
                      className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(sale)}
                      className="p-2 hover:bg-accent rounded-lg text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {sale.estado === "Activa" && (
                      <button
                        onClick={() => onDeactivate(sale)}
                        className="p-2 hover:bg-accent rounded-lg text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
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
