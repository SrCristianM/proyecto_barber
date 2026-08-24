import Modal from "../../shared/components/Modal";
import DateRangePicker from "../../shared/components/DateRangePicker";
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

  const handleRangeChange = ({ start, end }) => {
    setFormData({
      ...formData,
      fecha_inicio: start ? start.toISOString().split("T")[0] : null,
      fecha_fin: end ? end.toISOString().split("T")[0] : null
    });
  };

  const startDate = formData.fecha_inicio ? new Date(formData.fecha_inicio + "T00:00:00") : null;
  const endDate = formData.fecha_fin ? new Date(formData.fecha_fin + "T00:00:00") : null;

  const selectedDays = formData.dias_semana || [];

  return (
    <Modal title={isCreate ? "Crear Nuevo Horario" : "Editar Horario"} onClose={onClose} maxWidthClass="max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Barbero */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Barbero</label>
          <select
            value={formData.id_barbero}
            onChange={(e) => setFormData({ ...formData, id_barbero: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          >
            {barbers.map((barber) => (
              <option key={barber.id_barbero} value={barber.id_barbero}>
                {barber.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Días de la semana — checkboxes múltiples */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Días disponibles{" "}
            <span className="text-muted-foreground font-normal text-xs">(selección múltiple)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {daysOfWeek.map((day) => {
              const isChecked = selectedDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border cursor-pointer transition-all text-xs font-medium select-none ${
                    isChecked
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-input-background border-input text-foreground hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDay(day)}
                    className="sr-only"
                  />
                  {day.slice(0, 3)}
                </label>
              );
            })}
          </div>
          {selectedDays.length === 0 && (
            <p className="text-xs text-destructive mt-1">Selecciona al menos un día</p>
          )}
        </div>

        {/* Horas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Hora de Inicio</label>
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Hora de Fin</label>
            <input
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
        </div>

        {/* Calendario con rango de fechas */}
        <DateRangePicker
          label="Rango de fechas (opcional)"
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleRangeChange}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={selectedDays.length === 0}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Crear Horario" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
