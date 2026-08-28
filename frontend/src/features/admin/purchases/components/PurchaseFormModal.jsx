import { useState } from "react";
import { Plus, Trash2, ShoppingBag, AlertCircle, Building2, UserCheck, Calendar } from "lucide-react";
import Modal from "../../shared/components/Modal";
import {
  availableSuppliers,
  availableProducts,
  availableUsers,
  purchaseStatuses
} from "../hooks/usePurchases";

export default function PurchaseFormModal({
  mode,
  formData,
  setFormData,
  addProductRow,
  updateProductRow,
  removeProductRow,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";
  const currentUser = availableUsers.find((u) => u.id_usuario === Number(formData.id_usuario)) || availableUsers[0];
  const [selectedProductId, setSelectedProductId] = useState(availableProducts[0]?.id_producto || 1);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addPrice, setAddPrice] = useState(availableProducts[0]?.precio_sugerido || 10000);

  const handleProductSelectChange = (e) => {
    const prodId = Number(e.target.value);
    setSelectedProductId(prodId);
    const prod = availableProducts.find((p) => p.id_producto === prodId);
    if (prod) {
      setAddPrice(prod.precio_sugerido);
    }
  };

  const handleAddNewItem = () => {
    addProductRow(selectedProductId, addQuantity, addPrice);
    setAddQuantity(1);
  };

  return (
    <Modal
      title={isCreate ? "Registrar Nueva Compra a Proveedor" : "Editar Compra"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (formData.detalles.length === 0) return;
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Cabecera Principal de Compra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Proveedor <span className="text-destructive">*</span>
            </label>
            <select
              name="id_proveedor"
              id="id_proveedor"
              value={formData.id_proveedor}
              onChange={(e) => setFormData({ ...formData, id_proveedor: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            >
              {availableSuppliers.map((sup) => (
                <option key={sup.id_proveedor} value={sup.id_proveedor}>
                  {sup.nombre} {sup.nit ? `(${sup.nit})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario Responsable (Contexto de Sesión) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Comprador / Responsable <span className="text-xs text-muted-foreground font-normal">(Sesión Activa)</span>
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-foreground text-sm font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{currentUser?.nombre || "Administrador en Turno"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha / Hora */}
          {!isCreate ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de Registro
              </label>
              <input
                type="datetime-local"
                name="fecha"
                id="fecha"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha / Hora <span className="text-xs text-muted-foreground font-normal">(Automática de Sistema)</span>
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Fecha y hora de registro al confirmar la compra</span>
              </div>
            </div>
          )}

          {/* Estado de la Compra */}
          {!isCreate ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Estado de la Compra
              </label>
              <select
                name="estado"
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              >
                {purchaseStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Estado Inicial
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-success/10 border border-success/30 rounded-xl text-success text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>Registrada (Activa)</span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Detalle de Productos (detalle_compra) */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Detalle de Productos a Abastecer (detalle_compra)
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecciona productos del inventario y define cantidad y costo unitario
              </p>
            </div>
          </div>

          {/* Barra para Agregar Producto */}
          <div className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={handleProductSelectChange}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground text-xs focus:ring-2 focus:ring-primary"
                >
                  {availableProducts.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre} (Ref: ${prod.precio_sugerido?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground text-xs focus:ring-2 focus:ring-primary text-center font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Costo Unit. ($)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={addPrice}
                  onChange={(e) => setAddPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground text-xs focus:ring-2 focus:ring-primary text-right font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Productos Agregados */}
          {formData.detalles.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-4 border border-dashed border-destructive/40 rounded-xl bg-destructive/5 text-destructive text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Debes agregar al menos un producto a la compra.</span>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Producto</th>
                    <th className="text-center py-2 px-3 w-24">Cantidad</th>
                    <th className="text-right py-2 px-3 w-32">Precio Unitario ($)</th>
                    <th className="text-right py-2 px-3 w-28">Subtotal ($)</th>
                    <th className="text-center py-2 px-2 w-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {formData.detalles.map((detalle, idx) => (
                    <tr key={idx} className="hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <select
                          name={`id_producto_${idx}`}
                          value={detalle.id_producto}
                          onChange={(e) => updateProductRow(idx, "id_producto", e.target.value)}
                          className="w-full px-2 py-1.5 bg-input-background border border-input rounded-md text-foreground text-xs"
                        >
                          {availableProducts.map((p) => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          name={`cantidad_${idx}`}
                          value={detalle.cantidad}
                          onChange={(e) => updateProductRow(idx, "cantidad", e.target.value)}
                          className="w-full px-2 py-1.5 bg-input-background border border-input rounded-md text-foreground text-xs text-center font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          name={`precio_unitario_${idx}`}
                          value={detalle.precio_unitario}
                          onChange={(e) => updateProductRow(idx, "precio_unitario", e.target.value)}
                          className="w-full px-2 py-1.5 bg-input-background border border-input rounded-md text-foreground text-xs text-right font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                        ${Number(detalle.subtotal).toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeProductRow(idx)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary/40 border-t border-border">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right font-bold text-foreground text-sm">
                      Total Compra:
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-primary text-base">
                      ${Number(formData.total).toLocaleString("es-CO")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={formData.detalles.length === 0}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Registrar Compra" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
