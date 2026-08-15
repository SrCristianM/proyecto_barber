import { Calendar as CalendarIcon } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function ScheduleDetailModal({ schedule, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Horario" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Barbero</label>
            <p className="text-foreground font-medium">{schedule.barber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Día</label>
            <p className="text-foreground font-medium">{schedule.day}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Hora de Inicio</label>
            <p className="text-foreground">{schedule.startTime}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Hora de Fin</label>
            <p className="text-foreground">{schedule.endTime}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                schedule.status === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {schedule.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Horario</label>
            <p className="text-foreground">#{schedule.id}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notas</label>
            <p className="text-foreground">{schedule.notes || "Sin notas adicionales"}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Horario
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
