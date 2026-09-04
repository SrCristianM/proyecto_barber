import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import ImageUploader from "../../shared/components/ImageUploader";
import { categories } from "../hooks/useProducts";
import { validateProductForm } from "../validations/productValidation";

export default function ProductFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});

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
            options={categories.map((cat) => ({ value: cat.id_categoria_producto, label: cat.nombre }))}
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

        {/* Imagen del Producto */}
        <ImageUploader
          label="Imagen del Producto (Opcional)"
          value={formData.imagen_url}
          onChange={handleImageChange}
        />
        <FormFieldError error={errors.imagen_url} />

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
