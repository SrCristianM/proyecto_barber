import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/apiResponse.js";

export function validate(validations) {
  return async (req, res, next) => {
    // Ejecutar todas las reglas de validación en paralelo
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      campo: err.path || err.param,
      mensaje: err.msg,
      valor: err.value
    }));

    return ApiResponse.error(
      res,
      "Los datos enviados contienen errores de validación",
      400,
      "VALIDATION_ERROR",
      formattedErrors
    );
  };
}
