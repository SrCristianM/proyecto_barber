import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Package,
  Building2,
  Save,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";

export default function WarehouseItemModal({
  isOpen,
  onClose,
  item = null,
  suppliers = [],
  onSave,
  isSubmitting = false
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(item);

  // Campos generales del insumo
  const [nombre, setNombre] = useState(item?.nombre || "");
  const [categoria, setCategoria] = useState(item?.categoria || "Afeitado y Corte");
  const [proveedorId, setProveedorId] = useState(
    item?.id_proveedor || suppliers[0]?.id_proveedor || 1
  );
  const [costoUnitario, setCostoUnitario] = useState(item?.costo_unitario ?? 0);

  // Campos exclusivos del modo Creación
  const [stockActual, setStockActual] = useState(item?.stock_actual ?? 10);
  const [stockMinimo, setStockMinimo] = useState(item?.stock_minimo ?? 5);
  const [unidadMedida, setUnidadMedida] = useState(item?.unidad_medida || "Unidad");

  // Campos exclusivos del modo Edición (Ajustes de Inventario)
  const [tipoMovimiento, setTipoMovimiento] = useState("Cargo por ajuste");
  const [cantidadAjuste, setCantidadAjuste] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [errorAjuste, setErrorAjuste] = useState("");

  // Sincronizar datos al abrir o cambiar de insumo
  useEffect(() => {
    if (item) {
      setNombre(item.nombre || "");
      setCategoria(item.categoria || "Afeitado y Corte");
      setStockActual(item.stock_actual ?? 0);
      setStockMinimo(item.stock_minimo ?? 5);
      setUnidadMedida(item.unidad_medida || "Unidad");
      setProveedorId(item.id_proveedor || suppliers[0]?.id_proveedor || 1);
      setCostoUnitario(item.costo_unitario ?? 0);

      // Reset de campos de ajuste
      setTipoMovimiento("Cargo por ajuste");
      setCantidadAjuste("");
      setObservaciones("");
      setErrorAjuste("");
    } else {
      setNombre("");
      setCategoria("Afeitado y Corte");
      setStockActual(10);
      setStockMinimo(5);
      setUnidadMedida("Unidad");
      setProveedorId(suppliers[0]?.id_proveedor || 1);
      setCostoUnitario(0);

      setTipoMovimiento("Cargo por ajuste");
      setCantidadAjuste("");
      setObservaciones("");
      setErrorAjuste("");
    }
  }, [item, suppliers, isOpen]);

  // Cálculos dinámicos en tiempo real para modo edición
  const currentStock = Number(item?.stock_actual || 0);
  const isCargo = tipoMovimiento === "Cargo por ajuste";
  const numQty = cantidadAjuste === "" ? 0 : Number(cantidadAjuste);

  const resultingStock = useMemo(() => {
    if (isNaN(numQty)) return currentStock;
    return isCargo ? currentStock + numQty : currentStock - numQty;
  }, [currentStock, isCargo, numQty]);

  const isOverStockDescargo = !isCargo && numQty > currentStock;

  // Validación de cantidad en tiempo real
  const handleCantidadChange = (e) => {
    const val = e.target.value;
    setCantidadAjuste(val);
    setErrorAjuste("");

    const parsed = parseInt(val, 10);
    if (!isCargo && !isNaN(parsed) && parsed > currentStock) {
      setErrorAjuste(
        `La cantidad a descargar (${parsed}) supera las existencias actuales (${currentStock}) en bodega general.`
      );
    }
  };

  const handleTipoMovimientoChange = (e) => {
    const nuevoTipo = e.target.value;
    setTipoMovimiento(nuevoTipo);
    setErrorAjuste("");

    const parsed = parseInt(cantidadAjuste, 10);
    if (nuevoTipo === "Descargo por ajuste" && !isNaN(parsed) && parsed > currentStock) {
      setErrorAjuste(
        `La cantidad a descargar (${parsed}) supera las existencias actuales (${currentStock}) en bodega general.`
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorAjuste("");

    if (!nombre.trim()) {
      setErrorAjuste("El nombre del insumo es obligatorio.");
      return;
    }

    if (isEditing) {
      const qty = parseInt(cantidadAjuste, 10);
      if (isNaN(qty) || qty <= 0) {
        setErrorAjuste("La cantidad de ajuste debe ser un número entero mayor a 0.");
        return;
      }

      if (!isCargo && qty > currentStock) {
        setErrorAjuste(
          `No es posible descargar ${qty} unidades. Las existencias actuales en el sistema son de ${currentStock} unidades.`
        );
        return;
      }

      if (!observaciones.trim() || observaciones.trim().length < 5) {
        setErrorAjuste(
          "El campo 'Observaciones del Movimiento' es obligatorio y debe tener al menos 5 caracteres (ej. conteo físico, avería, muestra)."
        );
        return;
      }

      onSave({
        id_insumo: item.id_insumo,
        nombre: nombre.trim(),
        categoria,
        id_proveedor: Number(proveedorId) || 1,
        costo_unitario: Number(costoUnitario) || 0,
        tipo_movimiento: tipoMovimiento,
        cantidad_ajuste: qty,
        observaciones: observaciones.trim()
      });
    } else {
      // Modo creación original
      onSave({
        nombre: nombre.trim(),
        categoria,
        stock_actual: Number(stockActual) || 0,
        stock_minimo: Number(stockMinimo) || 5,
        unidad_medida: unidadMedida.trim() || "Unidad",
        id_proveedor: Number(proveedorId) || 1,
        costo_unitario: Number(costoUnitario) || 0
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#E8C466]/15 text-[#E8C466] border border-[#E8C466]/30">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {isEditing ? "Editar Insumo de Bodega" : "Nuevo Insumo en Bodega"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Gestión de ajustes de inventario (Cargo y Descargo)"
                    : "Catálogo y existencias generales del almacén"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 overflow-y-auto pr-1">
            {/* Nombre del Insumo */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Nombre del Insumo:
              </label>
              <input
                type="text"
                placeholder="Ej. Cuchillas Derby Premium (Caja x 100)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                required
              />
            </div>

            {/* Categoría y Proveedor / Unidad de Medida según modo */}
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Categoría:
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                  >
                    <option value="Afeitado y Corte">Afeitado y Corte</option>
                    <option value="Higiene y Desinfección">Higiene y Desinfección</option>
                    <option value="Cuidado Facial">Cuidado Facial</option>
                    <option value="Protección y Bioseguridad">Protección y Bioseguridad</option>
                    <option value="Capilar y Peinado">Capilar y Peinado</option>
                    <option value="Herramientas y Accesorios">Herramientas y Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Proveedor Habitual:
                  </label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                  >
                    {suppliers.map((prov) => (
                      <option key={prov.id_proveedor} value={prov.id_proveedor}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Categoría:
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                  >
                    <option value="Afeitado y Corte">Afeitado y Corte</option>
                    <option value="Higiene y Desinfección">Higiene y Desinfección</option>
                    <option value="Cuidado Facial">Cuidado Facial</option>
                    <option value="Protección y Bioseguridad">Protección y Bioseguridad</option>
                    <option value="Capilar y Peinado">Capilar y Peinado</option>
                    <option value="Herramientas y Accesorios">Herramientas y Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Unidad de Medida:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Caja, Bote 500ml, Frasco 1L"
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN MODO EDICIÓN: CONTROL DE AJUSTES DE INVENTARIO */}
            {isEditing ? (
              <div className="space-y-3.5 pt-1">
                {/* 1. Tarjeta informativa de Stock Actual y Vista Previa Dinámica */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 block">
                      Existencias en el Sistema (Stock Actual)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-black text-foreground">{currentStock}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {item?.unidad_medida || "uds"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <ArrowRight className="w-4 h-4 text-amber-500/70 shrink-0" />
                    <div
                      className={`px-3 py-1.5 rounded-xl border transition-all ${
                        isOverStockDescargo
                          ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                          : numQty > 0
                          ? isCargo
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                            : "bg-blue-500/15 border-blue-500/40 text-blue-400"
                          : "bg-muted/40 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider font-bold block text-muted-foreground">
                        Nuevo Stock Resultante
                      </span>
                      <div className="flex items-center gap-1 font-black text-sm">
                        {isCargo ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isOverStockDescargo
                            ? "¡Stock Insuficiente!"
                            : `${resultingStock} ${item?.unidad_medida || "uds"}`}
                        </span>
                        {numQty > 0 && !isOverStockDescargo && (
                          <span className="text-[11px] opacity-80">
                            ({isCargo ? `+${numQty}` : `-${numQty}`})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Tipo de Movimiento y Cantidad a Cargar/Descargar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Tipo de Movimiento: <span className="text-amber-500">*</span>
                    </label>
                    <select
                      value={tipoMovimiento}
                      onChange={handleTipoMovimientoChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                    >
                      <option value="Cargo por ajuste">1. Cargo por ajuste (+)</option>
                      <option value="Descargo por ajuste">2. Descargo por ajuste (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      {isCargo ? "Cantidad a Cargar:" : "Cantidad a Descargar:"}{" "}
                      <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 5"
                      value={cantidadAjuste}
                      onChange={handleCantidadChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-card border text-foreground text-xs font-bold focus:outline-none transition-colors shadow-none ${
                        isOverStockDescargo
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500/40 text-rose-400"
                          : "border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] focus:ring-1 focus:ring-[#DFB755]/30"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* 3. Observaciones del Movimiento */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>
                      Observaciones del Movimiento: <span className="text-amber-500">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Mínimo 5 caracteres
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Ajuste por conteo físico, producto averiado, ingreso de muestra..."
                    value={observaciones}
                    onChange={(e) => {
                      setObservaciones(e.target.value);
                      if (errorAjuste) setErrorAjuste("");
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none resize-none"
                    required
                  />
                </div>

                {/* Costo Estimado ($) en Modo Edición */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Costo Estimado ($):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={costoUnitario}
                    onChange={(e) => setCostoUnitario(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                  />
                </div>
              </div>
            ) : (
              /* SECCIÓN MODO CREACIÓN ORIGINAL */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Stock Inicial en Bodega:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockActual}
                      onChange={(e) => setStockActual(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Stock Mínimo (Alerta):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" /> Proveedor Habitual:
                    </label>
                    <select
                      value={proveedorId}
                      onChange={(e) => setProveedorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                    >
                      {suppliers.map((prov) => (
                        <option key={prov.id_proveedor} value={prov.id_proveedor}>
                          {prov.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Costo Estimado ($):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={costoUnitario}
                      onChange={(e) =>
                        setCostoUnitario(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Alerta de Error en Validación */}
            {errorAjuste && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorAjuste}</span>
              </motion.div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !nombre.trim() ||
                  (isEditing &&
                    (!cantidadAjuste ||
                      isOverStockDescargo ||
                      !observaciones.trim() ||
                      observaciones.trim().length < 5))
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-lg shadow-[#DDAE41]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Guardando..." : "Guardar Insumo"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
