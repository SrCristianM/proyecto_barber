import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      "Demasiados intentos de acceso desde esta dirección IP. Por favor intenta nuevamente en 15 minutos.",
      429,
      "TOO_MANY_REQUESTS"
    );
  }
});
