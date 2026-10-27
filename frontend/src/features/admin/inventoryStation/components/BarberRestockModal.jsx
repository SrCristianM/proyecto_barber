import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  MinusSquare
} from "lucide-react";
import { fireGoldenConfetti } from "../../../../shared/utils/confettiHelper";
import LiquidLevelIndicator from "../../../../shared/components/LiquidLevelIndicator";

// Helpers para parsear cantidad y nota limpia del barbero
function parseRequestedQty(notas) {
  if (!notas) return 1;
  const match =
    notas.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) ||
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

export default function BarberRestockModal({
  isOpen,
  onClose,
  barber,
  urgentItems = [],
  allItems = [],
  onApproveSelected,
  onApproveSingle,
  isSubmitting = false
}) {
  const [activeTab, setActiveTab] = useState("urgent"); // 'urgent' | 'all'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Lista base según la pestaña activa
  const sourceList = useMemo(() => {
    return activeTab === "urgent" ? urgentItems : allItems;
  }, [activeTab, urgentItems, allItems]);

  // Lista filtrada por búsqueda
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return sourceList;
    const term = searchTerm.toLowerCase().trim();
    return sourceList.filter(
      (item) =>
        (item.insumo_nombre || "").toLowerCase().includes(term) ||
        (item.insumo_categoria || "").toLowerCase().includes(term)
    );
  }, [sourceList, searchTerm]);

  // Insumos que tienen suficiente stock en bodega para ser seleccionados
  const selectableItems = useMemo(() => {
    return filteredList.filter((item) => {
      const stock = Number(item.stock_actual || 0);
      const req = parseRequestedQty(item.notas);
      return stock >= req;
    });
  }, [filteredList]);

  // Al abrir el modal o cambiar de pestaña, preseleccionar todos los insumos urgentes con stock disponible
  useEffect(() => {
    if (isOpen) {
      const initial = new Set();
      urgentItems.forEach((item) => {
        const id = item.id_estacion_insumo || item.id_estacion_item;
        const stock = Number(item.stock_actual || 0);
        const req = parseRequestedQty(item.notas);
        if (stock >= req) {
          initial.add(id);
        }
      });
      setSelectedIds(initial);
      setSearchTerm("");
      setActiveTab("urgent");
    }
  }, [isOpen, urgentItems]);

  if (!isOpen || !barber || typeof document === "undefined") return null;

  // Toggle individual
  const handleToggleItem = (itemId, hasStock) => {
    if (!hasStock) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Master Checkbox: Seleccionar / Deseleccionar todos los seleccionables actuales
  const allCurrentSelectableChecked =
    selectableItems.length > 0 &&
    selectableItems.every((item) =>
      selectedIds.has(item.id_estacion_insumo || item.id_estacion_item)
    );

  const someCurrentSelectableChecked =
    selectableItems.some((item) =>
      selectedIds.has(item.id_estacion_insumo || item.id_estacion_item)
    ) && !allCurrentSelectableChecked;

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCurrentSelectableChecked) {
        // Deseleccionar los de la lista actual
        selectableItems.forEach((item) => {
          next.delete(item.id_estacion_insumo || item.id_estacion_item);
        });
      } else {
        // Seleccionar todos los seleccionables de la lista actual
        selectableItems.forEach((item) => {
          next.add(item.id_estacion_insumo || item.id_estacion_item);
        });
      }
      return next;
    });
  };

  // Botón Aprobar Seleccionados
  const handleBatchConfirm = () => {
    const itemsToApprove = allItems.filter((i) =>
      selectedIds.has(i.id_estacion_insumo || i.id_estacion_item)
    );
    if (itemsToApprove.length === 0) return;
    fireGoldenConfetti();
    onApproveSelected && onApproveSelected(barber, itemsToApprove);
  };

  const selectedCount = selectedIds.size;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh]"
      >
        {/* =========================================================================
            1. CABECERA DEL MODAL (Fija con shrink-0, nunca se corta)
            ========================================================================= */}
        <div className="shrink-0 px-6 py-4 sm:py-5 border-b border-border/60 bg-gradient-to-r from-amber-500/10 via-card to-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar / Inicial */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DFB755] to-[#B38E36] p-0.5 shadow-md flex items-center justify-center shrink-0">
              {barber.foto || barber.imagen_url ? (
                <img
                  src={barber.foto || barber.imagen_url}
                  alt={barber.nombre}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-sm font-black text-[#DFB755]">
                  {barber.nombre ? barber.nombre.substring(0, 2).toUpperCase() : "B"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-foreground truncate">
                Aprobar Reposición de Insumos
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Puesto de <strong className="text-foreground">{barber.nombre}</strong> •{" "}
                <span className="text-[#DFB755] font-semibold">
                  {urgentItems.length} solicitudes pendientes
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            2. PESTAÑAS Y BUSCADOR (Fijas con shrink-0)
            ========================================================================= */}
        <div className="shrink-0 px-6 py-3 bg-background/50 border-b border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Selector de Pestaña */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("urgent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "urgent"
                  ? "bg-rose-500/20 text-rose-300 font-black border border-rose-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Pendientes ({urgentItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#DFB755]/20 text-[#DFB755] font-black border border-[#DFB755]/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Todos los Insumos ({allItems.length})</span>
            </button>
          </div>

          {/* Campo de búsqueda rápida */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-card border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#DFB755] transition-colors"
            />
          </div>
        </div>

        {/* =========================================================================
            3. BARRA MASTER CHECKBOX (Fija con shrink-0, clara y con ancho completo)
            ========================================================================= */}
        <div className="shrink-0 px-6 py-3 bg-card/70 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2.5 font-bold text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allCurrentSelectableChecked}
              ref={(el) => {
                if (el) el.indeterminate = someCurrentSelectableChecked;
              }}
              onChange={handleToggleSelectAll}
              disabled={selectableItems.length === 0}
              className="w-4 h-4 rounded text-[#DFB755] bg-card border-border/70 focus:ring-[#DFB755] cursor-pointer disabled:opacity-40 shrink-0"
            />
            <span className="leading-snug">
              Seleccionar todos los insumos disponibles (
              <strong className="text-[#DFB755]">{selectedCount}</strong> seleccionados)
            </span>
          </label>

          <span className="text-[11px] text-muted-foreground self-end sm:self-auto shrink-0 font-medium">
            {selectableItems.length} con stock en bodega
          </span>
        </div>

        {/* =========================================================================
            4. LISTA DE INSUMOS CON SCROLL DINÁMICO (flex-1 min-h-0 overflow-y-auto)
            ========================================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredList.length > 0 ? (
            filteredList.map((item) => {
              const id = item.id_estacion_insumo || item.id_estacion_item;
              const bodegaStock = Number(item.stock_actual || 0);
              const requestedQty = parseRequestedQty(item.notas);
              const customNote = parseBarberCustomNote(item.notas);
              const hasWarehouseStock = bodegaStock >= requestedQty;
              const isChecked = selectedIds.has(id);
              const isUrgent =
                item.estado_semaforo === "ROJO" || item.estado_semaforo === "AMARILLO";
              const days =
                item.dias_en_estacion !== undefined
                  ? item.dias_en_estacion
                  : item.dias_en_uso || 0;

              return (
                <div
                  key={id}
                  onClick={() => handleToggleItem(id, hasWarehouseStock)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-[#DFB755]/10 border-[#DFB755]/50 shadow-sm ring-1 ring-[#DFB755]/30"
                      : hasWarehouseStock
                      ? "bg-card border-border/60 hover:border-[#DFB755]/40 hover:bg-muted/20"
                      : "bg-muted/20 border-border/30 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox a la izquierda */}
                    <div className="pt-1 shrink-0 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!hasWarehouseStock}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleItem(id, hasWarehouseStock);
                        }}
                        className="w-4 h-4 rounded text-[#DFB755] bg-card border-border/80 focus:ring-[#DFB755] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Contenido principal del insumo */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Fila 1: Nombre completo (sin truncate forzado) + Badges + Botón Individual */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Punto Semáforo con Glow Neón */}
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              item.estado_semaforo === "ROJO"
                                ? "bg-rose-500 shadow-[0_0_10px_#F43F5E] glow-pulse-red"
                                : item.estado_semaforo === "AMARILLO"
                                ? "bg-amber-400 shadow-[0_0_10px_#F59E0B] glow-pulse-amber"
                                : "bg-emerald-500 shadow-[0_0_8px_#10B981] glow-pulse-green"
                            }`}
                          />

                          {/* Nombre completo del insumo */}
                          <h4 className="text-sm font-extrabold text-foreground leading-snug">
                            {item.insumo_nombre}
                          </h4>

                          {/* Categoría */}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                            {item.insumo_categoria || "Consumible"}
                          </span>

                          {/* Cantidad Solicitada por el Barbero */}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/40 text-[11px] font-black">
                              <Package className="w-3 h-3" />
                              <span>
                                Petición: <strong>{requestedQty} {requestedQty === 1 ? "ud" : "uds"}</strong>
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Botón de Aprobación Individual Rápida */}
                        <div
                          className="self-start sm:self-center shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={isSubmitting || !hasWarehouseStock}
                            onClick={() => {
                              fireGoldenConfetti();
                              onApproveSingle && onApproveSingle(item, requestedQty);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                              hasWarehouseStock
                                ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black shadow-[#DDAE41]/20 ring-1 ring-amber-400"
                                : "bg-muted text-muted-foreground border border-border/40"
                            }`}
                            title="Aprobar únicamente este insumo"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprobar este ({requestedQty})</span>
                          </button>
                        </div>
                      </div>

                      {/* Fila 2: Mensaje u observación del barbero (Recuadro organizado) */}
                      {customNote && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                          <span className="shrink-0 text-sm">💬</span>
                          <span className="italic leading-relaxed font-medium">"{customNote}"</span>
                        </div>
                      )}

                      {/* Fila 3: Información de Almacén y Medidor de Nivel */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-semibold">
                            <span>Bodega:</span>
                            <strong
                              className={
                                hasWarehouseStock
                                  ? "text-emerald-600 dark:text-emerald-400 font-bold font-mono"
                                  : "text-rose-600 dark:text-rose-400 font-bold font-mono"
                              }
                            >
                              {bodegaStock} disponibles
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            En puesto: hace <strong className="text-foreground">{days} días</strong>
                          </span>
                          {!hasWarehouseStock && (
                            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
                              ⚠️ Stock insuficiente en bodega
                            </span>
                          )}
                        </div>

                        {/* Indicador Cápsula de Líquido */}
                        <div className="max-w-xs">
                          <LiquidLevelIndicator
                            current={bodegaStock}
                            max={Math.max(bodegaStock, 50)}
                            min={10}
                            size="sm"
                            showBadge={false}
                            unit="uds"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Package className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs">
                {searchTerm
                  ? "No se encontraron insumos que coincidan con la búsqueda."
                  : activeTab === "urgent"
                  ? "No hay insumos pendientes de reposición para este barbero."
                  : "No hay insumos asignados a este puesto."}
              </p>
            </div>
          )}
        </div>

        {/* =========================================================================
            5. PIE DEL MODAL (Fijo con shrink-0, siempre visible)
            ========================================================================= */}
        <div className="shrink-0 px-6 py-4 border-t border-border/60 bg-background/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            {selectedCount > 0 ? (
              <span>
                <strong className="text-foreground">{selectedCount}</strong>{" "}
                {selectedCount === 1 ? "insumo seleccionado" : "insumos seleccionados"} para reponer
                a <strong className="text-foreground">{barber.nombre}</strong>.
              </span>
            ) : (
              <span>Selecciona los insumos con el checkbox para aprobar en lote.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              disabled={selectedCount === 0 || isSubmitting}
              onClick={handleBatchConfirm}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Procesando..."
                  : `Aprobar Seleccionados (${selectedCount})`}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
