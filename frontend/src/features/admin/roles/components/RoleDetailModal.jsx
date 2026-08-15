import { Shield } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function RoleDetailModal({ role, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Rol" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre del Rol</label>
            <p className="text-foreground font-medium">{role.name}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
            <p className="text-foreground">{role.description || "Sin descripción"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Permisos</label>
            <p className="text-foreground font-medium">{role.permissions}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Usuarios</label>
            <p className="text-foreground font-medium">{role.users}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                role.status === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {role.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha de Creación</label>
            <p className="text-foreground">{role.createdAt}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Rol
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
