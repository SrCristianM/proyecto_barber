import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Truck, Package, Building2, DollarSign, ArrowRight, PlusCircle } from "lucide-react";

export default function StockEntryModal({
  isOpen,
  onClose,
  warehouseItems = [],
  suppliers = [],
  selectedItem = null,
  onSave,
  isSubmitting = false
}) {
  if (!isOpen) return null;

  const [insumoId, setInsumoId] = useState(selectedItem?.id_insumo || "");
  const [proveedorId, setProveedorId] = useState(selectedItem?.id_proveedor || "");
  const [cantidad, setCantidad] = useState(10);
  const [costoUnitario, setCostoUnitario] = useState(selectedItem?.costo_unitario || 0);
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (selectedItem) {
      setInsumoId(selectedItem.id_insumo);
      if (selectedItem.id_proveedor) setProveedorId(selectedItem.id_proveedor);
      if (selectedItem.costo_unitario) setCostoUnitario(selectedItem.costo_unitario);
    } else if (warehouseItems.length > 0 && !insumoId) {
      setInsumoId(warehouseItems[0].id_insumo);
      if (warehouseItems[0].id_proveedor) setProveedorId(warehouseItems[0].id_proveedor);
    }
  }, [selectedItem, warehouseItems]);

  const activeInsumo = warehouseItems.find((i) => Number(i.id_insumo) === Number(insumoId));
  const currentStock = Number(activeInsumo?.stock_actual || 0);
  const qty = Number(cantidad) || 0;
  const newStock = currentStock + qty;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!insumoId || qty <= 0) return;

    onSave({
      insumo_id: Number(insumoId),
      proveedor_id: proveedorId ? Number(proveedorId) : 1,
      cantidad_ingresada: qty,
      costo_unitario: Number(costoUnitario) || 0,
      observaciones: observaciones || "Carga de mercancía desde proveedor"
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Cargar Mercancía de Proveedor</h3>
                <p className="text-xs text-muted-foreground">Incrementa directamente el stock de la bodega general</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Seleccionar Insumo de Bodega */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Insumo a Cargar:
              </label>
              <select
                value={insumoId}
                onChange={(e) => {
                  setInsumoId(e.target.value);
                  const found = warehouseItems.find((i) => Number(i.id_insumo) === Number(e.target.value));
                  if (found) {
                    if (found.id_proveedor) setProveedorId(found.id_proveedor);
                    if (found.costo_unitario) setCostoUnitario(found.costo_unitario);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                required
              >
                {warehouseItems.map((item) => (
                  <option key={item.id_insumo} value={item.id_insumo}>
                    {item.nombre} (Stock actual: {item.stock_actual} {item.unidad_medida})
                  </option>
                ))}
              </select>
            </div>

            {/* Seleccionar Proveedor */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Proveedor:
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                required
              >
                {suppliers.length > 0 ? (
                  suppliers.map((prov) => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre} {prov.contacto ? `(${prov.contacto})` : ""}
                    </option>
                  ))
                ) : (
                  <option value="1">Distribuidora Barber Pro</option>
                )}
              </select>
            </div>

            {/* Cantidad y Costo Unitario */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Cantidad a Ingresar:
                </label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Costo Unitario ($):
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

            {/* Vista previa de stock post-ingreso */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Stock resultante en almacén:</span>
              <div className="flex items-center gap-2 font-black">
                <span className="text-muted-foreground">{currentStock}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-black">
                  {newStock} {activeInsumo?.unidad_medida || "unidades"}
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Observaciones / Factura:
              </label>
              <input
                type="text"
                placeholder="Ej. Factura #4029 - Compra quincenal"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || qty <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-900/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? "Ingresando..." : "Registrar Entrada (+Stock)"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
