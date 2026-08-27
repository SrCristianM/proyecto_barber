import Modal from "../../shared/components/Modal";
import { ROLES } from "../../../../shared/types/database";

export default function UserDetailModal({ user, onEdit, onClose }) {
  if (!user) return null;
  const roleName = ROLES.find((r) => r.id_rol === Number(user.id_rol))?.nombre_rol || "Sin Rol";

  return (
    <Modal title="Detalle del Usuario" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Usuario
            </span>
            <span className="text-base font-bold text-foreground">#{user.id_usuario}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              user.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {user.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div>
            <span className="text-muted-foreground font-medium block mb-1">Nombre Completo</span>
            <p className="text-sm font-semibold text-foreground">{user.nombre} {user.apellido}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Rol Asignado</span>
            <p className="text-sm font-semibold text-primary">{roleName}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Correo Electrónico</span>
            <p className="text-sm font-medium text-foreground break-all">{user.correo}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Teléfono</span>
            <p className="text-sm font-medium text-foreground">{user.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground font-medium block mb-1">Fecha de Registro</span>
            <p className="text-xs text-foreground font-medium">{user.fecha_registro}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Editar Usuario
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
