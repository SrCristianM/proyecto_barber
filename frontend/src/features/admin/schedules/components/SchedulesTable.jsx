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
  getBarberName
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Barbero" field="id_barbero" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">Días</th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Hora Inicio" field="hora_inicio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Hora Fin" field="hora_fin" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3.5 px-4 font-semibold">Vigencia</th>
              <th className="text-left py-3.5 px-4 font-semibold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3.5 px-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron horarios
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id_horario} className="table-row-accent border-b border-border hover:bg-accent/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-foreground text-sm">{getBarberName(schedule.id_barbero)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(schedule.dias_semana || []).map((dia) => (
                        <span
                          key={dia}
                          className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-lg font-semibold border border-primary/20"
                        >
                          {dia.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-mono text-sm font-medium">{schedule.hora_inicio}</td>
                  <td className="py-3.5 px-4 text-foreground font-mono text-sm font-medium">{schedule.hora_fin}</td>
                  <td className="py-3.5 px-4 text-xs">
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
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${
                        schedule.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                    >
                      {schedule.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onDetail(schedule)}
                        className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(schedule)}
                        className={`p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
                          schedule.estado === 1 ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={schedule.estado === 1 ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(schedule)}
                        className="p-2 hover:bg-accent rounded-lg text-primary hover:text-primary/80 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(schedule)}
                        className="p-2 hover:bg-accent rounded-lg text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
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
