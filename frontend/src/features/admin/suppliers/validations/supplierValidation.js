import {
  validateEmail,
  validatePhone,
  validateStringLength,
  isRequired
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de proveedores.
 */
export function validateSupplierForm(formData) {
  const errors = {};

  // Nombre (Obligatorio, máx 120)
  const reqName = isRequired(formData.nombre, "El nombre o razón social");
  const lenName = validateStringLength(formData.nombre, 2, 120, "El nombre o razón social");
  if (reqName) errors.nombre = reqName;
  else if (lenName) errors.nombre = lenName;

  // NIT (Opcional, máx 30)
  if (formData.nit && formData.nit.trim() !== "") {
    const lenNit = validateStringLength(formData.nit, 3, 30, "El NIT");
    if (lenNit) errors.nit = lenNit;
  }

  // Teléfono (Opcional, máx 20, formato)
  if (formData.telefono && formData.telefono.trim() !== "") {
    const phoneErr = validatePhone(formData.telefono, false);
    if (phoneErr) errors.telefono = phoneErr;
  }

  // Correo (Opcional, formato email si se ingresa, máx 120)
  if (formData.correo && formData.correo.trim() !== "") {
    const emailErr = validateEmail(formData.correo, false);
    if (emailErr) errors.correo = emailErr;
  }

  // Dirección (Opcional, máx 255)
  if (formData.direccion && formData.direccion.trim() !== "") {
    const dirErr = validateStringLength(formData.direccion, 0, 255, "La dirección");
    if (dirErr) errors.direccion = dirErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
