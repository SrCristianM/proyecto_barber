import { ApiError } from "../errors/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  // Errores conocidos de la aplicación
  if (err instanceof ApiError) {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${err.statusCode} - ${err.message}`);
    return ApiResponse.error(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  // Errores de MySQL
  if (err.code === "ER_DUP_ENTRY") {
    logger.warn(`MySQL ER_DUP_ENTRY en ${req.originalUrl}: ${err.sqlMessage}`);
    return ApiResponse.error(
      res,
      "Ya existe un registro con estos datos únicos.",
      409,
      "DUPLICATE_ENTRY",
      err.sqlMessage
    );
  }

  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    logger.warn(`MySQL ER_ROW_IS_REFERENCED_2 en ${req.originalUrl}: ${err.sqlMessage}`);
    return ApiResponse.error(
      res,
      "No se puede eliminar el registro porque está referenciado por otras entidades del sistema.",
      409,
      "FOREIGN_KEY_CONFLICT",
      err.sqlMessage
    );
  }

  // Errores no controlados (500)
  logger.error(`Excepción no controlada en [${req.method}] ${req.originalUrl}:`, err.stack || err);
  return ApiResponse.error(
    res,
    "Ha ocurrido un error interno en el servidor. Por favor intenta más tarde.",
    500,
    "INTERNAL_SERVER_ERROR",
    process.env.NODE_ENV === "development" ? err.message : null
  );
}
