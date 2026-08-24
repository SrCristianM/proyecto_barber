import { Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";

export default function ServiceCard({ service, onEdit, onDelete }) {
  const categoryName =
    CATEGORIAS_SERVICIO.find((c) => c.id_categoria_servicio === Number(service.id_categoria_servicio))?.nombre ||
    "Sin Categoría";

  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
            {categoryName}
          </span>
          <h3 className="font-semibold text-foreground mt-2">{service.nombre}</h3>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            service.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          {service.estado === 1 ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4" />
          <span>{service.duracion_minutos} minutos</span>
        </div>
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>${Number(service.precio).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit && onEdit(service)}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-1"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete && onDelete(service)}
          className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
