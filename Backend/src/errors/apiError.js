/**
 * @file apiError.js
 * Clase de error personalizada con códigos HTTP y códigos internos de negocio.
 */

export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR", details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Solicitud inválida", errorCode = "BAD_REQUEST", details = null) {
    return new ApiError(message, 400, errorCode, details);
  }

  static unauthorized(message = "No autenticado", errorCode = "UNAUTHORIZED") {
    return new ApiError(message, 401, errorCode);
  }

  static forbidden(message = "Acceso denegado: permisos insuficientes", errorCode = "FORBIDDEN") {
    return new ApiError(message, 403, errorCode);
  }

  static notFound(message = "Recurso no encontrado", errorCode = "NOT_FOUND") {
    return new ApiError(message, 404, errorCode);
  }

  static conflict(message = "Conflicto con el estado actual del recurso", errorCode = "CONFLICT", details = null) {
    return new ApiError(message, 409, errorCode, details);
  }

  static unprocessable(message = "Entidad no procesable", errorCode = "UNPROCESSABLE_ENTITY", details = null) {
    return new ApiError(message, 422, errorCode, details);
  }

  static internal(message = "Error interno del servidor", errorCode = "INTERNAL_SERVER_ERROR") {
    return new ApiError(message, 500, errorCode);
  }
}

export default ApiError;
