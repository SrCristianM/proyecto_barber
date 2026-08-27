import Modal from "../../shared/components/Modal";
import RolePermissionBlock from "./RolePermissionBlock";

export default function RoleDetailModal({ role, onEdit, onClose }) {
  if (!role) return null;

  return (
    <Modal title="Detalle del Rol" onClose={onClose} maxWidthClass="max-w-xl">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Rol
            </span>
            <span className="text-base font-bold text-foreground">#{role.id_rol}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              role.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {role.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div>
            <span className="text-muted-foreground font-medium block mb-1">Nombre del Rol</span>
            <p className="text-sm font-semibold text-primary">{role.nombre_rol}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Descripción del Rol</span>
            <p className="text-sm font-medium text-foreground">{role.descripcion || "Sin descripción asignada"}</p>
          </div>

          {role.fecha_creacion && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-muted-foreground font-medium block mb-1">Fecha de Creación</span>
              <p className="text-xs text-foreground font-medium">{role.fecha_creacion}</p>
            </div>
          )}
        </div>

        {/* Permisos */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Permisos Asignados al Rol
          </span>
          <RolePermissionBlock
            roleName={role.nombre_rol}
            permisos={role.permisos}
            alcancePorPermiso={role.alcancePorPermiso}
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
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
