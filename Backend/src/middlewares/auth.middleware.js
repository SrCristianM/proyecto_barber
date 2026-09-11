import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../errors/apiError.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Token de autorización no proporcionado o formato inválido.");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    throw ApiError.unauthorized("Token de sesión expirado o inválido. Por favor inicia sesión nuevamente.");
  }

  req.user = decoded;
  next();
}

/**
 * Middleware opcional para endpoints públicos que pueden beneficiarse del usuario si viene autenticado
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}
