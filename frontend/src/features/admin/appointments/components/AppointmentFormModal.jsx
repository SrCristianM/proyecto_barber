import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Scissors, UserCheck } from "lucide-react";
import Modal from "../../shared/components/Modal";
import DateRangePicker from "../../shared/components/DateRangePicker";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import MultiSelectSearchable from "../../shared/components/MultiSelectSearchable";
import { ESTADOS_CITA } from "../../../../shared/types/database";
import { validateAppointmentForm } from "../validations/appointmentValidation";

const QUICK_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function AppointmentFormModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose,
  clients = [],
  barbers = [],
  services = [],
  packages = []
}) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});

  const serviceOptions = (services || []).map((s) => ({
    value: `svc-${s.id_servicio}`,
    label: `${s.nombre} — $${Number(s.precio).toLocaleString("es-CO")} (${s.duracion_minutos} min)`,
    category: "Servicios Individuales",
    price: Number(s.precio) || 0,
    duration: Number(s.duracion_minutos) || 0,
    nombre: s.nombre
  }));

  const defaultPackages = [
    { id_paquete: 1, nombre: "Paquete Básico (Corte + Afeitado)", descuento_porcentaje: 10, precio: 31500, duracion_minutos: 65 },
    { id_paquete: 2, nombre: "Paquete Premium (Corte + Barba + Color)", descuento_porcentaje: 20, precio: 44000, duracion_minutos: 105 },
    { id_paquete: 3, nombre: "Paquete Especial (Corte Clásico + Barba)", descuento_porcentaje: 15, precio: 34000, duracion_minutos: 75 }
  ];

  const actualPackages = packages && packages.length > 0 ? packages : defaultPackages;

  const packageOptions = actualPackages.map((p) => ({
    value: `pkg-${p.id_paquete}`,
    label: `${p.nombre} — ${p.descuento_porcentaje}% DCTO ($${Number(p.precio || 30000).toLocaleString("es-CO")})`,
    category: "Paquetes de Servicios",
    price: Number(p.precio || 30000),
    duration: Number(p.duracion_minutos || 60),
    nombre: p.nombre
  }));

  const catalogOptions = [...serviceOptions, ...packageOptions];

  // Identificar selección actual
  const selectedValues = formData.servicios_seleccionados !== undefined
    ? (Array.isArray(formData.servicios_seleccionados) ? formData.servicios_seleccionados : [])
    : formData.id_servicio
      ? [`svc-${formData.id_servicio}`]
      : [];

  const selectedItems = catalogOptions.filter((item) => selectedValues.includes(item.value));
  const totalPrice = selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalDuration = selectedItems.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleServicesChange = (newValues) => {
    let firstServiceId = "";
    for (const val of newValues) {
      if (String(val).startsWith("svc-")) {
        firstServiceId = Number(String(val).replace("svc-", ""));
        break;
      }
    }
    if (!firstServiceId && newValues.length > 0) {
      firstServiceId = 1;
    }

    const items = catalogOptions.filter((item) => newValues.includes(item.value));
    const calcPrice = items.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const calcDuration = items.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    setFormData((prev) => ({
      ...prev,
      servicios_seleccionados: newValues,
      id_servicio: firstServiceId,
      precio: calcPrice,
      duracion_minutos: calcDuration
    }));

    if (errors.servicios || errors.id_servicio) {
      setErrors((prev) => ({ ...prev, servicios: null, id_servicio: null }));
    }
  };

  // Manejo de la fecha seleccionada en el componente de Calendario
  const selectedDateObj = formData.fecha ? new Date(formData.fecha + "T00:00:00") : new Date();

  const handleCalendarDateChange = (date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    handleChange("fecha", formattedDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateAppointmentForm(formData, isCreate);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal
      title={isCreate ? "Agendar Nueva Cita" : "Editar Cita"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Fila 1: Cliente y Barbero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <SearchableSelect
              label="Cliente"
              required
              options={clients.map((c) => ({ value: c.id_cliente, label: c.nombre }))}
              value={formData.id_cliente}
              onChange={(val) => handleChange("id_cliente", val)}
              placeholder="Buscar o seleccionar cliente..."
              error={errors.id_cliente}
            />
          </div>

          {/* Barbero */}
          <div>
            <SearchableSelect
              label="Barbero / Profesional"
              required
              options={barbers.map((b) => ({ value: b.id_barbero, label: b.nombre }))}
              value={formData.id_barbero}
              onChange={(val) => handleChange("id_barbero", val)}
              placeholder="Buscar o seleccionar barbero..."
              error={errors.id_barbero}
            />
          </div>
        </div>

        {/* Fila 2: Servicios y Paquetes MultiSelect */}
        <div>
          <MultiSelectSearchable
            label="Servicios y Paquetes de Barbería"
            required
            options={catalogOptions}
            value={selectedValues}
            selectedValues={selectedValues}
            onChange={handleServicesChange}
            placeholder="Buscar cortes, barbas, afeitados o paquetes promocionales..."
            groupByCategory={true}
            error={errors.servicios || errors.id_servicio}
          />
        </div>

        {/* Fila 3: Selección Visual de Fecha con Calendario y Horas */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 bg-secondary/20 border rounded-2xl transition-all ${
          errors.fecha || errors.hora ? "border-destructive/60 ring-1 ring-destructive/20" : "border-border/70"
        }`}>
          {/* Calendario visual interactivo */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Selecciona la Fecha en el Calendario <span className="text-destructive">*</span>
              </span>
            </div>
            <DateRangePicker
              singleMode={true}
              value={selectedDateObj}
              onChange={handleCalendarDateChange}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Fecha seleccionada:</span>
              <span className="font-semibold text-foreground bg-card px-2.5 py-1 rounded-md border border-border">
                {formData.fecha || "Sin fecha seleccionada"}
              </span>
            </div>
            <FormFieldError error={errors.fecha} />
          </div>

          {/* Selector de Horarios */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Horario Disponible <span className="text-destructive">*</span>
                </span>
              </div>
              <label className="block text-xs text-muted-foreground mb-2">
                Elige un turno o ingresa la hora exacta:
              </label>

              {/* Grid de turnos rápidos */}
              <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1 mb-3">
                {QUICK_TIME_SLOTS.map((slot) => {
                  const isSelected = formData.hora?.startsWith(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleChange("hora", slot)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card border-border text-foreground hover:bg-accent hover:border-primary/40"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {/* Input manual de hora */}
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Hora personalizada <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  name="hora"
                  id="hora"
                  value={formData.hora}
                  onChange={(e) => handleChange("hora", e.target.value)}
                  className={`w-full px-3 py-2 bg-input-background border rounded-xl focus:outline-none text-foreground text-xs text-center font-bold transition-all ${
                    errors.hora
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                />
                <FormFieldError error={errors.hora} />
              </div>
            </div>

            {/* Resumen de servicio y precio */}
            {selectedItems.length > 0 && (
              <div className="mt-3 p-3 bg-card border border-border/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Total a pagar ({selectedItems.length} {selectedItems.length === 1 ? "ítem" : "ítems"})
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Duración aprox: ~{totalDuration} min
                  </span>
                </div>
                <span className="text-base font-extrabold text-primary">
                  ${Number(totalPrice).toLocaleString("es-CO")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Estado de la Cita */}
        {!isCreate ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Estado de la Cita</label>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_CITA.map((estado) => (
                <label
                  key={estado}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-all text-xs font-medium ${
                    formData.estado === estado
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-input-background border-input text-foreground hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="estado"
                    id={`estado_${estado}`}
                    value={estado}
                    checked={formData.estado === estado}
                    onChange={() => handleChange("estado", estado)}
                    className="sr-only"
                  />
                  {estado}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
            <span className="text-xs font-medium text-muted-foreground">Estado inicial asignado:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              ● Programada (Automático)
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Agendar Cita en Calendario" : "Guardar Cambios"}
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
