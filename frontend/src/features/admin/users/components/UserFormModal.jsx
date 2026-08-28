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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              maxLength={80}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="Ej: Juan"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Apellido <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              id="apellido"
              maxLength={80}
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="Ej: Pérez"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Correo Electrónico <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            name="correo"
            id="correo"
            maxLength={120}
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            id="telefono"
            maxLength={20}
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Rol en el Sistema <span className="text-destructive">*</span>
          </label>
          <select
            name="id_rol"
            id="id_rol"
            value={formData.id_rol}
            onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            required
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              name="contrasena"
              id="contrasena"
              maxLength={255}
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Crear Usuario" : "Guardar Cambios"}
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
