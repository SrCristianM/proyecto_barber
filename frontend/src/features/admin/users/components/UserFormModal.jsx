import Modal from "../../shared/components/Modal";
import { availableRoles } from "../hooks/useUsers";

export default function UserFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Crear Nuevo Usuario" : "Editar Usuario"} onClose={onClose}>
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
              placeholder="Ej: Juan"
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
              placeholder="Ej: Pérez"
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
          <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
          <select
            value={formData.id_rol}
            onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {availableRoles.map((role) => (
              <option key={role.id_rol} value={role.id_rol}>
                {role.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        {isCreate && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
            <input
              type="password"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isCreate ? "Crear Usuario" : "Guardar Cambios"}
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
