import { User } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function BarberDetailModal({ barber, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Barbero" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
            <p className="text-foreground font-medium">{barber.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Especialidad</label>
            <p className="text-foreground font-medium">{barber.specialty}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Correo</label>
            <p className="text-foreground">{barber.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Teléfono</label>
            <p className="text-foreground">{barber.phone || "No especificado"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                barber.status === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {barber.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha de Creación</label>
            <p className="text-foreground">{barber.createdAt}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Barbero</label>
            <p className="text-foreground">#{barber.id}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Barbero
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
