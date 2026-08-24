import Modal from "../../shared/components/Modal";
import { ESTADOS_CITA } from "../../../../shared/types/database";

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

  return (
    <Modal
      title={isCreate ? "Agendar Nueva Cita" : "Editar Cita"}
      onClose={onClose}
      maxWidthClass="max-w-lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Cliente <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.id_cliente}
            onChange={(e) => setFormData({ ...formData, id_cliente: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            required
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
            value={formData.id_barbero}
            onChange={(e) => setFormData({ ...formData, id_barbero: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
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

        {/* Servicio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Servicio <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.id_servicio}
            onChange={(e) => setFormData({ ...formData, id_servicio: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            required
          >
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre} — ${Number(s.precio).toLocaleString()} ({s.duracion_minutos} min)
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hora <span className="text-destructive">*</span>
            </label>
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_CITA.map((estado) => (
              <label
                key={estado}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-medium ${
                  formData.estado === estado
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-input-background border-input text-foreground hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="estado"
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

        {/* Precio estimado (calculado del servicio seleccionado) */}
        {formData.id_servicio && (() => {
          const svc = services.find((s) => s.id_servicio === Number(formData.id_servicio));
          return svc ? (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Precio estimado</span>
              <span className="text-sm font-bold text-primary">${Number(svc.precio).toLocaleString()}</span>
            </div>
          ) : null;
        })()}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!formData.id_cliente || !formData.id_barbero || !formData.id_servicio || !formData.fecha || !formData.hora}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Agendar Cita" : "Guardar Cambios"}
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
