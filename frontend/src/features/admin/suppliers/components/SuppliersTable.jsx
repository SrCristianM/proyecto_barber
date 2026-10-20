import { Building2, Eye, Power, Edit, Trash2, FileText } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

export default function SuppliersTable({
  suppliers,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] md:min-w-0 md:w-full xl:min-w-[850px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] sm:text-xs">
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Proveedor" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="NIT / Doc" field="nit" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Teléfono" field="telefono" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="hidden lg:table-cell text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Correo" field="correo" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="hidden xl:table-cell text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Dirección" field="direccion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2.5 px-2 md:px-3 lg:px-4 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id_proveedor}
                id={`row-sup-${supplier.id_proveedor}`}
                data-highlight-id={`sup-${supplier.id_proveedor}`}
                className="table-row-accent border-b border-border transition-colors"
              >
                <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                      <Building2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-xs sm:text-sm">{supplier.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">ID #{supplier.id_proveedor}</span>
                        {supplier.factura_pdf && (
                          <span
                            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/20 rounded"
                            title={typeof supplier.factura_pdf === "object" ? supplier.factura_pdf.nombre : "Factura PDF adjunta"}
                          >
                            <FileText className="h-2.5 w-2.5" /> PDF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-[11px] sm:text-xs font-mono font-medium text-foreground">
                  {supplier.nit || "—"}
                </td>
                <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-[11px] sm:text-xs text-muted-foreground">
                  {supplier.telefono || "—"}
                </td>
                <td className="hidden lg:table-cell py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-xs text-muted-foreground truncate max-w-[140px]">
                  {supplier.correo || "—"}
                </td>
                <td className="hidden xl:table-cell py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                  {supplier.direccion || "—"}
                </td>
                <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full border ${
                      supplier.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                    }`}
                  >
                    {supplier.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    <button
                      onClick={() => onDetail(supplier)}
                      className="p-1 sm:p-1.5 hover:bg-secondary rounded-md text-foreground transition-colors"
                      title="Ver Detalle"
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(supplier)}
                        className={`p-1 sm:p-1.5 hover:bg-secondary rounded-md transition-colors ${
                          supplier.estado === 1
                            ? "text-warning hover:text-warning/80"
                            : "text-success hover:text-success/80"
                        }`}
                        title={supplier.estado === 1 ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(supplier)}
                        className="p-1 sm:p-1.5 hover:bg-secondary rounded-md text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(supplier)}
                        className="p-1 sm:p-1.5 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>
          Mostrando {suppliers.length} de {totalCount} proveedores
        </p>
      </div>
    </>
  );
}
