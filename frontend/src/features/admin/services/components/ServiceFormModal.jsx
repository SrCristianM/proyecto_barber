import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import ImageUploader from "../../shared/components/ImageUploader";
import { availableCategories } from "../hooks/useServices";
import { validateServiceForm } from "../validations/serviceValidation";

export default function ServiceFormModal({ mode, formData, setFormData, onSubmit, onClose, categories: categoriesProp }) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});
  const activeCategories = (categoriesProp && categoriesProp.length > 0) ? categoriesProp : availableCategories;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (dataUrl) => {
    setFormData((prev) => ({ ...prev, imagen_url: dataUrl || "" }));
    if (errors.imagen_url) {
      setErrors((prev) => ({ ...prev, imagen_url: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateServiceForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Servicio" : "Editar Servicio"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nombre del Servicio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Servicio <span className="text-destructive">*</span>
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
            placeholder="Ej: Corte Clásico"
            autoFocus
          />
          <FormFieldError error={errors.nombre} />
        </div>

        {/* Categoría */}
        <div>
          <SearchableSelect
            label="Categoría"
            required
            options={activeCategories.map((cat) => ({ value: cat.id_categoria_servicio, label: cat.nombre }))}
            value={formData.id_categoria_servicio}
            onChange={(val) => handleChange("id_categoria_servicio", Number(val))}
            placeholder="Seleccionar categoría de servicio..."
            error={errors.id_categoria_servicio}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Duración */}
          <div>
            <NumericInput
              label="Duración (minutos)"
              required
              name="duracion_minutos"
              id="duracion_minutos"
              min={1}
              allowDecimal={false}
              value={formData.duracion_minutos}
              onChange={(val) => handleChange("duracion_minutos", Number(val) || 0)}
              error={errors.duracion_minutos}
              placeholder="30"
            />
          </div>
          {/* Precio */}
          <div>
            <NumericInput
              label="Precio ($)"
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

        {/* Imagen del Servicio igual que en productos */}
        <ImageUploader
          label="Imagen del Servicio (Opcional)"
          value={formData.imagen_url}
          onChange={handleImageChange}
        />
        <FormFieldError error={errors.imagen_url} />

        {/* Estado del Servicio (Universal al final) */}
        <div>
          <SearchableSelect
            label="Estado"
            value={formData.estado !== undefined ? formData.estado : 1}
            onChange={(val) => handleChange("estado", Number(val))}
            options={[
              { value: 1, label: "Activo (Disponible para citas y catálogo)" },
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
            {isCreate ? "Crear Servicio" : "Guardar Cambios"}
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
