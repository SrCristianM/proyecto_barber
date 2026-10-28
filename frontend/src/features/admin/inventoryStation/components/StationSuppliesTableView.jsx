import { motion } from "motion/react";
import {
  User,
  Package,
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Trash2,
} from "lucide-react";

// Helpers para parsear cantidades y notas
function parseRequestedQty(notas) {
  if (!notas) return 1;
  const match = notas.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) ||
                notas.match(/(\d+)\s*unidad/i);
  return match && match[1] ? Math.max(1, parseInt(match[1], 10)) : 1;
}

function parseBarberCustomNote(notas) {
  if (!notas) return "";
  const match = notas.match(/\|\s*Nota:\s*(.*)$/i) || notas.match(/-\s*(.*)$/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (!notas.toLowerCase().includes("solicitud de reposición")) {
    return notas;
  }
  return "";
}

export default function StationSuppliesTableView({
  stations,
  onApproveRestock,
  onRemoveItem,
  isSubmitting = false
}) {
  if (!stations || stations.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border/40 bg-card/30">
        <Boxes className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
        <h4 className="text-sm font-bold text-foreground">No hay insumos para mostrar</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ajusta los filtros o asigna nuevos insumos a las estaciones de trabajo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card/85 border border-border/40 shadow-xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">
              <th className="py-3.5 px-4">Barbero & Estación</th>
              <th className="py-3.5 px-4">Insumo / Producto</th>
              <th className="py-3.5 px-4">En Puesto</th>
              <th className="py-3.5 px-4">Semáforo</th>
              <th className="py-3.5 px-4">Duración en Puesto</th>
              <th className="py-3.5 px-4">Stock en Bodega</th>
              <th className="py-3.5 px-4">Solicitud / Observaciones</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {stations.map((item) => {
              const id = item.id_estacion_insumo || item.id_estacion_item;
              const days =
                item.dias_en_estacion !== undefined
                  ? item.dias_en_estacion
                  : item.dias_en_uso || 0;
              const bodegaStock = Number(item.stock_actual || 0);
              const requestedQty = parseRequestedQty(item.notas);
              const customNote = parseBarberCustomNote(item.notas);
              const hasWarehouseStock = bodegaStock >= requestedQty;
              const qtyInStation = Number(item.cantidad_asignada !== undefined ? item.cantidad_asignada : (item.cantidad_actual !== undefined ? item.cantidad_actual : 1));

              const semaforoConfig = {
                VERDE: {
                  label: "Lleno / En uso",
                  badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                  dotClass: "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                },
                AMARILLO: {
                  label: "Queda poco",
                  badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
                  dotClass: "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                },
                ROJO: {
                  label: "Agotado / Reposición",
                  badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse",
                  dotClass: "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                }
              }[item.estado_semaforo] || {
                label: "Activo",
                badgeClass: "bg-muted text-muted-foreground border-border/40",
                dotClass: "bg-gray-400"
              };

              return (
                <tr
                  key={id}
                  className={`hover:bg-muted/20 transition-colors ${
                    item.estado_semaforo === "ROJO"
                      ? "bg-rose-500/[0.04]"
                      : item.estado_semaforo === "AMARILLO"
                      ? "bg-amber-500/[0.03]"
                      : ""
                  }`}
                >
                  {/* Barbero */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#DFB755]/15 text-[#DFB755] flex items-center justify-center font-bold text-xs border border-[#DFB755]/30">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {item.barbero_nombre || "Barbero"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.barbero_especialidad || "Estación de Trabajo"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Insumo */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-foreground">
                      {item.insumo_nombre}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.insumo_categoria || "Consumible"} • {item.unidad_medida || "Unidad"}
                    </div>
                  </td>

                  {/* Cantidad Física en Puesto */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      qtyInStation === 0 || item.estado_semaforo === "ROJO"
                        ? "bg-rose-500/15 border-rose-500/35 text-rose-600 dark:text-rose-300"
                        : item.estado_semaforo === "AMARILLO"
                        ? "bg-amber-500/15 border-amber-500/35 text-amber-600 dark:text-amber-300"
                        : "bg-emerald-500/15 border-emerald-500/35 text-emerald-600 dark:text-emerald-300"
                    }`}>
                      <Boxes className="w-3.5 h-3.5" />
                      <span className="font-mono font-black text-foreground">{qtyInStation}</span>
                      <span className="text-[10px] text-muted-foreground">{item.unidad_medida || "uds"}</span>
                    </div>
                  </td>

                  {/* Semáforo */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${semaforoConfig.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${semaforoConfig.dotClass}`} />
                      <span>{semaforoConfig.label}</span>
                    </span>
                  </td>

                  {/* Duración */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#DFB755]" />
                        {days === 0 ? "Hoy" : days === 1 ? "1 día" : `${days} días`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.fecha_ultima_reposicion
                          ? new Date(item.fecha_ultima_reposicion).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short"
                            })
                          : "Sin registro"}
                      </span>
                    </div>
                  </td>

                  {/* Stock en Bodega */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`font-black ${
                        hasWarehouseStock ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {hasWarehouseStock ? `${bodegaStock} disponibles` : `${bodegaStock} (insuficiente)`}
                    </span>
                    <div className="text-[10px] text-muted-foreground">
                      {hasWarehouseStock ? "Listo para despacho" : "Requiere compra"}
                    </div>
                  </td>

                  {/* Solicitud / Observaciones */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {(item.estado_semaforo === "ROJO" || item.estado_semaforo === "AMARILLO") ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/40 text-[11px] font-black">
                          <Package className="w-3 h-3" />
                          <span>Petición: {requestedQty} uds</span>
                        </span>
                        {customNote && (
                          <div className="text-[11px] text-amber-300 italic line-clamp-2">
                            "{customNote}"
                          </div>
                        )}
                      </div>
                    ) : item.notas ? (
                      <span className="text-[11px] text-muted-foreground line-clamp-2">
                        {item.notas}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        En uso habitual
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {(item.estado_semaforo === "ROJO" || item.estado_semaforo === "AMARILLO") ? (
                        <button
                          type="button"
                          disabled={isSubmitting || !hasWarehouseStock}
                          onClick={() => onApproveRestock(item)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                            hasWarehouseStock
                              ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black shadow-[#DDAE41]/25 ring-1 ring-amber-400"
                              : "bg-muted text-muted-foreground border border-border/40"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprobar Reposición ({requestedQty})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmitting || !hasWarehouseStock}
                          onClick={() => onApproveRestock(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Despachar</span>
                        </button>
                      )}

                      {onRemoveItem && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onRemoveItem(id)}
                          title="Retirar de estación"
                          className="p-2 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
