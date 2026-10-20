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
  onDeactivate,
  canEdit = true,
  canAnular = true
}) {
  const getClientName = (id_cliente, sale) => {
    if (sale?.cliente_nombre) return sale.cliente_nombre;
    const c = clients.find((client) => client.id_cliente === Number(id_cliente));
    return c ? c.nombre : "Cliente Desconocido";
  };

  return (
    <>
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[480px] md:min-w-0 md:w-full xl:min-w-[850px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="ID" field="id_venta" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Fecha" field="fecha" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Cliente" field="id_cliente" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold hidden xl:table-cell">Cobrado por</th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold hidden lg:table-cell">Artículos</th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const isAnulada = sale.estado !== "Activa";
              return (
                <tr
                  key={sale.id_venta}
                  id={`row-sal-${sale.id_venta}`}
                  data-highlight-id={`sal-${sale.id_venta}`}
                  className="table-row-accent border-b border-border transition-colors"
                >
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-mono text-xs sm:text-sm text-muted-foreground font-bold">#{sale.id_venta}</td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-foreground text-xs sm:text-sm font-medium whitespace-nowrap">{sale.fecha}</td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1 max-w-[100px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-none">{getClientName(sale.id_cliente, sale)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-foreground text-xs sm:text-sm font-medium hidden xl:table-cell">
                    {sale.cobrado_por || sale.usuario_nombre || "Personal de Caja"}
                  </td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-muted-foreground text-xs sm:text-sm max-w-[180px] truncate font-medium hidden lg:table-cell">
                    {(sale.detalles || []).map((d) => d.nombre).join(", ") || "—"}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                    <div className="space-y-0.5 min-w-[75px] sm:min-w-[110px]">
                      <span className={`font-bold text-xs sm:text-base font-mono block whitespace-nowrap ${isAnulada ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        ${Number(sale.total).toLocaleString("es-CO")}
                      </span>
                      <div className="w-14 sm:w-24 h-1 sm:h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/40">
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
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${
                        sale.estado === "Activa" ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                    >
                      {sale.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(sale)}
                        className="p-1 sm:p-2 hover:bg-accent rounded-md sm:rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {canEdit && !isAnulada && (
                        <button
                          onClick={() => onEdit(sale)}
                          className="p-1 sm:p-2 hover:bg-accent rounded-md sm:rounded-lg text-primary hover:text-primary/80 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canAnular && (
                        <button
                          onClick={() => !isAnulada && onDeactivate(sale)}
                          disabled={isAnulada}
                          className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                            isAnulada
                              ? "text-muted-foreground/40 opacity-40 cursor-not-allowed hover:bg-transparent"
                              : "hover:bg-accent text-destructive hover:text-destructive/80 cursor-pointer"
                          }`}
                          title={isAnulada ? "Venta ya anulada (acción no disponible)" : "Anular venta"}
                        >
                          <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
