import { User } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { ROLES } from "../../../../shared/types/database";

export default function UserDetailModal({ user, onEdit, onClose }) {
  const roleName = ROLES.find((r) => r.id_rol === Number(user.id_rol))?.nombre_rol || "Sin Rol";

  return (
    <Modal title="Detalle del Usuario" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
            <p className="text-foreground font-medium">{user.nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Apellido</label>
            <p className="text-foreground font-medium">{user.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Correo</label>
            <p className="text-foreground">{user.correo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Teléfono</label>
            <p className="text-foreground">{user.telefono || "No especificado"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Rol</label>
            <p className="text-foreground font-medium">{roleName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                user.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {user.estado === 1 ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha de Registro</label>
            <p className="text-foreground">{user.fecha_registro}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Usuario</label>
            <p className="text-foreground">#{user.id_usuario}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Usuario
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
