import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import PdfUploader from "../../shared/components/PdfUploader";
import SearchableSelect from "../../shared/components/SearchableSelect";
import { validateSupplierForm } from "../validations/supplierValidation";
import { SUPPLIER_DOCUMENT_TYPES, PERSON_TYPES } from "../../../../shared/constants/documentTypes";

export default function SupplierFormModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateSupplierForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal
      title={isCreate ? "Nuevo Proveedor" : "Editar Proveedor"}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* 1. Documento de Identidad (PRIMER CAMPO) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <SearchableSelect
              label="Tipo de Documento"
              value={formData.tipo_documento || "NIT"}
              onChange={(val) => handleChange("tipo_documento", val)}
              options={SUPPLIER_DOCUMENT_TYPES}
              searchable={false}
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Número de Identificación / NIT
            </label>
            <input
              type="text"
              name="nit"
              id="nit"
              maxLength={30}
              placeholder="Ej: 901234567-1"
              value={formData.nit || ""}
              onChange={(e) => handleChange("nit", e.target.value)}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.nit
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              autoFocus
            />
            <FormFieldError error={errors.nit} />
          </div>
        </div>

        {/* 2. Tipo de Persona (DESPUÉS DEL DOCUMENTO) */}
        <div>
          <SearchableSelect
            label="Tipo de Persona"
            required
            value={formData.tipo_persona || "Persona Jurídica"}
            onChange={(val) => handleChange("tipo_persona", val)}
            options={PERSON_TYPES}
            searchable={false}
          />
        </div>

        {/* 3. Nombre / Razón Social */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre / Razón Social <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            maxLength={120}
            placeholder="Ej: Distribuidora Barber Pro"
            value={formData.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.nombre
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
          />
          <FormFieldError error={errors.nombre} />
        </div>

        {/* Teléfono y Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
            <input
              type="tel"
              inputMode="numeric"
              name="telefono"
              id="telefono"
              maxLength={15}
              placeholder="Ej: 3000000000"
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
              className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.telefono
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
            />
            <FormFieldError error={errors.telefono} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              id="correo"
              maxLength={120}
              placeholder="proveedor@empresa.com"
              value={formData.correo || ""}
              onChange={(e) => handleChange("correo", e.target.value)}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.correo
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
            />
            <FormFieldError error={errors.correo} />
          </div>
        </div>

        {/* Dirección de Sede */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Dirección de Sede / Despacho</label>
          <input
            type="text"
            name="direccion"
            id="direccion"
            maxLength={255}
            placeholder="Ej: Carrera 43A # 18-50, Medellín"
            value={formData.direccion || ""}
            onChange={(e) => handleChange("direccion", e.target.value)}
            className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.direccion
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
          />
          <FormFieldError error={errors.direccion} />
        </div>

        {/* Factura o RUT en PDF */}
        <div>
          <PdfUploader
            label="Factura o Certificado del Proveedor (PDF)"
            value={formData.factura_pdf}
            onChange={(val) => handleChange("factura_pdf", val)}
            error={errors.factura_pdf}
          />
        </div>

        {/* Estado (Universal - Siempre al final) */}
        <div>
          <SearchableSelect
            label="Estado"
            required
            value={formData.estado !== undefined ? formData.estado : 1}
            onChange={(val) => handleChange("estado", Number(val))}
            options={[
              { value: 1, label: "Activo (Disponible para compras)" },
              { value: 0, label: "Inactivo" }
            ]}
            searchable={false}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Guardar Proveedor" : "Actualizar Proveedor"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
