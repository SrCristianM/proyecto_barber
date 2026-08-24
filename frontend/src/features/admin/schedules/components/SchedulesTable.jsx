import { Clock, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { barbers } from "../hooks/useSchedules";

export default function SchedulesTable({
  schedules,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  const getBarberName = (id_barbero) => {
    const b = barbers.find((barber) => barber.id_barbero === Number(id_barbero));
    return b ? b.nombre : "Sin Barbero";
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Barbero" field="id_barbero" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Día" field="dia_semana" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Hora Inicio" field="hora_inicio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Hora Fin" field="hora_fin" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id_horario} className="border-b border-border hover:bg-accent/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{getBarberName(schedule.id_barbero)}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{schedule.dia_semana}</td>
                <td className="py-4 px-4 text-foreground font-mono text-sm">{schedule.hora_inicio}</td>
                <td className="py-4 px-4 text-foreground font-mono text-sm">{schedule.hora_fin}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      schedule.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {schedule.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(schedule)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(schedule.id_horario)}
                      className={`p-2 hover:bg-background rounded-lg ${schedule.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                      title={schedule.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(schedule)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(schedule)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
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
          Mostrando {schedules.length} de {totalCount} horarios
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
