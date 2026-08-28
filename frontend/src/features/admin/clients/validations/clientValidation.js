import {
  validateEmail,
  validateOnlyLetters,
  validatePhone,
  validateStringLength
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de creación o edición de clientes.
 */
export function validateClientForm(formData) {
  const errors = {};

  // Nombre (Obligatorio, solo letras, máx 80)
  const nombreErr = validateOnlyLetters(formData.nombre, "El nombre", true);
  const nombreLenErr = validateStringLength(formData.nombre, 2, 80, "El nombre");
  if (nombreErr) errors.nombre = nombreErr;
  else if (nombreLenErr) errors.nombre = nombreLenErr;

  // Apellido (Obligatorio, solo letras, máx 80)
  const apellidoErr = validateOnlyLetters(formData.apellido, "El apellido", true);
  const apellidoLenErr = validateStringLength(formData.apellido, 2, 80, "El apellido");
  if (apellidoErr) errors.apellido = apellidoErr;
  else if (apellidoLenErr) errors.apellido = apellidoLenErr;

  // Correo (Obligatorio, máx 120)
  const emailErr = validateEmail(formData.correo, true);
  if (emailErr) errors.correo = emailErr;

  // Teléfono (Opcional, máx 20)
  if (formData.telefono && formData.telefono.trim() !== "") {
    const phoneErr = validatePhone(formData.telefono, false);
    if (phoneErr) errors.telefono = phoneErr;
  }

  // Dirección (Opcional, máx 255)
  if (formData.direccion && formData.direccion.trim() !== "") {
    const dirLenErr = validateStringLength(formData.direccion, 0, 255, "La dirección");
    if (dirLenErr) errors.direccion = dirLenErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
