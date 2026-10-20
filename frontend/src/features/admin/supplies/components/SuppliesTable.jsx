import { Eye, RotateCcw, Boxes, ChevronDown, ChevronUp, User } from "lucide-react";
import { motion } from "motion/react";

export default function SuppliesTable({
  supplies = [],
  sortField,
  sortDir,
  onSort,
  onViewDetail,
  onCancelSupply,
  canAnular = true
}) {
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 inline ml-1 text-primary" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-1 text-primary" />
    );
  };

  if (!supplies || supplies.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border/80 bg-secondary/10 p-6">
        <Boxes className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground">No se encontraron abastecimientos</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No hay registros de insumos despachados que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => onSort("id_abastecimiento")}
                className="p-3.5 cursor-pointer hover:text-foreground select-none"
              >
                Folio {getSortIcon("id_abastecimiento")}
              </th>
              <th
                onClick={() => onSort("barbero_nombre")}
                className="p-3.5 cursor-pointer hover:text-foreground select-none"
              >
                Barbero Destinatario {getSortIcon("barbero_nombre")}
              </th>
              <th
                onClick={() => onSort("fecha")}
                className="p-3.5 cursor-pointer hover:text-foreground select-none"
              >
                Fecha y Hora {getSortIcon("fecha")}
              </th>
              <th className="p-3.5">Insumos Despachados</th>
              <th
                onClick={() => onSort("total_estimado")}
                className="p-3.5 text-right cursor-pointer hover:text-foreground select-none"
              >
                Costo Est. {getSortIcon("total_estimado")}
              </th>
              <th className="p-3.5 text-center">Estado</th>
              <th className="p-3.5 text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {supplies.map((supply) => {
              const isAnulado = supply.estado === "Anulado";
              const items = supply.detalles || [];
              const totalUnits = items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);

              return (
                <motion.tr
                  key={supply.id_abastecimiento}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                  className="transition-colors"
                >
                  {/* Folio */}
                  <td className="p-3.5 font-mono font-bold text-foreground whitespace-nowrap">
                    AB-{String(supply.id_abastecimiento).padStart(5, "0")}
                  </td>

                  {/* Barbero */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground whitespace-nowrap">
                          {supply.barbero_nombre || "Barbero"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {supply.barbero_especialidad || "Estilista"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="p-3.5 whitespace-nowrap text-muted-foreground font-mono">
                    {supply.fecha}
                  </td>

                  {/* Insumos Despachados */}
                  <td className="p-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1 items-center">
                      {items.slice(0, 2).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary/80 border border-border/80 text-foreground truncate max-w-[140px]"
                        >
                          <span className="font-mono text-primary font-bold">{item.cantidad}x</span>
                          {item.producto_nombre}
                        </span>
                      ))}
                      {items.length > 2 && (
                        <span className="text-[10px] text-muted-foreground font-semibold px-1.5 py-0.5 rounded-md bg-secondary/40 border border-border/40">
                          +{items.length - 2} más ({totalUnits} un.)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Costo Estimado */}
                  <td className="p-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    ${Number(supply.total_estimado || 0).toLocaleString("es-CO")}
                  </td>

                  {/* Estado */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    {isAnulado ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Anulado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Registrado
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail(supply)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        title="Ver vale de despacho"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isAnulado && canAnular && (
                        <button
                          type="button"
                          onClick={() => onCancelSupply(supply)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Anular despacho y reponer inventario"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
