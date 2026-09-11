/**
 * @file apiResponse.js
 * Estandarización de respuestas JSON para toda la API REST.
 */

export class ApiResponse {
  static success(res, data = {}, message = "Operación exitosa", statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, data = {}, message = "Recurso creado exitosamente") {
    return this.success(res, data, message, 201);
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static error(res, message = "Ha ocurrido un error", statusCode = 500, errorCode = "INTERNAL_ERROR", details = null) {
    const payload = {
      success: false,
      message,
      error: errorCode
    };
    if (details) {
      payload.details = details;
    }
    return res.status(statusCode).json(payload);
  }
}
