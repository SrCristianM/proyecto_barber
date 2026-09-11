/**
 * @file apiClient.js
 * Cliente HTTP centralizado para Tu Turno Barber.
 * Gestiona autenticación JWT, cabeceras, desempaquetado de respuestas y extracción de errores de validación.
 */

const TOKEN_KEY = "barber_token";

/**
 * Obtiene el token JWT actual desde el almacenamiento local.
 */
export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (err) {
    return null;
  }
}

/**
 * Guarda el token JWT en el almacenamiento local.
 */
export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error("Error al guardar token:", err);
  }
}

/**
 * Elimina el token JWT del almacenamiento local.
 */
export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error("Error al limpiar token:", err);
  }
}

/**
 * Extrae un mensaje de error claro y amigable desde una respuesta HTTP del backend.
 */
function extractErrorMessage(data, status) {
  if (!data) {
    return `Error de conexión con el servidor (${status})`;
  }

  // Si express-validator devolvió una lista de errores
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.msg || e.message).join(" • ");
  }

  // Si el backend devolvió un mensaje específico
  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  }

  switch (status) {
    case 400:
      return "Los datos enviados contienen errores o están incompletos.";
    case 401:
      return "Tu sesión ha expirado o las credenciales no son válidas.";
    case 403:
      return "No tienes permisos suficientes para realizar esta acción.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 409:
      return "Conflicto con los datos existentes (posible duplicidad).";
    case 422:
      return "Datos no procesables. Por favor revisa los campos.";
    case 500:
      return "Ocurrió un problema interno en el servidor. Inténtalo más tarde.";
    default:
      return `Error inesperado (${status})`;
  }
}

/**
 * Realiza una petición HTTP estandarizada al backend.
 *
 * @param {string} endpoint - Ruta del endpoint (ejemplo: "/api/users")
 * @param {RequestInit} [options] - Opciones de fetch (method, body, headers, etc.)
 * @returns {Promise<any>} Datos retornados por el servidor
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Si el body es un FormData (para subida de archivos), omitir Content-Type para que el navegador ponga el boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    // Intentar parsear como JSON
    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => "");
      data = text ? { message: text } : null;
    }

    if (!res.ok) {
      const errorMsg = extractErrorMessage(data, res.status);
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;

      // Si el token es inválido o expiró, limpiar sesión local
      if (res.status === 401 && token) {
        clearStoredToken();
      }

      throw error;
    }

    // Si la respuesta usa la estructura estándar { success: true, data: ... }
    if (data && typeof data === "object" && "data" in data) {
      return data.data;
    }

    return data;
  } catch (err) {
    // Si ya es un Error lanzado con mensaje claro, re-lanzarlo
    if (err.status) throw err;

    // Errores de red / servidor caído
    console.warn(`[API] Fallo al consultar ${endpoint}:`, err.message);
    const networkError = new Error(
      "No se pudo conectar con el servidor backend. Verificando disponibilidad local..."
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
}
