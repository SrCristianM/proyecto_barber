import Modal from "../../shared/components/Modal";
import RolePermissionBlock from "./RolePermissionBlock";

export default function RoleDetailModal({ role, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Rol" onClose={onClose}>
      <div className="space-y-4">
        {/* Header compacto con nombre y estado */}
        <div className="flex items-start justify-between p-4 bg-muted/40 rounded-xl border border-border">
          <div>
            <h3 className="text-xl font-bold text-foreground">{role.nombre_rol}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">#{role.id_rol} · {role.fecha_creacion?.split(" ")[0]}</p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${
              role.estado === 1
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {role.estado === 1 ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Descripción</label>
          <p className="text-foreground text-sm">{role.descripcion || "Sin descripción"}</p>
        </div>

        {/* Permisos */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Permisos asignados</label>
          <RolePermissionBlock
            roleName={role.nombre_rol}
            permisos={role.permisos}
            alcancePorPermiso={role.alcancePorPermiso}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onEdit} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
            Editar Rol
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

