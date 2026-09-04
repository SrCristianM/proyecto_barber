/**
 * @file commonValidators.js
 * Funciones de validación atómicas y reutilizables para todo el frontend.
 */

// Regex para correo electrónico estándar RFC 5322
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Solo letras, espacios, acentos y diéresis (para nombres y apellidos)
export const ONLY_LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

// Teléfono: solo dígitos numéricos de 10 a 15 caracteres
export const PHONE_REGEX = /^[0-9]{10,15}$/;

// NIT: alfanumérico con guión opcional
export const NIT_REGEX = /^[0-9A-Za-z\s-]{3,30}$/;

// URL válida
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

/**
 * Valida que un valor no sea nulo, indefinido ni solo espacios en blanco.
 */
export function isRequired(value, fieldName = "Este campo") {
  if (value === null || value === undefined) {
    return `${fieldName} es obligatorio.`;
  }
  if (typeof value === "string" && value.trim() === "") {
    return `${fieldName} es obligatorio y no puede estar vacío.`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `Debe seleccionar al menos un elemento en ${fieldName.toLowerCase()}.`;
  }
  return null;
}

/**
 * Valida formato de correo electrónico.
 */
export function validateEmail(value, isMandatory = true) {
  if (!value || value.trim() === "") {
    return isMandatory ? "El correo electrónico es obligatorio." : null;
  }
  const clean = value.trim();
  if (clean.length > 120) {
    return "El correo no puede superar los 120 caracteres.";
  }
  if (/\s/.test(clean)) {
    return "El correo electrónico no puede contener espacios.";
  }
  if (!EMAIL_REGEX.test(clean)) {
    return "El correo electrónico no tiene un formato válido (ejemplo: usuario@correo.com).";
  }
  return null;
}

/**
 * Valida que un texto solo contenga letras y espacios.
 */
export function validateOnlyLetters(value, fieldName = "Este campo", isMandatory = true) {
  if (!value || value.trim() === "") {
    return isMandatory ? `${fieldName} es obligatorio.` : null;
  }
  const clean = value.trim();
  if (!ONLY_LETTERS_REGEX.test(clean)) {
    return `${fieldName} solo debe contener letras (sin números ni caracteres especiales).`;
  }
  return null;
}

/**
 * Valida límites mínimo y máximo de caracteres.
 */
export function validateStringLength(value, min = 0, max = 255, fieldName = "Este campo") {
  if (!value) return null;
  const len = typeof value === "string" ? value.trim().length : 0;
  if (len > 0 && len < min) {
    return `${fieldName} debe tener al menos ${min} caracteres.`;
  }
  if (len > max) {
    return `${fieldName} no puede superar los ${max} caracteres (actual: ${len}).`;
  }
  return null;
}

/**
 * Valida formato de número de teléfono.
 * Solo se permiten dígitos numéricos y un mínimo estricto de 10 dígitos.
 */
export function validatePhone(value, isMandatory = false) {
  if (!value || String(value).trim() === "") {
    return isMandatory ? "El número de teléfono es obligatorio." : null;
  }
  const clean = String(value).trim();
  // Verificar que solo contenga dígitos numéricos
  if (!/^[0-9]+$/.test(clean)) {
    return "El teléfono solo debe contener números (sin letras ni caracteres especiales).";
  }
  // Comprobar mínimo de 10 dígitos
  if (clean.length < 10) {
    return "El teléfono debe contener al menos 10 dígitos numéricos.";
  }
  if (clean.length > 15) {
    return "El teléfono no puede superar los 15 dígitos numéricos.";
  }
  return null;
}

/**
 * Valida seguridad de contraseña.
 * Requisitos: Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.
 */
export function validatePassword(value, isMandatory = true) {
  if (!value) {
    return isMandatory ? "La contraseña es obligatoria." : null;
  }
  if (value.length < 8) {
    return "La contraseña debe tener al minímo 8 caracteres.";
  }
  if (value.length > 255) {
    return "La contraseña no puede exceder los 255 caracteres.";
  }
  if (!/[A-Z]/.test(value)) {
    return "La contraseña debe incluir al menos una letra mayúscula.";
  }
  if (!/[a-z]/.test(value)) {
    return "La contraseña debe incluir al menos una letra minúscula.";
  }
  if (!/[0-9]/.test(value)) {
    return "La contraseña debe incluir al menos un número.";
  }
  return null;
}

/**
 * Valida confirmación de contraseña.
 */
export function validatePasswordMatch(password, confirmation) {
  if (!confirmation || confirmation.trim() === "") {
    return "Debes confirmar la contraseña.";
  }
  if (password !== confirmation) {
    return "Las contraseñas ingresadas no coinciden.";
  }
  return null;
}

/**
 * Valida campos numéricos (precios, stocks, cantidades, duraciones).
 */
export function validateNumber(
  value,
  fieldName = "El valor",
  { min = 0, max = Infinity, allowZero = true, isInteger = false, isMandatory = true } = {}
) {
  if (value === "" || value === null || value === undefined) {
    return isMandatory ? `${fieldName} es obligatorio.` : null;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un valor numérico válido.`;
  }
  if (isInteger && !Number.isInteger(num)) {
    return `${fieldName} debe ser un número entero (sin decimales).`;
  }
  if (!allowZero && num === 0) {
    return `${fieldName} debe ser mayor que cero.`;
  }
  if (num < min) {
    return `${fieldName} no puede ser menor que ${min}.`;
  }
  if (num > max) {
    return `${fieldName} no puede ser mayor que ${max}.`;
  }
  return null;
}

/**
 * Valida que una fecha no sea pasada respecto a hoy (para agendamientos).
 */
export function validateFutureOrTodayDate(dateStr, fieldName = "La fecha") {
  if (!dateStr) return `${fieldName} es obligatoria.`;
  const [year, month, day] = dateStr.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return `${fieldName} no puede ser una fecha pasada.`;
  }
  return null;
}

/**
 * Valida que hora de fin sea posterior a hora de inicio.
 */
export function validateTimeRange(startTime, endTime) {
  if (!startTime) return "La hora de inicio es obligatoria.";
  if (!endTime) return "La hora de fin es obligatoria.";
  if (endTime <= startTime) {
    return "La hora de finalización debe ser posterior a la hora de inicio.";
  }
  return null;
}
