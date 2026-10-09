import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import MultiSelectSearchable from "../../shared/components/MultiSelectSearchable";
import AvatarImageUploader from "../../shared/components/AvatarImageUploader";
import SearchableSelect from "../../shared/components/SearchableSelect";
import { availableSpecialties } from "../hooks/useBarbers";
import { validateBarberForm } from "../validations/barberValidation";
import { DOCUMENT_TYPES } from "../../../../shared/constants/documentTypes";

export default function BarberFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Normalizar especialidades como array para el MultiSelectSearchable
  const currentSpecialties = Array.isArray(formData.especialidades)
    ? formData.especialidades
    : formData.especialidad
    ? formData.especialidad.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const handleSpecialtiesChange = (newSelected) => {
    setFormData((prev) => ({
      ...prev,
      especialidades: newSelected,
      especialidad: newSelected.join(", ")
    }));
    if (errors.especialidad) {
      setErrors((prev) => ({ ...prev, especialidad: null }));
    }
  };

  const specialtyOptions = availableSpecialties.map((esp) => ({
    value: esp,
    label: esp
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateBarberForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Barbero" : "Editar Barbero"} onClose={onClose} maxWidthClass="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Componente visual del Avatar / Foto con subida local */}
        <AvatarImageUploader
          value={formData.imagen_url}
          onChange={(newUrl) => handleChange("imagen_url", newUrl)}
          label="Foto de Perfil del Barbero"
        />
        <FormFieldError error={errors.imagen_url} />

        {/* 1. Documento de Identidad (PRIMER CAMPO) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <SearchableSelect
              label="Tipo de Doc."
              value={formData.tipo_documento || "CC"}
              onChange={(val) => handleChange("tipo_documento", val)}
              options={DOCUMENT_TYPES}
              searchable={false}
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Número de Documento
            </label>
            <input
              type="text"
              name="documento"
              id="documento"
              maxLength={20}
              value={formData.documento || ""}
              onChange={(e) => handleChange("documento", e.target.value.replace(/[^0-9a-zA-Z-]/g, ""))}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.documento
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Ej: 1020304050"
              autoFocus
            />
            <FormFieldError error={errors.documento} />
          </div>
        </div>

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              maxLength={80}
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.nombre
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Ej: Carlos"
            />
            <FormFieldError error={errors.nombre} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Apellido <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              id="apellido"
              maxLength={80}
              value={formData.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.apellido
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Ej: Rodríguez"
            />
            <FormFieldError error={errors.apellido} />
          </div>
        </div>

        {/* Correo Electrónico y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Correo Electrónico <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="correo"
              id="correo"
              maxLength={120}
              value={formData.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.correo
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="correo@ejemplo.com"
            />
            <FormFieldError error={errors.correo} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
            <input
              type="tel"
              inputMode="numeric"
              name="telefono"
              id="telefono"
              maxLength={15}
              value={formData.telefono || ""}
              onKeyDown={(e) => {
                const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
                if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 15);
                handleChange("telefono", onlyNums);
              }}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.telefono
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Ej: 3001234567"
            />
            <FormFieldError error={errors.telefono} />
          </div>
        </div>

        {/* Especialidades: MultiSelect con Búsqueda y Chips */}
        <div>
          <MultiSelectSearchable
            selectedValues={currentSpecialties}
            onChange={handleSpecialtiesChange}
            options={specialtyOptions}
            label="Especialidades del Barbero (Selección múltiple)"
            placeholder="Buscar y seleccionar especialidades..."
            searchPlaceholder="Escribe para buscar especialidad (ej. Fade, Barba)..."
            error={errors.especialidad}
          />
          <FormFieldError error={errors.especialidad} />
        </div>

        {/* Estado (Universal - Siempre al final) */}
        <div>
          <SearchableSelect
            label="Estado"
            required
            value={formData.estado !== undefined ? formData.estado : 1}
            onChange={(val) => handleChange("estado", Number(val))}
            options={[
              { value: 1, label: "Activo" },
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
            {isCreate ? "Crear Barbero" : "Guardar Cambios"}
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
