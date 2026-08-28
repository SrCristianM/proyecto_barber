import Modal from "../../shared/components/Modal";
import { barbers, daysOfWeek } from "../hooks/useSchedules";

export default function ScheduleFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  const toggleDay = (day) => {
    const current = formData.dias_semana || [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setFormData({ ...formData, dias_semana: next });
  };

  const selectedDays = formData.dias_semana || [];
  const isTimeValid = formData.hora_inicio && formData.hora_fin && formData.hora_fin > formData.hora_inicio;

  return (
    <Modal title={isCreate ? "Configurar Horario de Barbero" : "Editar Horario"} onClose={onClose} maxWidthClass="max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isTimeValid || selectedDays.length === 0) return;
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Barbero */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Barbero / Profesional <span className="text-destructive">*</span>
          </label>
          <select
            name="id_barbero"
            id="id_barbero"
            value={formData.id_barbero}
            onChange={(e) => setFormData({ ...formData, id_barbero: Number(e.target.value) })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            required
            autoFocus
          >
            {barbers.map((barber) => (
              <option key={barber.id_barbero} value={barber.id_barbero}>
                {barber.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Días de la semana (ENUM dia_semana en BD) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Días de Disponibilidad Semanal <span className="text-destructive">*</span>
            <span className="text-muted-foreground font-normal text-xs ml-1">(dia_semana)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => {
              const isChecked = selectedDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-xs font-semibold select-none ${
                    isChecked
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-input-background border-input text-foreground hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDay(day)}
                    className="sr-only"
                  />
                  {day}
                </label>
              );
            })}
          </div>
          {selectedDays.length === 0 && (
            <p className="text-xs text-destructive mt-1.5">Selecciona al menos un día de atención</p>
          )}
        </div>

        {/* Horas con validación CHECK (hora_fin > hora_inicio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hora de Inicio <span className="text-destructive">*</span>
            </label>
            <input
              type="time"
              name="hora_inicio"
              id="hora_inicio"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hora de Fin <span className="text-destructive">*</span>
            </label>
            <input
              type="time"
              name="hora_fin"
              id="hora_fin"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
        </div>

        {!isTimeValid && formData.hora_inicio && formData.hora_fin && (
          <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
            Restricción de base de datos: La hora de fin debe ser posterior a la hora de inicio.
          </p>
        )}

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={selectedDays.length === 0 || !isTimeValid}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Guardar Horario" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
