import { Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Rol" field="nombre_rol" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Descripción" field="descripcion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Permisos</th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Creación" field="fecha_creacion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron roles con los filtros aplicados
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr
                  key={role.id_rol}
                  id={`row-rol-${role.id_rol}`}
                  data-highlight-id={`rol-${role.id_rol}`}
                  className="border-b border-border hover:bg-accent/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{role.nombre_rol}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{role.descripcion || "—"}</td>
                  <td className="py-3 px-4">
                    {(() => {
                      const count = (role.permisos || []).length;
                      const totalPossible = 23;
                      const pct = Math.min(100, Math.round((count / totalPossible) * 100));
                      const isFull = pct >= 90;
                      const isMid = pct >= 50;

                      return (
                        <div className="space-y-1.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{count} permisos</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all ${isFull
                                ? "loyalty-progress-gold"
                                : isMid
                                  ? "loyalty-progress-silver"
                                  : "loyalty-progress-bronze"
                                }`}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{role.fecha_creacion?.split(" ")[0]}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${role.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                    >
                      {role.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(role)}
                        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(role)}
                        className={`p-1.5 hover:bg-accent rounded-lg transition-colors ${role.estado === 1 ? "text-success hover:text-success/80" : "text-muted-foreground hover:text-foreground"
                          }`}
                        title={role.estado === 1 ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(role)}
                        className="p-1.5 hover:bg-accent rounded-lg text-primary hover:text-primary/80 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(role)}
                        className="p-1.5 hover:bg-accent rounded-lg text-destructive hover:text-destructive/80 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm">
        <p className="text-muted-foreground">
          Mostrando {roles.length} de {totalCount} roles
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
