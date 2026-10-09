import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Trash2, ShoppingBag, AlertCircle, Building2, UserCheck, Calendar, ExternalLink } from "lucide-react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import PdfUploader from "../../shared/components/PdfUploader";
import { getCurrentUser } from "../../../auth/services/authService";
import { purchaseStatuses } from "../hooks/usePurchases";
import { validatePurchaseForm } from "../validations/purchaseValidation";

export default function PurchaseFormModal({
  mode,
  formData,
  setFormData,
  suppliers = [],
  products = [],
  addProductRow,
  updateProductRow,
  removeProductRow,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";
  const currentUser = getCurrentUser();

  // Filtrar solo proveedores activos (o el actualmente asociado si está en modo edición)
  const activeSuppliers = (suppliers || []).filter(
    (s) => s.estado === 1 || (!isCreate && Number(s.id_proveedor) === Number(formData.id_proveedor))
  );

  // Filtrar productos activos
  const activeProducts = (products || []).filter(
    (p) => p.estado === 1 || (!isCreate && formData.detalles?.some((d) => Number(d.id_producto) === Number(p.id_producto)))
  );

  const [selectedProductId, setSelectedProductId] = useState(() => activeProducts[0]?.id_producto || "");
  const [addQuantity, setAddQuantity] = useState(1);
  const [addPrice, setAddPrice] = useState(() => activeProducts[0]?.precio || activeProducts[0]?.precio_sugerido || 0);
  const [errors, setErrors] = useState({});

  // Sincronizar selección de producto inicial cuando cargue la lista desde el backend
  useEffect(() => {
    if ((!selectedProductId || !activeProducts.some((p) => p.id_producto === selectedProductId)) && activeProducts.length > 0) {
      setSelectedProductId(activeProducts[0].id_producto);
      setAddPrice(Number(activeProducts[0].precio || activeProducts[0].precio_sugerido || 0));
    }
  }, [activeProducts, selectedProductId]);

  const handleProductSelectChange = (val) => {
    const prodId = Number(val);
    setSelectedProductId(prodId);
    const prod = activeProducts.find((p) => p.id_producto === prodId);
    if (prod) {
      setAddPrice(Number(prod.precio || prod.precio_sugerido || 0));
    }
  };

  const handleAddNewItem = () => {
    if (!selectedProductId) return;
    if (addQuantity < 1) return;
    addProductRow(selectedProductId, addQuantity, addPrice);
    setAddQuantity(1);
    if (errors.detalles) {
      setErrors((prev) => ({ ...prev, detalles: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validatePurchaseForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  const userDisplayName = currentUser
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : "Administrador en Turno";

  return (
    <Modal
      title={isCreate ? "Registrar Nueva Compra a Proveedor" : "Editar Compra"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Cabecera Principal de Compra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proveedor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-foreground">
                Proveedor <span className="text-destructive">*</span>
              </label>
              <Link
                to="/dashboard/suppliers"
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                title="Administrar proveedores en el catálogo"
              >
                <span>Gestor Proveedores</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {activeSuppliers.length === 0 ? (
              <div className="p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No hay proveedores activos en la base de datos</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Debes registrar al menos un proveedor en el sistema antes de generar una orden de compra.
                </p>
                <Link
                  to="/dashboard/suppliers"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Registrar Proveedor Ahora</span>
                </Link>
              </div>
            ) : (
              <>
                <SearchableSelect
                  value={formData.id_proveedor}
                  onChange={(val) => {
                    setFormData({ ...formData, id_proveedor: Number(val) });
                    if (errors.id_proveedor) setErrors((prev) => ({ ...prev, id_proveedor: null }));
                  }}
                  options={activeSuppliers.map((sup) => ({
                    value: sup.id_proveedor,
                    label: sup.nombre,
                    subtitle: sup.nit ? `NIT: ${sup.nit}` : (sup.telefono ? `Tel: ${sup.telefono}` : undefined)
                  }))}
                  placeholder="Seleccionar proveedor registrado..."
                  searchPlaceholder="Buscar por nombre o NIT..."
                  error={errors.id_proveedor}
                />
                <FormFieldError error={errors.id_proveedor} />
              </>
            )}
          </div>

          {/* Usuario Responsable (Contexto de Sesión) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Comprador / Responsable <span className="text-xs text-muted-foreground font-normal">(Sesión Activa)</span>
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-foreground text-sm font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{userDisplayName}</span>
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
                value={formData.fecha ? formData.fecha.replace(" ", "T").substring(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value.replace("T", " ") + ":00" })}
                className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de Registro
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/20 border border-border/60 rounded-xl text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Fecha y hora automática del sistema (Hoy)</span>
              </div>
            </div>
          )}

          {/* Estado de la compra */}
          {!isCreate ? (
            <div>
              <SearchableSelect
                label="Estado"
                value={formData.estado}
                onChange={(val) => setFormData({ ...formData, estado: val })}
                options={purchaseStatuses.map((st) => ({ value: st, label: st }))}
                searchable={false}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Estado Inicial</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/20 border border-border/60 rounded-xl text-foreground text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                <span>Registrada (Por defecto)</span>
              </div>
            </div>
          )}
        </div>

        {/* Factura del Proveedor en PDF */}
        <div className="border-t border-border/60 pt-4">
          <PdfUploader
            value={formData.factura_pdf}
            onChange={(fileData) => setFormData((prev) => ({ ...prev, factura_pdf: fileData }))}
            label="Factura del Proveedor (Documento PDF opcional)"
          />
        </div>

        {/* Sección: Detalle de Compra (detalle_compra) */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Líneas de la Compra (Productos a ingresar) <span className="text-destructive">*</span>
            </h3>
          </div>

          {/* Añadir producto rápido */}
          <div className="p-3.5 bg-secondary/30 rounded-xl border border-border/70 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Agregar Producto a la Factura
            </p>
            {activeProducts.length === 0 ? (
              <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-center justify-between">
                <span>No hay productos registrados en el inventario.</span>
                <Link to="/dashboard/products" className="text-primary hover:underline font-semibold flex items-center gap-1">
                  <span>Ir a Productos</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] text-muted-foreground mb-1">Producto</label>
                  <SearchableSelect
                    value={selectedProductId}
                    onChange={handleProductSelectChange}
                    options={activeProducts.map((p) => ({
                      value: p.id_producto,
                      label: p.nombre,
                      subtitle: `Stock actual: ${p.stock ?? 0} | Costo sug: $${Number(p.precio || p.precio_sugerido || 0).toLocaleString("es-CO")}`
                    }))}
                    placeholder="Seleccionar producto del catálogo..."
                    searchPlaceholder="Buscar producto..."
                    size="sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-muted-foreground mb-1">Cantidad</label>
                  <NumericInput
                    min={1}
                    value={addQuantity}
                    onChange={(val) => setAddQuantity(parseInt(val, 10) || 1)}
                    placeholder="1"
                    className="py-1.5 text-xs text-center font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-muted-foreground mb-1">Costo Unit. ($)</label>
                  <NumericInput
                    min={0}
                    allowDecimals={true}
                    value={addPrice}
                    onChange={(val) => setAddPrice(parseFloat(val) || 0)}
                    placeholder="0"
                    className="py-1.5 text-xs text-right font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    disabled={!selectedProductId}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-xs font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                </div>
              </div>
            )}
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
                      <td className="py-2.5 px-3 min-w-[210px]">
                        <SearchableSelect
                          value={detalle.id_producto}
                          onChange={(val) => updateProductRow(idx, "id_producto", val)}
                          options={activeProducts.map((p) => ({
                            value: p.id_producto,
                            label: p.nombre,
                            subtitle: `$${Number(p.precio || p.precio_sugerido || 0).toLocaleString("es-CO")}`
                          }))}
                          size="sm"
                          searchable={true}
                          placeholder="Seleccionar producto..."
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <NumericInput
                          min={1}
                          name={`cantidad_${idx}`}
                          value={detalle.cantidad}
                          onChange={(val) => updateProductRow(idx, "cantidad", val)}
                          className="py-1 text-xs text-center font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <NumericInput
                          min={0}
                          allowDecimals={true}
                          name={`precio_unitario_${idx}`}
                          value={detalle.precio_unitario}
                          onChange={(val) => updateProductRow(idx, "precio_unitario", val)}
                          className="py-1 text-xs text-right font-medium"
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
          <FormFieldError error={errors.detalles} />
        </div>

        {/* Estado de la Compra (Universal al final) */}
        <div>
          <SearchableSelect
            label="Estado"
            value={formData.estado || "Registrada"}
            onChange={(val) => setFormData((prev) => ({ ...prev, estado: val }))}
            options={[
              { value: "Registrada", label: "Registrada (Inventario incrementado)" },
              { value: "Anulada", label: "Anulada" }
            ]}
            searchable={false}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={formData.detalles.length === 0 || activeSuppliers.length === 0}
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
