import { User, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { ROLES } from "../../../../shared/types/database";

export default function UsersTable({
  users,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete,
  canEdit = true,
  canToggle = true,
  canDelete = true
}) {
  const getRoleName = (id_rol) => {
    const r = ROLES.find((role) => role.id_rol === Number(id_rol));
    return r ? r.nombre_rol : "Sin Rol";
  };

  return (
    <>
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[480px] sm:min-w-[650px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Usuario" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Rol" field="id_rol" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Fecha Registro" field="fecha_registro" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 sm:py-3 sm:px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 sm:py-3 sm:px-4 text-[11px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id_usuario}
                id={`row-usr-${user.id_usuario}`}
                data-highlight-id={`usr-${user.id_usuario}`}
                className="table-row-accent border-b border-border transition-colors"
              >
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary/10 rounded-md sm:rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                      <User className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-xs sm:text-sm line-clamp-1 max-w-[110px] sm:max-w-none">{user.nombre} {user.apellido}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-[110px] sm:max-w-none">
                        {user.correo}{user.documento ? ` • ${user.documento}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-foreground text-xs sm:text-sm font-medium whitespace-nowrap">{getRoleName(user.id_rol)}</td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-muted-foreground text-[11px] sm:text-xs whitespace-nowrap">{user.fecha_registro}</td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${user.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                  >
                    {user.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2.5 px-2 sm:py-4 sm:px-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button onClick={() => onDetail(user)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-foreground cursor-pointer" title="Ver detalle">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {canToggle && (
                        <button
                          onClick={() => onToggleStatus(user)}
                          className={`p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg cursor-pointer ${user.estado === 1 ? "text-success hover:text-warning" : "text-muted-foreground hover:text-success"}`}
                          title={user.estado === 1 ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button onClick={() => onEdit(user)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-primary cursor-pointer" title="Editar">
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(user)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-destructive cursor-pointer" title="Eliminar">
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Mostrando {users.length} de {totalCount} usuarios
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
