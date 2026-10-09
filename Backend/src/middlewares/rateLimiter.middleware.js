import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 30 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== "production", // En desarrollo no bloquear intentos
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      "Demasiados intentos de acceso desde esta dirección IP. Por favor intenta nuevamente en 15 minutos.",
      429,
      "TOO_MANY_REQUESTS"
    );
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 300 : 10000,
  skip: () => env.NODE_ENV !== "production"
});
