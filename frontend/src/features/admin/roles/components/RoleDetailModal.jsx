import Modal from "../../shared/components/Modal";
import RolePermissionBlock from "./RolePermissionBlock";

export default function RoleDetailModal({ role, onEdit, onClose }) {
  if (!role) return null;

  return (
    <Modal title="Detalle del Rol" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Rol
            </span>
            <span className="text-xl font-bold text-foreground">#{role.id_rol}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              role.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {role.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre del Rol
            </span>
            <p className="text-base font-bold text-primary">{role.nombre_rol}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Descripción del Rol
            </span>
            <p className="text-sm font-medium text-foreground">{role.descripcion || "Sin descripción asignada"}</p>
          </div>

          {role.fecha_creacion && (
            <div className="pt-3 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Fecha de Creación
              </span>
              <p className="text-sm text-foreground font-medium">{role.fecha_creacion}</p>
            </div>
          )}
        </div>

        {/* Permisos */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
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
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Rol
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
