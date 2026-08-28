import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
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
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Categoría <span className="text-destructive">*</span>
          </label>
          <select
            name="id_categoria_producto"
            id="id_categoria_producto"
            value={formData.id_categoria_producto}
            onChange={(e) => handleChange("id_categoria_producto", Number(e.target.value))}
            className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.id_categoria_producto
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
          >
            {categories.map((cat) => (
              <option key={cat.id_categoria_producto} value={cat.id_categoria_producto}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <FormFieldError error={errors.id_categoria_producto} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stock Inicial */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Stock {isCreate ? "Inicial" : "Disponible"} <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleChange("stock", parseInt(e.target.value, 10) || 0)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.stock
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
            />
            <FormFieldError error={errors.stock} />
          </div>

          {/* Precio de Venta */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Precio Unitario ($) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              name="precio"
              id="precio"
              value={formData.precio}
              onChange={(e) => handleChange("precio", parseFloat(e.target.value) || 0)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.precio
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
            />
            <FormFieldError error={errors.precio} />
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
