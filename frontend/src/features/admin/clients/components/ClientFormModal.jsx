import Modal from "../../shared/components/Modal";
import { availableLoyalties } from "../hooks/useClients";

export default function ClientFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Crear Nuevo Cliente" : "Editar Cliente"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="Ej: Pedro"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Apellido</label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="Ej: López"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Dirección</label>
          <input
            type="text"
            value={formData.direccion || ""}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="Ej: Calle 10 # 5-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nivel de Fidelidad</label>
          <select
            value={formData.nivel_fidelidad}
            onChange={(e) => setFormData({ ...formData, nivel_fidelidad: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {availableLoyalties.map((loyalty) => (
              <option key={loyalty} value={loyalty}>
                {loyalty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isCreate ? "Crear Cliente" : "Guardar Cambios"}
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
