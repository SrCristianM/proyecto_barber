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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <SortHeader label="Servicio" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Categoría" field="id_categoria_servicio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Duración" field="duracion_minutos" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Precio" field="precio" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-left py-3 px-4">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
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
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {service.imagen_url ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                        <img
                          src={service.imagen_url}
                          alt={service.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML =
                              `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 3 6 6m-6 0 6-6"/><path d="M10.5 9.5a5 5 0 1 1 5 5"/><path d="m16 16-2-2"/><path d="m14 18-2-2 4-4"/></svg>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-foreground text-sm">{service.nombre}</p>
                        {(service.id_servicio === 1 || service.id_servicio === 2) && (
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.2 rounded-full">
                            ★ TOP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-foreground text-sm font-medium">{getCategoryName(service.id_categoria_servicio)}</td>
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5 min-w-[100px]">
                    <span className="text-xs font-semibold text-foreground">{service.duracion_minutos} min</span>
                    <div className="w-20 h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
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
                <td className="py-3.5 px-4 font-bold text-foreground text-sm font-mono">${Number(service.precio).toLocaleString("es-CO")}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      service.estado === 1 ? "badge-glow-success" : "badge-glow-destructive"
                    }`}
                  >
                    {service.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onDetail(service)} className="p-2 hover:bg-background rounded-lg text-foreground" title="Ver detalle">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(service)}
                      className={`p-2 hover:bg-background rounded-lg transition-colors ${service.estado === 1 ? "text-success" : "text-muted-foreground"}`}
                      title={service.estado === 1 ? "Desactivar" : "Activar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(service)} className="p-2 hover:bg-background rounded-lg text-primary" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(service)} className="p-2 hover:bg-background rounded-lg text-destructive" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando {services.length} de {totalCount} servicios
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Anterior</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-accent text-foreground">Siguiente</button>
        </div>
      </div>
    </>
  );
}
