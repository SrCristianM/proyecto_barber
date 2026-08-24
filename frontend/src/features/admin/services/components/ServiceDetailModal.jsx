import { Scissors } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";

export default function ServiceDetailModal({ service, onEdit, onClose }) {
  const categoryName =
    CATEGORIAS_SERVICIO.find((c) => c.id_categoria_servicio === Number(service.id_categoria_servicio))?.nombre ||
    "Sin Categoría";

  return (
    <Modal title="Detalle del Servicio" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          {service.imagen_url ? (
            <img
              src={service.imagen_url}
              alt={service.nombre}
              className="w-24 h-24 rounded-lg object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
              <Scissors className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre del Servicio</label>
            <p className="text-foreground font-medium">{service.nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
            <p className="text-foreground font-medium">{categoryName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Precio</label>
            <p className="text-foreground font-medium">${Number(service.precio).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Duración</label>
            <p className="text-foreground">{service.duracion_minutos} minutos</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                service.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {service.estado === 1 ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Servicio</label>
            <p className="text-foreground">#{service.id_servicio}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Servicio
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
