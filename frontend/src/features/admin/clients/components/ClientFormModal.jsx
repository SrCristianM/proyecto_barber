import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import NumericInput from "../../shared/components/NumericInput";
import { availableLoyalties } from "../hooks/useClients";
import { validateClientForm } from "../validations/clientValidation";

export default function ClientFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
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
    const result = validateClientForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Cliente" : "Editar Cliente"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              placeholder="Ej: Pedro"
              autoFocus
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
              placeholder="Ej: López"
            />
            <FormFieldError error={errors.apellido} />
          </div>
        </div>

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
          <NumericInput
            label="Teléfono"
            name="telefono"
            id="telefono"
            maxLength={15}
            allowDecimal={false}
            value={formData.telefono || ""}
            onChange={(val) => handleChange("telefono", val)}
            error={errors.telefono}
            placeholder="Ej: 3001234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Dirección de Residencia</label>
          <input
            type="text"
            name="direccion"
            id="direccion"
            maxLength={255}
            value={formData.direccion || ""}
            onChange={(e) => handleChange("direccion", e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.direccion
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
            placeholder="Ej: Calle 10 # 5-20"
          />
          <FormFieldError error={errors.direccion} />
        </div>

        {/* Nivel de Fidelidad */}
        {!isCreate ? (
          <div>
            <SearchableSelect
              label="Nivel de Fidelidad"
              options={availableLoyalties.map((loyalty) => ({ value: loyalty, label: loyalty }))}
              value={formData.nivel_fidelidad}
              onChange={(val) => handleChange("nivel_fidelidad", val)}
              placeholder="Seleccionar nivel..."
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
            <span className="text-xs font-medium text-muted-foreground">Nivel de fidelidad inicial:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              ● Nuevo (Automático)
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Crear Cliente" : "Guardar Cambios"}
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
