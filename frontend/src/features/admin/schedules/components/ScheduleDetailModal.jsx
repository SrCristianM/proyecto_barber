import Modal from "../../shared/components/Modal";
import { barbers } from "../hooks/useSchedules";

export default function ScheduleDetailModal({ schedule, onEdit, onClose }) {
  const barberName = barbers.find((b) => b.id_barbero === Number(schedule.id_barbero))?.nombre || "Sin Barbero";
  const dias = schedule.dias_semana || (schedule.dia_semana ? [schedule.dia_semana] : []);

  return (
    <Modal title="Detalle del Horario" onClose={onClose} maxWidthClass="max-w-md">
      <div className="space-y-4">
        {/* Header compacto */}
        <div className="flex items-start justify-between p-4 bg-muted/40 rounded-xl border border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">{barberName}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Horario #{schedule.id_horario}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${
              schedule.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            {schedule.estado === 1 ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Días */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Días de atención
          </label>
          <div className="flex flex-wrap gap-1.5">
            {dias.map((dia) => (
              <span key={dia} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                {dia}
              </span>
            ))}
          </div>
        </div>

        {/* Horario */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Hora inicio</p>
            <p className="text-lg font-bold font-mono text-foreground">{schedule.hora_inicio}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Hora fin</p>
            <p className="text-lg font-bold font-mono text-foreground">{schedule.hora_fin}</p>
          </div>
        </div>

        {/* Rango de fechas si existe */}
        {(schedule.fecha_inicio || schedule.fecha_fin) && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
              Rango de fechas
            </label>
            <p className="text-sm text-foreground">
              {schedule.fecha_inicio || "—"} → {schedule.fecha_fin || "—"}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            Editar Horario
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
