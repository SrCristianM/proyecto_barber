import { useState } from "react";
import { ShoppingBag, Plus, Trash2, UserCheck, Calendar } from "lucide-react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import { clients, users, saleStatuses, catalogItems } from "../hooks/useSales";
import { validateSaleForm } from "../validations/saleValidation";

export default function SaleFormModal({
  mode,
  formData,
  setFormData,
  onAddItem,
  onUpdateItemQuantity,
  onRemoveItem,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";
  const currentUser = users.find((u) => u.id_usuario === Number(formData.id_usuario)) || users[0];
  const [selectedCatalogId, setSelectedCatalogId] = useState(catalogItems[0]?.id_item || catalogItems[0]?.id || "");
  const [addQty, setAddQty] = useState(1);
  const [errors, setErrors] = useState({});

  const catalogOptions = (catalogItems || []).map((c) => {
    const price = Number(c.precio_unitario ?? c.precio ?? 0);
    const tipo = c.tipo_item ?? c.tipo ?? "";
    const id = c.id_item ?? c.id ?? "";
    const stockInfo = (c.stock !== undefined && tipo === "Producto")
      ? (c.stock <= 3 ? ` (⚠️ Stock: ${c.stock})` : ` (Stock: ${c.stock})`)
      : "";
    return {
      value: id,
      label: `${tipo === "Servicio" ? "✂️" : "🛍️"} ${c.nombre} — $${price.toLocaleString("es-CO")}${stockInfo}`
    };
  });

  const handleAddNewItem = () => {
    const item = catalogItems.find((c) => (c.id_item ?? c.id) === selectedCatalogId);
    if (!item) return;
    onAddItem(item, addQty);
    setAddQty(1);
    if (errors.detalles) {
      setErrors((prev) => ({ ...prev, detalles: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateSaleForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal
      title={isCreate ? "Registrar Nueva Venta" : "Editar Venta"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Cabecera de la Venta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <SearchableSelect
              label="Cliente"
              required
              options={clients.map((client) => ({ value: client.id_cliente, label: client.nombre }))}
              value={formData.id_cliente}
              onChange={(val) => {
                setFormData({ ...formData, id_cliente: Number(val) });
                if (errors.id_cliente) setErrors((prev) => ({ ...prev, id_cliente: null }));
              }}
              placeholder="Buscar o seleccionar cliente..."
              error={errors.id_cliente}
            />
          </div>

          {/* Usuario / Cajero (Contexto de Sesión) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cajero / Responsable <span className="text-xs text-muted-foreground font-normal">(Sesión Activa)</span>
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-foreground text-sm font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{currentUser?.nombre || "Usuario en Turno"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cita de Origen (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Origen de la Venta <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </label>
            <select
              name="id_cita"
              id="id_cita"
              value={formData.id_cita || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  id_cita: e.target.value ? Number(e.target.value) : null
                })
              }
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="">Venta Directa en Mostrador</option>
              <option value="1">Cita #1 — Servicio Juan Pérez</option>
              <option value="2">Cita #2 — Servicio María García</option>
              <option value="3">Cita #3 — Servicio Pedro López</option>
            </select>
          </div>

          {/* Estado de la Venta */}
          {!isCreate ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Estado de la Venta
              </label>
              <select
                name="estado"
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              >
                {saleStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Estado Inicial
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/20 border border-border/60 rounded-xl text-foreground text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>Completada (Facturación inmediata)</span>
              </div>
            </div>
          )}
        </div>

        {/* Sección: Detalle de Venta (venta_detalle) */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Detalle de Facturación (Servicios y Productos) <span className="text-destructive">*</span>
            </h3>
          </div>

          {/* Selector para añadir ítem */}
          <div className="p-3.5 bg-secondary/30 rounded-xl border border-border/70 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Agregar al Carrito de Cobro
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-8">
                <SearchableSelect
                  label="Ítem del Catálogo (Servicio / Producto)"
                  options={catalogOptions}
                  value={selectedCatalogId}
                  onChange={(val) => setSelectedCatalogId(val)}
                  placeholder="Buscar servicio o producto..."
                />
              </div>

              <div className="sm:col-span-2">
                <NumericInput
                  label="Cantidad"
                  name="addQty"
                  id="addQty"
                  min={1}
                  allowDecimal={false}
                  value={addQty}
                  onChange={(val) => setAddQty(Math.max(1, parseInt(val, 10) || 1))}
                  placeholder="1"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Detalle */}
          {formData.detalles.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-4 border border-dashed border-destructive/40 rounded-xl bg-destructive/5 text-destructive text-xs">
              <span>Debes agregar al menos un servicio o producto a la venta.</span>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Tipo</th>
                    <th className="text-left py-2 px-3">Concepto</th>
                    <th className="text-center py-2 px-3 w-20">Cantidad</th>
                    <th className="text-right py-2 px-3 w-28">Precio Unit.</th>
                    <th className="text-right py-2 px-3 w-28">Subtotal</th>
                    <th className="text-center py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {formData.detalles.map((det, index) => (
                    <tr key={det.id_venta_detalle || index} className="hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            det.tipo_item === "Servicio"
                              ? "bg-primary/10 text-primary"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {det.tipo_item}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{det.nombre_item || det.nombre}</td>
                      <td className="py-2.5 px-3 text-center">
                        <NumericInput
                          name={`qty-${index}`}
                          id={`qty-${index}`}
                          min={1}
                          allowDecimal={false}
                          value={det.cantidad}
                          onChange={(val) => onUpdateItemQuantity(index, val)}
                          className="w-14 mx-auto"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        ${Number(det.precio_unitario).toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                        ${Number(det.subtotal).toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(index)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
                          title="Eliminar línea"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary/40 border-t border-border">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right font-bold text-foreground text-sm">
                      Total Factura:
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
          <FormFieldError error={errors.detalles} />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={formData.detalles.length === 0}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Finalizar Venta" : "Guardar Cambios"}
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
