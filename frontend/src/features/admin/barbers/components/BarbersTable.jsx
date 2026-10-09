import { User, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

export default function BarbersTable({
  barbers,
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
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] sm:min-w-[700px] text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider">
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Barbero" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Especialidad" field="especialidad" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="hidden md:table-cell py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Correo" field="correo" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">Ocupación Hoy</th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {barbers.map((barber) => {
              const occPct = barber.id_barbero === 1 ? 85 : barber.id_barbero === 2 ? 60 : 30;
              const occText = barber.id_barbero === 1 ? "6/7 turnos" : barber.id_barbero === 2 ? "4/7 turnos" : "2/7 turnos";
              const isActive = barber.estado === 1;

              return (
                <tr
                  key={barber.id_barbero}
                  id={`row-bar-${barber.id_barbero}`}
                  data-highlight-id={`bar-${barber.id_barbero}`}
                  className="table-row-accent transition-colors"
                >
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {barber.imagen_url ? (
                        <img
                          src={barber.imagen_url}
                          alt={`${barber.nombre} ${barber.apellido}`}
                          className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border border-primary/30 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                          <User className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground text-xs sm:text-sm">{barber.nombre} {barber.apellido}</p>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                          {barber.documento && <span>Doc: {barber.documento}</span>}
                          {barber.documento && barber.telefono && <span>•</span>}
                          <span>{barber.telefono || "Sin teléfono"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-foreground text-xs sm:text-sm font-medium">{barber.especialidad || "—"}</td>
                  <td className="hidden md:table-cell py-2.5 px-2 sm:py-3.5 sm:px-4 text-muted-foreground text-xs">{barber.correo}</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="space-y-1 min-w-[90px] sm:min-w-[125px]">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="font-bold text-foreground">{occPct}%</span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{occText}</span>
                      </div>
                      <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
                        <div
                          style={{ width: `${occPct}%` }}
                          className={`h-full rounded-full ${occPct >= 80
                            ? "loyalty-progress-gold"
                            : occPct >= 50
                              ? "loyalty-progress-silver"
                              : "loyalty-progress-new"
                            }`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full border ${isActive ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                    >
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-right">
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      <button
                        type="button"
                        onClick={() => onDetail(barber)}
                        className="p-1 sm:p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {canToggle && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(barber)}
                          className={`p-1 sm:p-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer ${isActive ? "text-emerald-500 hover:text-amber-500" : "text-muted-foreground hover:text-emerald-500"
                            }`}
                          title={isActive ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(barber)}
                          className="p-1 sm:p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(barber)}
                          className="p-1 sm:p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
    </>
  );
}
