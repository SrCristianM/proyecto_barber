import Modal from "../../shared/components/Modal";
import { barbers, daysOfWeek } from "../hooks/useSchedules";

export default function ScheduleFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Crear Nuevo Horario" : "Editar Horario"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Barbero</label>
          <select
            value={formData.id_barbero}
            onChange={(e) => setFormData({ ...formData, id_barbero: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {barbers.map((barber) => (
              <option key={barber.id_barbero} value={barber.id_barbero}>
                {barber.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Día de la Semana</label>
          <select
            value={formData.dia_semana}
            onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Hora de Inicio</label>
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Hora de Fin</label>
            <input
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isCreate ? "Crear Horario" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
