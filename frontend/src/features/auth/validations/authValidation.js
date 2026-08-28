import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateOnlyLetters,
  validatePhone,
  validateStringLength
} from "../../../shared/validations/commonValidators";

/**
 * Valida formulario de inicio de sesión.
 */
export function validateLoginForm(formData) {
  const errors = {};

  const emailErr = validateEmail(formData.correo, true);
  if (emailErr) errors.correo = emailErr;

  if (!formData.contrasena || formData.contrasena.trim() === "") {
    errors.contrasena = "La contraseña es obligatoria para iniciar sesión.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida formulario de registro de usuario/cliente.
 */
export function validateRegisterForm(formData) {
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

  // Correo (Obligatorio, formato válido, máx 120)
  const emailErr = validateEmail(formData.correo, true);
  if (emailErr) errors.correo = emailErr;

  // Teléfono (Opcional, formato y longitud)
  if (formData.telefono && formData.telefono.trim() !== "") {
    const phoneErr = validatePhone(formData.telefono, false);
    if (phoneErr) errors.telefono = phoneErr;
  }

  // Contraseña (Obligatoria, seguridad)
  const passErr = validatePassword(formData.contrasena, true);
  if (passErr) errors.contrasena = passErr;

  // Confirmar Contraseña (Coincidencia exacta)
  const matchErr = validatePasswordMatch(formData.contrasena, formData.confirmarContrasena);
  if (matchErr) errors.confirmarContrasena = matchErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida formulario de recuperación de contraseña.
 */
export function validateForgotPasswordForm(formData) {
  const errors = {};
  const emailErr = validateEmail(formData.correo, true);
  if (emailErr) errors.correo = emailErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
