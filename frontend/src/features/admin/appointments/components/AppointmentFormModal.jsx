import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Scissors, UserCheck } from "lucide-react";
import Modal from "../../shared/components/Modal";
import DateRangePicker from "../../shared/components/DateRangePicker";
import { ESTADOS_CITA } from "../../../../shared/types/database";

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
  clients,
  barbers,
  services
}) {
  const isCreate = mode === "create";

  const selectedService = services.find((s) => s.id_servicio === Number(formData.id_servicio));

  // Manejo de la fecha seleccionada en el componente de Calendario
  const selectedDateObj = formData.fecha ? new Date(formData.fecha + "T00:00:00") : new Date();

  const handleCalendarDateChange = (date) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    setFormData({ ...formData, fecha: formattedDate });
  };

  return (
    <Modal
      title={isCreate ? "Agendar Nueva Cita" : "Editar Cita"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Fila 1: Cliente y Barbero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cliente <span className="text-destructive">*</span>
            </label>
            <select
              name="id_cliente"
              id="id_cliente"
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
              autoFocus
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

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
            >
              <option value="">Seleccionar barbero</option>
              {barbers.map((b) => (
                <option key={b.id_barbero} value={b.id_barbero}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2: Servicio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Servicio a Realizar <span className="text-destructive">*</span>
          </label>
          <select
            name="id_servicio"
            id="id_servicio"
            value={formData.id_servicio}
            onChange={(e) => setFormData({ ...formData, id_servicio: Number(e.target.value) })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            required
          >
            <option value="">Seleccionar servicio del catálogo</option>
            {services.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre} — ${Number(s.precio).toLocaleString("es-CO")} ({s.duracion_minutos} min)
              </option>
            ))}
          </select>
        </div>

        {/* Fila 3: Selección Visual de Fecha con Calendario y Horas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 bg-secondary/20 border border-border/70 rounded-2xl">
          {/* Calendario visual interactivo */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Selecciona la Fecha en el Calendario
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
            {/* Input oculto / accesible para binding exacto del formulario */}
            <input type="hidden" name="fecha" id="fecha" value={formData.fecha} required />
          </div>

          {/* Selector de Horarios */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Horario Disponible
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
                      onClick={() => setFormData({ ...formData, hora: slot })}
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
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-xs text-center font-bold"
                  required
                />
              </div>
            </div>

            {/* Resumen de servicio y precio */}
            {selectedService && (
              <div className="mt-3 p-3 bg-card border border-border/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Total a pagar
                  </span>
                  <span className="text-xs font-medium text-foreground">{selectedService.nombre}</span>
                </div>
                <span className="text-sm font-extrabold text-primary">
                  ${Number(selectedService.precio).toLocaleString("es-CO")}
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
                    onChange={() => setFormData({ ...formData, estado })}
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
            disabled={!formData.id_cliente || !formData.id_barbero || !formData.id_servicio || !formData.fecha || !formData.hora}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
