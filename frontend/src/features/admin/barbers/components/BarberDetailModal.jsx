import { User } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function BarberDetailModal({ barber, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Barbero" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          {barber.imagen_url ? (
            <img
              src={barber.imagen_url}
              alt={`${barber.nombre} ${barber.apellido}`}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
            <p className="text-foreground font-medium">{barber.nombre} {barber.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Especialidad</label>
            <p className="text-foreground font-medium">{barber.especialidad || "Sin especialidad"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Correo</label>
            <p className="text-foreground">{barber.correo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Teléfono</label>
            <p className="text-foreground">{barber.telefono || "No especificado"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                barber.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {barber.estado === 1 ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Barbero</label>
            <p className="text-foreground">#{barber.id_barbero}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Usuario Asociado</label>
            <p className="text-foreground">#{barber.id_usuario}</p>
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
