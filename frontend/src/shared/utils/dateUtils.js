/**
 * Utilidades para manejo seguro de fechas en hora local.
 * Evita el desfase de zona horaria provocado por toISOString() que convierte a UTC.
 */

/**
 * Obtiene la fecha en formato YYYY-MM-DD usando la zona horaria LOCAL del navegador/sistema.
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Fecha local en formato "YYYY-MM-DD"
 */
export function getLocalDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parsea un string "YYYY-MM-DD" a un objeto Date en hora local a medio día (12:00:00).
 * Usar las 12:00 evita que cambios de horario de verano o redondeos desplacen el día.
 * @param {string|Date} isoDate
 * @returns {Date}
 */
export function parseLocalDate(isoDate) {
  if (!isoDate) return new Date();
  if (isoDate instanceof Date) return isoDate;
  const str = String(isoDate).split("T")[0];
  const parts = str.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date(isoDate);
}

/**
 * Suma o resta días a una fecha en formato "YYYY-MM-DD" de manera segura en hora local.
 * @param {string} isoDate "YYYY-MM-DD"
 * @param {number} n Número de días a sumar (o restar si es negativo)
 * @returns {string} "YYYY-MM-DD"
 */
export function addDays(isoDate, n) {
  const d = parseLocalDate(isoDate);
  d.setDate(d.getDate() + n);
  return getLocalDateString(d);
}

/**
 * Formatea una fecha "YYYY-MM-DD" a formato legible en español (ej. "miércoles, 7 de octubre de 2026").
 * @param {string|Date} isoDate
 * @returns {string}
 */
export function formatDateDisplay(isoDate) {
  if (!isoDate) return "";
  const d = parseLocalDate(isoDate);
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/**
 * Obtiene la marca de tiempo actual en formato "YYYY-MM-DD HH:mm:ss" en hora local.
 * @returns {string}
 */
export function getNowLocalDateTimeString() {
  const d = new Date();
  const date = getLocalDateString(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${date} ${hours}:${minutes}:${seconds}`;
}
