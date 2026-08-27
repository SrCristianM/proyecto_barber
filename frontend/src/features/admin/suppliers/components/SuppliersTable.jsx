import { Building2, Eye, Power, Edit, Trash2 } from "lucide-react";
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Proveedor" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="NIT / Doc" field="nit" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Teléfono" field="telefono" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Correo" field="correo" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Dirección" field="direccion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id_proveedor}
                className="border-b border-border hover:bg-accent/40 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{supplier.nombre}</p>
                      <p className="text-xs text-muted-foreground">ID #{supplier.id_proveedor}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-sm font-medium text-foreground">
                  {supplier.nit || "—"}
                </td>
                <td className="py-3.5 px-4 text-sm text-muted-foreground">
                  {supplier.telefono || "—"}
                </td>
                <td className="py-3.5 px-4 text-sm text-muted-foreground">
                  {supplier.correo || "—"}
                </td>
                <td className="py-3.5 px-4 text-sm text-muted-foreground max-w-[200px] truncate">
                  {supplier.direccion || "—"}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      supplier.estado === 1
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {supplier.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onDetail(supplier)}
                      className="p-1.5 hover:bg-secondary rounded-md text-foreground transition-colors"
                      title="Ver Detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(supplier)}
                      className={`p-1.5 hover:bg-secondary rounded-md transition-colors ${
                        supplier.estado === 1
                          ? "text-warning hover:text-warning/80"
                          : "text-success hover:text-success/80"
                      }`}
                      title={supplier.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(supplier)}
                      className="p-1.5 hover:bg-secondary rounded-md text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(supplier)}
                      className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
