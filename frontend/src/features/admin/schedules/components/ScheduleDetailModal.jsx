import Modal from "../../shared/components/Modal";
import { barbers } from "../hooks/useSchedules";

export default function ScheduleDetailModal({ schedule, onEdit, onClose }) {
  if (!schedule) return null;
  const barberName = barbers.find((b) => b.id_barbero === Number(schedule.id_barbero))?.nombre || "Sin Barbero";
  const dias = schedule.dias_semana || (schedule.dia_semana ? [schedule.dia_semana] : []);

  return (
    <Modal title="Detalle del Horario" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Horario
            </span>
            <span className="text-xl font-bold text-foreground">#{schedule.id_horario}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              schedule.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {schedule.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Barbero Asignado
            </span>
            <p className="text-base font-bold text-primary">{barberName}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Días Habilitados de Atención
            </span>
            <div className="flex flex-wrap gap-2">
              {dias.map((dia) => (
                <span key={dia} className="px-3.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                  {dia}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Hora de Inicio
            </span>
            <p className="text-base font-mono font-bold text-foreground">{schedule.hora_inicio}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Hora de Fin
            </span>
            <p className="text-base font-mono font-bold text-foreground">{schedule.hora_fin}</p>
          </div>

          {(schedule.fecha_inicio || schedule.fecha_fin) && (
            <div className="sm:col-span-2 pt-3 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Vigencia del Horario
              </span>
              <p className="text-sm text-foreground font-medium">
                {schedule.fecha_inicio || "Indefinida"} → {schedule.fecha_fin || "Indefinida"}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Horario
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
