import { useState } from "react";
import { Boxes, Plus, Trash2, Scissors, Info, AlertTriangle, UserCheck } from "lucide-react";
import Modal from "../../shared/components/Modal";
import SearchableSelect from "../../shared/components/SearchableSelect";
import { validateSupplyForm } from "../validations/supplyValidation";

export default function SupplyFormModal({
  formData,
  setFormData,
  barbers = [],
  products = [],
  onAddItem,
  onUpdateItemQuantity,
  onRemoveItem,
  onSubmit,
  onClose
}) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id_producto || "");
  const [addQty, setAddQty] = useState(1);
  const [errors, setErrors] = useState({});

  const availableProducts = (products || []).filter((p) => p.estado === 1);
  const selectedProduct = availableProducts.find((p) => Number(p.id_producto) === Number(selectedProductId));
  const currentStock = selectedProduct ? Number(selectedProduct.stock || 0) : 0;

  const productOptions = availableProducts.map((p) => {
    const stock = Number(p.stock ?? 0);
    const price = Number(p.precio ?? 0);
    const isCritical = stock <= 3;
    return {
      value: p.id_producto,
      label: `📦 ${p.nombre}${p.presentacion ? ` (${p.presentacion})` : ""} — Stock: ${stock} un. | Costo ref: $${price.toLocaleString("es-CO")}`
    };
  });

  const barberOptions = (barbers || []).map((b) => ({
    value: b.id_barbero,
    label: `💈 ${b.nombre} ${b.apellido || ""} — ${b.especialidad || "Barbero Profesional"}`.trim()
  }));

  const handleAddNewItem = () => {
    if (!selectedProduct) return;
    if (currentStock <= 0) {
      setErrors((prev) => ({ ...prev, itemStock: `El producto '${selectedProduct.nombre}' no tiene stock disponible en bodega.` }));
      return;
    }
    const qtyToAdd = Math.min(Math.max(1, addQty), currentStock);
    onAddItem(selectedProduct, qtyToAdd);
    setAddQty(1);
    setErrors((prev) => ({ ...prev, detalles: null, itemStock: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateSupplyForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  const totalEstimatedCost = (formData.detalles || []).reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  const totalItemsCount = (formData.detalles || []).reduce(
    (sum, item) => sum + Number(item.cantidad || 0),
    0
  );

  return (
    <Modal
      title="Registrar Abastecimiento de Insumos"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Banner explicativo de venta irreal / gasto de servicio */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-500">
              Despacho Operativo Interno (Venta Irreal)
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Los productos agregados se <span className="font-semibold text-foreground">descontarán inmediatamente del stock de inventario</span>.
              Este registro <strong>no genera ingresos en caja</strong> ni se cobra al barbero; sirve para auditar los insumos y consumibles gastados por cada barbero durante sus servicios.
            </p>
          </div>
        </div>

        {/* Selección del Barbero y Responsable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Barbero Destinatario"
              required
              options={barberOptions}
              value={formData.id_barbero}
              onChange={(val) => {
                setFormData({ ...formData, id_barbero: Number(val) });
                if (errors.id_barbero) setErrors((prev) => ({ ...prev, id_barbero: null }));
              }}
              placeholder="Seleccionar barbero..."
              error={errors.id_barbero}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motivo u Observaciones <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Ej: Reposición semanal de gel y cuchillas..."
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Selector de Insumos / Productos del Catálogo */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-primary" />
              Agregar Productos al Despacho
            </span>
            {selectedProduct && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                currentStock <= 3
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}>
                Stock en bodega: {currentStock} un.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8">
              <SearchableSelect
                label="Producto / Insumo"
                options={productOptions}
                value={selectedProductId}
                onChange={(val) => {
                  setSelectedProductId(Number(val));
                  setErrors((prev) => ({ ...prev, itemStock: null }));
                }}
                placeholder="Buscar insumo en inventario..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                max={Math.max(1, currentStock)}
                value={addQty}
                onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm text-center font-bold focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddNewItem}
                disabled={currentStock <= 0}
                className="w-full h-[42px] inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          {errors.itemStock && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.itemStock}
            </p>
          )}
        </div>

        {/* Tabla de Insumos Agregados al Despacho */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Insumos en la Lista de Despacho ({formData.detalles?.length || 0})
            </h4>
            {errors.detalles && (
              <span className="text-xs text-rose-500 font-semibold">{errors.detalles}</span>
            )}
          </div>

          {formData.detalles && formData.detalles.length > 0 ? (
            <div className="border border-border rounded-2xl overflow-hidden bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Insumo</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Costo Ref.</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center w-12">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {formData.detalles.map((item, index) => (
                      <tr key={index} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-foreground">{item.nombre}</p>
                          {item.presentacion && (
                            <p className="text-[11px] text-muted-foreground">{item.presentacion}</p>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-secondary/60 border border-border/80 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(item.id_producto, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                              className="w-6 h-6 rounded flex items-center justify-center font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-foreground px-1.5 min-w-[20px] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateItemQuantity(item.id_producto, item.cantidad + 1)}
                              disabled={item.stockMax !== undefined && item.cantidad >= item.stockMax}
                              className="w-6 h-6 rounded flex items-center justify-center font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          {item.stockMax !== undefined && item.cantidad >= item.stockMax && (
                            <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Máx. disponible</p>
                          )}
                        </td>
                        <td className="p-3 text-right text-muted-foreground font-mono">
                          ${Number(item.precio_unitario || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="p-3 text-right font-bold text-foreground font-mono">
                          ${Number(item.subtotal || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id_producto)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Quitar insumo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen de Totales */}
              <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-muted-foreground">
                  Total de artículos a despachar: <strong className="text-foreground">{totalItemsCount} un.</strong>
                </span>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Valorización estimada del gasto</span>
                  <span className="text-lg font-black text-foreground font-mono">
                    ${totalEstimatedCost.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center rounded-2xl border border-dashed border-border/80 bg-secondary/10">
              <Boxes className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">No has añadido productos al despacho</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Selecciona uno o varios insumos arriba y haz clic en &quot;Agregar&quot;.
              </p>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!formData.detalles || formData.detalles.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs sm:text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            Confirmar Despacho y Descontar Stock
          </button>
        </div>
      </form>
    </Modal>
  );
}
