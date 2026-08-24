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
  onDelete
}) {
  const getRoleName = (id_rol) => {
    const r = ROLES.find((role) => role.id_rol === Number(id_rol));
    return r ? r.nombre_rol : "Sin Rol";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Usuario" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Rol" field="id_rol" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Fecha Registro" field="fecha_registro" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id_usuario} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.nombre} {user.apellido}</p>
                      <p className="text-sm text-muted-foreground">{user.correo}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{getRoleName(user.id_rol)}</td>
                <td className="py-4 px-4 text-muted-foreground">{user.fecha_registro}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      user.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(user)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id_usuario)}
                      className={`p-2 hover:bg-background rounded-lg ${user.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                      title={user.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(user)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(user)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
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
