import Modal from "../../shared/components/Modal";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";

export default function ServiceDetailModal({ service, onEdit, onClose }) {
  if (!service) return null;

  const categoryName =
    CATEGORIAS_SERVICIO.find((c) => c.id_categoria_servicio === Number(service.id_categoria_servicio))?.nombre ||
    "Sin Categoría";

  return (
    <Modal title="Detalle del Servicio" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Servicio
            </span>
            <span className="text-base font-bold text-foreground">#{service.id_servicio}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              service.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {service.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Nombre del Servicio</span>
            <p className="text-sm font-semibold text-foreground">{service.nombre}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Categoría</span>
            <p className="text-sm font-semibold text-primary">{categoryName}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Precio al Público</span>
            <p className="text-sm font-bold text-foreground">${Number(service.precio).toLocaleString("es-CO")}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Duración Estimada</span>
            <p className="text-sm font-medium text-foreground">{service.duracion_minutos} minutos</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Tipo de Servicio</span>
            <p className="text-sm font-medium text-foreground">Individual / Paquete</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Editar Servicio
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
