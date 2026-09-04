import { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import { daysOfWeek, barbers as defaultBarbers } from "../hooks/useSchedules";
import { validateScheduleForm } from "../validations/scheduleValidation";

export default function ScheduleFormModal({
  mode,
  formData,
  setFormData,
  barbers = defaultBarbers,
  onSubmit,
  onClose,
  toggleDay
}) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});

  const barberList = barbers && barbers.length > 0 ? barbers : defaultBarbers;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleToggleDay = (day) => {
    if (typeof toggleDay === "function") {
      toggleDay(day);
    } else {
      const currentDays = formData.dias_semana || [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      setFormData((prev) => ({ ...prev, dias_semana: nextDays }));
    }
    if (errors.dias_semana) {
      setErrors((prev) => ({ ...prev, dias_semana: null }));
    }
  };

  const barberOptions = barberList.map((b) => ({
    value: b.id_barbero,
    label: b.nombre
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateScheduleForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal
      title={isCreate ? "Asignar Horario Semanal" : "Editar Horario Semanal"}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Selección de Barbero con SearchableSelect */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Barbero Asignado <span className="text-destructive">*</span>
          </label>
          <SearchableSelect
            value={formData.id_barbero || ""}
            onChange={(val) => handleChange("id_barbero", Number(val))}
            options={barberOptions}
            placeholder="Seleccionar barbero..."
            searchPlaceholder="Buscar barbero..."
            disabled={!isCreate}
            error={errors.id_barbero}
          />
          <FormFieldError error={errors.id_barbero} />
        </div>

        {/* Días de la semana */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Días de Atención Semanal <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {daysOfWeek.map((day) => (
              <label
                key={day}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all font-medium ${
                  (formData.dias_semana || []).includes(day)
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-input-background border-input text-foreground hover:bg-accent/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={(formData.dias_semana || []).includes(day)}
                  onChange={() => handleToggleDay(day)}
                  className="rounded text-primary border-input focus:ring-primary h-4 w-4"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
          <FormFieldError error={errors.dias_semana} />
        </div>

        {/* Rango de Horas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hora de Inicio <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="time"
                name="hora_inicio"
                id="hora_inicio"
                value={formData.hora_inicio || "09:00"}
                onChange={(e) => handleChange("hora_inicio", e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                  errors.hora_inicio
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-input focus:ring-2 focus:ring-primary"
                }`}
              />
            </div>
            <FormFieldError error={errors.hora_inicio} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hora de Fin <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="time"
                name="hora_fin"
                id="hora_fin"
                value={formData.hora_fin || "18:00"}
                onChange={(e) => handleChange("hora_fin", e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                  errors.hora_fin
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-input focus:ring-2 focus:ring-primary"
                }`}
              />
            </div>
            <FormFieldError error={errors.hora_fin} />
          </div>
        </div>

        {/* Rango de Fechas: Disponibilidad y Vigencia del Horario (Requisito 5) */}
        <div className="p-4 bg-secondary/20 border border-border/80 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Vigencia y Disponibilidad del Horario
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Define el período de vigencia de este turno. Si es indefinido, puedes dejar los campos vacíos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Fecha de inicio del horario
              </label>
              <input
                type="date"
                name="fecha_inicio"
                id="fecha_inicio"
                value={formData.fecha_inicio || ""}
                onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-xs"
              />
              <FormFieldError error={errors.fecha_inicio} />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Fecha de fin del horario
              </label>
              <input
                type="date"
                name="fecha_fin"
                id="fecha_fin"
                value={formData.fecha_fin || ""}
                onChange={(e) => handleChange("fecha_fin", e.target.value)}
                className={`w-full px-3 py-2 bg-input-background border rounded-xl focus:outline-none text-foreground text-xs ${
                  errors.fecha_fin
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-input focus:ring-2 focus:ring-primary"
                }`}
              />
              <FormFieldError error={errors.fecha_fin} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Asignar Horario" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
