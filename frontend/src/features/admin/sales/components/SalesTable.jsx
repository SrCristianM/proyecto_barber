import { Eye, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

export default function SalesTable({
  sales,
  filteredCount,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onEdit,
  onDelete
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Fecha/Hora" field="date" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Cliente" field="client" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Artículos</th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Barbero" field="barber" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Método de Pago" field="payment" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4">
                <SortHeader label="Total" field="total" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{sale.date}</p>
                    <p className="text-muted-foreground">{sale.time}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground font-medium">{sale.client}</td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    {sale.items.map((item, idx) => (
                      <p key={idx} className="text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{sale.barber}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      sale.payment === "Efectivo"
                        ? "bg-success/10 text-success"
                        : sale.payment === "Tarjeta"
                        ? "bg-[#DAA520]/10 text-[#DAA520]"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {sale.payment}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-bold text-foreground text-lg">${sale.total.toLocaleString()}</td>
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
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCount)} de {filteredCount} ventas
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent text-foreground"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
