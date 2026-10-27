import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Clock,
  Package,
  Layers,
  AlertTriangle,
  Flame,
  CheckCircle2,
  CheckSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from "lucide-react";
import BarberRestockModal from "./BarberRestockModal";
import LiquidLevelIndicator from "../../../../shared/components/LiquidLevelIndicator";
import { fireGoldenConfetti } from "../../../../shared/utils/confettiHelper";

// Helpers para extraer cantidad solicitada y notas limpias del barbero
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

export default function BarberStationCard({
  barber,
  onApproveRestock,
  onApproveAllRestocks,
  onApproveMultipleRestocks,
  onRemoveItem,
  onAssignItemToBarber,
  isSubmitting = false
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const items = barber.items || [];
  const countRojo = items.filter((i) => i.estado_semaforo === "ROJO").length;
  const countAmarillo = items.filter((i) => i.estado_semaforo === "AMARILLO").length;
  const countVerde = items.filter((i) => i.estado_semaforo === "VERDE").length;

  // Semáforo global de la estación de este barbero
  const globalStatus = countRojo > 0 ? "ROJO" : countAmarillo > 0 ? "AMARILLO" : items.length > 0 ? "VERDE" : "VACIO";

  const statusConfig = {
    ROJO: {
      label: "Requiere Reposición",
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 glow-pulse-red",
      glowClass: "border-rose-500/40 shadow-md shadow-rose-500/10",
      dotClass: "bg-rose-500 shadow-[0_0_10px_#F43F5E] glow-pulse-red",
      headerBg: "from-rose-500/15 via-rose-500/5 to-transparent",
      icon: Flame
    },
    AMARILLO: {
      label: "Alerta Preventiva",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 glow-pulse-amber",
      glowClass: "border-amber-500/40 shadow-md shadow-amber-500/10",
      dotClass: "bg-amber-400 shadow-[0_0_10px_#F59E0B] glow-pulse-amber",
      headerBg: "from-amber-500/15 via-amber-500/5 to-transparent",
      icon: AlertTriangle
    },
    VERDE: {
      label: "Estación Óptima",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      glowClass: "border-emerald-500/30 shadow-md shadow-emerald-500/5",
      dotClass: "bg-emerald-500 shadow-[0_0_8px_#10B981] glow-pulse-green",
      headerBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      icon: CheckCircle2
    },
    VACIO: {
      label: "Sin Insumos Asignados",
      badgeClass: "bg-muted text-muted-foreground border-border/40",
      glowClass: "border-border/40",
      dotClass: "bg-gray-400",
      headerBg: "from-card to-transparent",
      icon: Layers
    }
  }[globalStatus];

  const StatusIcon = statusConfig.icon;

  // Insumos que requieren atención (ROJO o AMARILLO)
  const urgentItems = items.filter(
    (i) => i.estado_semaforo === "ROJO" || i.estado_semaforo === "AMARILLO"
  );

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`gold-metallic-card relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:shadow-xl ${statusConfig.glowClass}`}
    >
      {/* Luz de gradiente superior según estado */}
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${statusConfig.headerBg} pointer-events-none`} />

      <div className="relative p-5 sm:p-6 z-10 space-y-5">
        {/* ==========================================
            CABECERA DEL BARBERO Y SEMÁFORO GLOBAL
            ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar / Iniciales */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#DFB755] to-[#B38E36] p-0.5 shadow-md flex items-center justify-center">
                {barber.foto || barber.imagen_url ? (
                  <img
                    src={barber.foto || barber.imagen_url}
                    alt={barber.nombre}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-sm font-black text-[#B38E36] dark:text-[#E8C466]">
                    {barber.nombre ? barber.nombre.substring(0, 2).toUpperCase() : "B"}
                  </div>
                )}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${statusConfig.dotClass}`}
                title={`Estado: ${statusConfig.label}`}
              />
            </div>

            {/* Datos del barbero */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                {barber.nombre}
              </h3>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[#B38E36] dark:text-[#E8C466] font-bold">
                  {barber.especialidad || "Estación de Trabajo"}
                </span>
                {barber.correo && <span>• {barber.correo}</span>}
              </div>
            </div>
          </div>

          {/* Badge del Semáforo Global y Botón Asignar */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border ${statusConfig.badgeClass}`}
            >
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.label}</span>
            </div>

            <button
              type="button"
              onClick={() => onAssignItemToBarber && onAssignItemToBarber(barber.id_barbero)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DFB755]/15 hover:bg-[#DFB755]/25 text-[#B38E36] dark:text-[#E8C466] border border-[#DFB755]/40 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Asignar Insumo</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            RESUMEN RÁPIDO DE INDICADORES DEL PUESTO
            ========================================== */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-muted/40 dark:bg-neutral-900/40 border border-border/60 text-center">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25">
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
              <span>{countVerde} Llenos</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">En nivel óptimo</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25">
            <div className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
              <span>{countAmarillo} Por agotarse</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">Aviso preventivo</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/25">
            <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
              <span>{countRojo} Agotados</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">En reposición</span>
          </div>
        </div>

        {/* ==========================================
            SECCIÓN COMPACTA: SOLICITUDES PENDIENTES
            ========================================== */}
        {urgentItems.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 space-y-3 shadow-2xs">
            {/* Fila 1: Texto de advertencia con alto contraste y sin truncamiento */}
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <Flame className="w-4 h-4 animate-bounce" />
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-rose-700 dark:text-rose-300 leading-snug">
                  {urgentItems.length} {urgentItems.length === 1 ? "Insumo requiere reposición" : "Insumos requieren reposición"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">{countRojo}</strong> agotados •{" "}
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">{countAmarillo}</strong> por agotarse
                </p>
              </div>
            </div>

            {/* Fila 2: Botones de Acción bien alineados */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-500/20 flex-wrap">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border/80 hover:border-[#DFB755]/50 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Abrir ventana con checkboxes para seleccionar qué insumos reponer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#B38E36] dark:text-[#E8C466]" />
                <span>Revisar y Reponer ({urgentItems.length})</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  fireGoldenConfetti();
                  onApproveAllRestocks && onApproveAllRestocks(barber, urgentItems);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                title="Aprobar y reponer todos los insumos solicitados de este barbero"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reponer Todo</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            LISTADO RESPONSIVE DE INSUMOS ASIGNADOS (SIN SCROLL HORIZONTAL)
            ======================================================== */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs font-black text-foreground hover:text-[#B38E36] dark:hover:text-[#E8C466] transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span>Insumos Asignados a este Puesto ({items.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            <span className="text-[10px] text-muted-foreground font-medium">
              {items.length === 0 ? "Sin insumos" : `${items.length} consumibles activos`}
            </span>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {items.length > 0 ? (
                  <div className="space-y-2.5">
                    {items.map((item) => {
                      const id = item.id_estacion_insumo || item.id_estacion_item;
                      const bodegaStock = Number(item.stock_actual || 0);
                      const hasStock = bodegaStock > 0;
                      const days = item.dias_en_estacion !== undefined ? item.dias_en_estacion : (item.dias_en_uso || 0);

                      const badgeStyle = {
                        VERDE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                        AMARILLO: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
                        ROJO: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40"
                      }[item.estado_semaforo] || "bg-muted text-muted-foreground";

                      const dotClass = {
                        ROJO: "bg-rose-500 glow-pulse-red",
                        AMARILLO: "bg-amber-400 glow-pulse-amber",
                        VERDE: "bg-emerald-500 glow-pulse-green"
                      }[item.estado_semaforo] || "bg-gray-400";

                      return (
                        <div
                          key={id}
                          className="p-3 sm:p-3.5 rounded-2xl bg-card/90 dark:bg-neutral-900/60 border border-border/80 hover:border-[#DFB755]/50 transition-all shadow-2xs space-y-2.5"
                        >
                          {/* Fila 1: Título del Insumo + Categoría + Semáforo */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                                <h4 className="text-xs font-bold text-foreground leading-snug">
                                  {item.insumo_nombre}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                                  {item.insumo_categoria || "Consumible"}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                                <span>{item.unidad_medida || "Unidad"}</span>
                                <span>•</span>
                                <span>
                                  En puesto: <strong className="text-foreground font-medium">{days === 0 ? "Hoy" : `${days} días`}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Badge Semáforo */}
                            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeStyle}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                              <span>{item.estado_semaforo}</span>
                            </span>
                          </div>

                          {/* Fila 2: Indicador Cápsula de Nivel de Bodega (animada constantemente) + Acciones */}
                          <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            {/* Medidor de nivel en almacén */}
                            <div className="flex-1 min-w-[130px] max-w-full sm:max-w-[210px]">
                              <div className="flex items-center justify-between text-[10px] mb-1 font-medium">
                                <span className="text-muted-foreground">Stock en almacén:</span>
                                <span className={`font-mono font-bold ${hasStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                  {bodegaStock} uds
                                </span>
                              </div>
                              <LiquidLevelIndicator
                                current={bodegaStock}
                                max={Math.max(bodegaStock, 50)}
                                min={10}
                                size="sm"
                                showBadge={false}
                                unit="uds"
                              />
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-auto">
                              {(item.estado_semaforo === "ROJO" || item.estado_semaforo === "AMARILLO") ? (
                                <button
                                  type="button"
                                  disabled={isSubmitting || !hasStock}
                                  onClick={() => onApproveRestock(item)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-[11px] shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                                  title="Aprobar reposición de este insumo"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Reponer</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isSubmitting || !hasStock}
                                  onClick={() => onApproveRestock(item)}
                                  title="Despachar entrega preventiva adicional"
                                  className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] border border-border/60 transition-all cursor-pointer"
                                >
                                  Despachar
                                </button>
                              )}

                              {onRemoveItem && (
                                <button
                                  type="button"
                                  onClick={() => onRemoveItem(id)}
                                  title="Retirar insumo de este puesto"
                                  className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-card/40">
                    <p className="text-xs text-muted-foreground">
                      Este barbero aún no tiene consumibles asignados a su puesto.
                    </p>
                    <button
                      type="button"
                      onClick={() => onAssignItemToBarber && onAssignItemToBarber(barber.id_barbero)}
                      className="mt-2 text-xs font-bold text-[#B38E36] dark:text-[#E8C466] hover:underline cursor-pointer"
                    >
                      + Asignar primer insumo
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de selección con checkboxes para reposición */}
      <BarberRestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        barber={barber}
        urgentItems={urgentItems}
        allItems={items}
        onApproveSelected={(targetBarber, selectedItems) => {
          setIsRestockModalOpen(false);
          if (onApproveMultipleRestocks) {
            onApproveMultipleRestocks(targetBarber, selectedItems);
          } else if (onApproveAllRestocks) {
            onApproveAllRestocks(targetBarber, selectedItems);
          }
        }}
        onApproveSingle={(item, qty) => {
          setIsRestockModalOpen(false);
          onApproveRestock(item, qty);
        }}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
}
