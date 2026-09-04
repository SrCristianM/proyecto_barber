import { useState } from "react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import SearchableSelect from "../../shared/components/SearchableSelect";
import { availableRoles } from "../hooks/useUsers";
import { validateUserForm } from "../validations/userValidation";

export default function UserFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
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
    const result = validateUserForm(formData, isCreate);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Usuario" : "Editar Usuario"} onClose={onClose}>
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
              placeholder="Ej: Juan"
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
              placeholder="Ej: Pérez"
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

        <div>
          <SearchableSelect
            label="Rol en el Sistema"
            required
            options={availableRoles.map((role) => ({ value: role.id_rol, label: role.nombre_rol }))}
            value={formData.id_rol}
            onChange={(val) => handleChange("id_rol", Number(val))}
            placeholder="Seleccionar rol de usuario..."
            error={errors.id_rol}
          />
        </div>

        {isCreate && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña <span className="text-destructive">*</span>
            </label>
            <input
              type="password"
              name="contrasena"
              id="contrasena"
              maxLength={255}
              value={formData.contrasena}
              onChange={(e) => handleChange("contrasena", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                errors.contrasena
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Mínimo 8 car., Mayúscula, Número"
            />
            <FormFieldError error={errors.contrasena} />
          </div>
        )}

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Crear Usuario" : "Guardar Cambios"}
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
