import { Scissors, Eye, Power, Edit, Trash2, Clock, Layers } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";
import { availableCategories } from "../hooks/useServices";

export default function ServiceCard({ service, onDetail, onToggleStatus, onEdit, onDelete }) {
  const isActive = service.estado === 1;
  const category = availableCategories.find((c) => c.id_categoria_servicio === Number(service.id_categoria_servicio));
  const categoryName = category ? category.nombre : "General";
  const isTop = service.id_servicio === 1 || service.id_servicio === 2;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-srv-${service.id_servicio}`}
        data-highlight-id={`srv-${service.id_servicio}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-3">
              {service.imagen_url ? (
                <img
                  src={service.imagen_url}
                  alt={service.nombre}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/30 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                  <Scissors className="h-6 w-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-foreground text-base leading-snug">
                    {service.nombre}
                  </h3>
                  {isTop && (
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.2 rounded-full">
                      ★ TOP
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[11px] font-semibold text-muted-foreground bg-secondary rounded-lg">
                  <Layers className="h-3 w-3 text-primary" />
                  {categoryName}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isActive ? "badge-glow-success" : "badge-glow-destructive"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Duración y Segmento de Tiempo */}
          <div className="bg-secondary/40 rounded-xl p-2.5 my-3 border border-border/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                Duración del Servicio:
              </span>
              <span className="font-bold text-foreground font-mono">{service.duracion_minutos} min</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full rounded-full ${
                  service.duracion_minutos <= 30
                    ? "w-1/3 loyalty-progress-new"
                    : service.duracion_minutos <= 45
                    ? "w-2/3 loyalty-progress-silver"
                    : "w-full loyalty-progress-gold"
                }`}
              />
            </div>
          </div>

          {/* Precio */}
          <div className="flex items-center justify-between py-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Precio del Servicio</span>
            <span className="text-base font-bold text-primary font-mono">
              ${Number(service.precio).toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(service)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(service)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(service)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:text-foreground"
            }`}
            title={isActive ? "Desactivar" : "Activar"}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(service)}
              className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors cursor-pointer"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
