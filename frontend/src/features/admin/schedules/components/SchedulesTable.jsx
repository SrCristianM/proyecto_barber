import { Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

export default function SchedulesTable({
  schedules,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete,
  getBarberName,
  canEdit = true,
  canToggle = true,
  canDelete = true
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] md:min-w-0 md:w-full xl:min-w-[800px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Barbero" field="id_barbero" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">Días</th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Hora Inicio" field="hora_inicio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Hora Fin" field="hora_fin" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="hidden xl:table-cell text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">Vigencia</th>
              <th className="text-left py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs sm:text-sm text-muted-foreground">
                  No se encontraron horarios
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id_horario} className="table-row-accent border-b border-border hover:bg-accent/40 transition-colors">
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">
                    <span className="font-semibold text-foreground text-xs sm:text-sm">{getBarberName(schedule.id_barbero)}</span>
                  </td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {(schedule.dias_semana || []).map((dia) => (
                        <span
                          key={dia}
                          className="inline-block px-1.5 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary rounded-md sm:rounded-lg font-semibold border border-primary/20"
                        >
                          {dia.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-foreground font-mono text-xs sm:text-sm font-medium">{schedule.hora_inicio}</td>
                  <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-foreground font-mono text-xs sm:text-sm font-medium">{schedule.hora_fin}</td>
                  <td className="hidden xl:table-cell py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-xs">
                    {schedule.fecha_inicio || schedule.fecha_fin ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">
                          {schedule.fecha_inicio || "Desde inicio"}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          hasta {schedule.fecha_fin || "Indefinido"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-medium text-xs">Permanente</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full border ${
                        schedule.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                    >
                      {schedule.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      <button
                        onClick={() => onDetail(schedule)}
                        className="p-1 sm:p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      {canToggle && (
                        <button
                          onClick={() => onToggleStatus(schedule)}
                          className={`p-1 sm:p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
                            schedule.estado === 1 ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={schedule.estado === 1 ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => onEdit(schedule)}
                          className="p-1 sm:p-2 hover:bg-accent rounded-lg text-primary hover:text-primary/80 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(schedule)}
                          className="p-1 sm:p-2 hover:bg-accent rounded-lg text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
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
          Mostrando {schedules.length} de {totalCount} horarios
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
