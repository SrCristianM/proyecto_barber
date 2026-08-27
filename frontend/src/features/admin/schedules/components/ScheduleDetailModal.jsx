import Modal from "../../shared/components/Modal";
import { barbers } from "../hooks/useSchedules";

export default function ScheduleDetailModal({ schedule, onEdit, onClose }) {
  if (!schedule) return null;
  const barberName = barbers.find((b) => b.id_barbero === Number(schedule.id_barbero))?.nombre || "Sin Barbero";
  const dias = schedule.dias_semana || (schedule.dia_semana ? [schedule.dia_semana] : []);

  return (
    <Modal title="Detalle del Horario" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Horario
            </span>
            <span className="text-base font-bold text-foreground">#{schedule.id_horario}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              schedule.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {schedule.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Barbero Asignado</span>
            <p className="text-sm font-semibold text-primary">{barberName}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1.5">Días Habilitados</span>
            <div className="flex flex-wrap gap-1.5">
              {dias.map((dia) => (
                <span key={dia} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md border border-primary/20">
                  {dia}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Hora Inicio</span>
            <p className="text-sm font-mono font-bold text-foreground">{schedule.hora_inicio}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Hora Fin</span>
            <p className="text-sm font-mono font-bold text-foreground">{schedule.hora_fin}</p>
          </div>

          {(schedule.fecha_inicio || schedule.fecha_fin) && (
            <div className="sm:col-span-2 pt-2 border-t border-border/50">
              <span className="text-muted-foreground font-medium block mb-1">Vigencia del Horario</span>
              <p className="text-xs text-foreground font-medium">
                {schedule.fecha_inicio || "Indefinida"} → {schedule.fecha_fin || "Indefinida"}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
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
