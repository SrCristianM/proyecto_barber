import {
  validateEmail,
  validatePassword,
  validateOnlyLetters,
  validatePhone,
  validateStringLength,
  isRequired
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de creación o edición de usuarios.
 */
export function validateUserForm(formData, isCreate = true) {
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

  // Teléfono (Opcional, máx 20, formato)
  if (formData.telefono && formData.telefono.trim() !== "") {
    const phoneErr = validatePhone(formData.telefono, false);
    if (phoneErr) errors.telefono = phoneErr;
  }

  // Rol (Obligatorio, select)
  if (!formData.id_rol || Number(formData.id_rol) <= 0) {
    errors.id_rol = "Debes seleccionar un rol para el usuario.";
  }

  // Contraseña (Solo obligatoria en creación)
  if (isCreate) {
    const passErr = validatePassword(formData.contrasena, true);
    if (passErr) errors.contrasena = passErr;
  } else if (formData.contrasena && formData.contrasena.trim() !== "") {
    const passErr = validatePassword(formData.contrasena, false);
    if (passErr) errors.contrasena = passErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
