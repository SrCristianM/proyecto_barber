import { Scissors, Eye, Power, Edit, Trash2 } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";

export default function ServicesTable({
  services,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  const getCategoryName = (id_cat) => {
    const c = CATEGORIAS_SERVICIO.find((cat) => cat.id_categoria_servicio === Number(id_cat));
    return c ? c.nombre : "Sin Categoría";
  };

  return (
    <>
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[500px] md:min-w-0 md:w-full lg:min-w-[680px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Servicio" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Categoría" field="id_categoria_servicio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Duración" field="duracion_minutos" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Precio" field="precio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-2 px-2 md:px-3 lg:px-4 sm:py-3">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 md:px-3 lg:px-4 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id_servicio}
                id={`row-srv-${service.id_servicio}`}
                data-highlight-id={`srv-${service.id_servicio}`}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                <td className="py-2.5 px-2 sm:py-4 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {service.imagen_url ? (
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg overflow-hidden border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                        <img
                          src={service.imagen_url}
                          alt={service.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML =
                              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 3 6 6m-6 0 6-6"/><path d="M10.5 9.5a5 5 0 1 1 5 5"/><path d="m16 16-2-2"/><path d="m14 18-2-2 4-4"/></svg>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                        <Scissors className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <p className="font-bold text-foreground text-xs sm:text-sm line-clamp-2 leading-tight max-w-[110px] sm:max-w-none">{service.nombre}</p>
                        {(service.id_servicio === 1 || service.id_servicio === 2) && (
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/30 px-1 py-0.2 rounded-full">
                            ★ TOP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-foreground text-xs sm:text-sm font-medium whitespace-nowrap">{getCategoryName(service.id_categoria_servicio)}</td>
                <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                  <div className="space-y-1 min-w-[70px] sm:min-w-[100px]">
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground whitespace-nowrap">{service.duracion_minutos} min</span>
                    <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
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
                </td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-bold text-foreground text-xs sm:text-sm font-mono whitespace-nowrap">${Number(service.precio).toLocaleString("es-CO")}</td>
                <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${
                      service.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                    }`}
                  >
                    {service.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2.5 px-2 sm:py-4 sm:px-4">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <button onClick={() => onDetail(service)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-foreground cursor-pointer" title="Ver detalle">
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(service)}
                        className={`p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg transition-colors cursor-pointer ${service.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                        title={service.estado === 1 ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(service)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-primary cursor-pointer" title="Editar">
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(service)} className="p-1 sm:p-2 hover:bg-background rounded-md sm:rounded-lg text-destructive cursor-pointer" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Mostrando {services.length} de {totalCount} servicios
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button className="px-2.5 py-1 text-xs sm:text-sm border border-border rounded-md hover:bg-accent text-foreground cursor-pointer">Anterior</button>
          <button className="px-2.5 py-1 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md font-semibold cursor-pointer">1</button>
          <button className="px-2.5 py-1 text-xs sm:text-sm border border-border rounded-md hover:bg-accent text-foreground cursor-pointer">Siguiente</button>
        </div>
      </div>
    </>
  );
}
