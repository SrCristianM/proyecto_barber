import { Shield, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { formatPermissionItems } from "../constants/permissions";

export default function RolesTable({
  roles,
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
                <SortHeader label="Rol" field="nombre_rol" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Descripción" field="descripcion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Permisos</th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Fecha Creación" field="fecha_creacion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id_rol} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{role.nombre_rol}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{role.descripcion || "—"}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {formatPermissionItems(role.permisos, role.alcancePorPermiso).map((item) => (
                      <span
                        key={`${role.id_rol}-${item}`}
                        className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{role.fecha_creacion}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      role.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {role.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(role)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(role.id_rol)}
                      className={`p-2 hover:bg-background rounded-lg ${role.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                      title={role.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(role)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(role)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
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
          Mostrando {roles.length} de {totalCount} roles
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
