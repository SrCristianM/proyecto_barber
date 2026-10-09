import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import ImageUploader from "../../shared/components/ImageUploader";
import { categories } from "../hooks/useProducts";
import { validateProductForm } from "../validations/productValidation";

export default function ProductFormModal({ mode, formData, setFormData, onSubmit, onClose, categories: categoriesProp }) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});
  const activeCategories = (categoriesProp && categoriesProp.length > 0) ? categoriesProp : categories;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (dataUrl) => {
    setFormData((prev) => ({ ...prev, imagen_url: dataUrl || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateProductForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Producto" : "Editar Producto"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nombre del Producto */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Producto <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            maxLength={120}
            value={formData.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.nombre
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
            placeholder="Ej: Gel para Cabello"
            autoFocus
          />
          <FormFieldError error={errors.nombre} />
        </div>

        {/* Categoría de Producto */}
        <div>
          <SearchableSelect
            label="Categoría"
            required
            options={activeCategories.map((cat) => ({ value: cat.id_categoria_producto, label: cat.nombre }))}
            value={formData.id_categoria_producto}
            onChange={(val) => handleChange("id_categoria_producto", Number(val))}
            placeholder="Seleccionar categoría de producto..."
            error={errors.id_categoria_producto}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stock Inicial */}
          <div>
            <NumericInput
              label={`Stock ${isCreate ? "Inicial" : "Disponible"}`}
              required
              name="stock"
              id="stock"
              min={0}
              allowDecimal={false}
              value={formData.stock}
              onChange={(val) => handleChange("stock", Number(val) || 0)}
              error={errors.stock}
              placeholder="0"
            />
          </div>

          {/* Precio de Venta */}
          <div>
            <NumericInput
              label="Precio Unitario ($)"
              required
              name="precio"
              id="precio"
              min={0}
              allowDecimal={true}
              value={formData.precio}
              onChange={(val) => handleChange("precio", Number(val) || 0)}
              error={errors.precio}
              placeholder="0"
            />
          </div>
        </div>

        {/* Descripción del Producto */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Descripción Detallada
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            rows={2}
            value={formData.descripcion || ""}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            className="w-full px-3.5 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm resize-none"
            placeholder="Ej: Pomada base agua con acabado mate y fijación duradera..."
          />
        </div>

        {/* Modo de Uso e Ingredientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Modo de Uso
            </label>
            <textarea
              name="modo_uso"
              id="modo_uso"
              rows={2}
              value={formData.modo_uso || ""}
              onChange={(e) => handleChange("modo_uso", e.target.value)}
              className="w-full px-3.5 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm resize-none"
              placeholder="Ej: Frotar una pequeña cantidad en las palmas y aplicar..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ingredientes Clave
            </label>
            <textarea
              name="ingredientes"
              id="ingredientes"
              rows={2}
              value={formData.ingredientes || ""}
              onChange={(e) => handleChange("ingredientes", e.target.value)}
              className="w-full px-3.5 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm resize-none"
              placeholder="Ej: Cera de abejas, aceite de argán, vitamina E..."
            />
          </div>
        </div>

        {/* Imagen del Producto */}
        <ImageUploader
          label="Imagen del Producto (Opcional)"
          value={formData.imagen_url}
          onChange={handleImageChange}
        />
        <FormFieldError error={errors.imagen_url} />

        {/* Estado del Producto (Universal al final) */}
        <div>
          <SearchableSelect
            label="Estado"
            value={formData.estado !== undefined ? formData.estado : 1}
            onChange={(val) => handleChange("estado", Number(val))}
            options={[
              { value: 1, label: "Activo (Disponible en catálogo e inventario)" },
              { value: 0, label: "Inactivo" }
            ]}
            searchable={false}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Crear Producto" : "Guardar Cambios"}
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
