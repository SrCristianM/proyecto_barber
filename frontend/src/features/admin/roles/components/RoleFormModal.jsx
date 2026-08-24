import Modal from "../../shared/components/Modal";
import RolePermissionsGrid from "./RolePermissionsGrid";

export default function RoleFormModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose,
  onToggleRolePermission
}) {
  const isCreate = mode === "create";

  return (
    <Modal
      title={isCreate ? "Crear Nuevo Rol" : "Editar Rol"}
      onClose={onClose}
      maxWidthClass="max-w-4xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nombre del Rol</label>
          <input
            type="text"
            value={formData.nombre_rol}
            onChange={(e) => setFormData({ ...formData, nombre_rol: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="Ej: Administrador"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            rows="3"
            placeholder="Descripción de los permisos y responsabilidades del rol"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground">Permisos por rol</label>
            <p className="text-sm text-muted-foreground">
              Marca o desmarca Ver, Crear, Editar y Eliminar en cada rol. El encabezado permanece fijo; si hay más permisos, usa el scroll interno de la tarjeta.
            </p>
          </div>
          <RolePermissionsGrid
            rolesPermisos={formData.rolesPermisos}
            onTogglePermission={onToggleRolePermission}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isCreate ? "Crear Rol" : "Guardar Cambios"}
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
