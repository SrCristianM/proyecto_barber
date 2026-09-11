import { ApiError } from "../errors/apiError.js";
import { ROLES } from "../config/constants.js";

/**
 * Valida que el usuario autenticado tenga al menos uno de los roles autorizados.
 * @param {Array<number|string>} allowedRoles Lista de id_rol permitidos (ej: [1, 2] o [ROLES.ADMIN, ROLES.RECEPCIONISTA])
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized("Usuario no autenticado");
    }

    const userRoleId = Number(req.user.id_rol);
    const normalizedAllowed = allowedRoles.map((r) => Number(r));

    // El Administrador (rol 1) siempre tiene acceso a todo
    if (userRoleId === ROLES.ADMIN) {
      return next();
    }

    if (!normalizedAllowed.includes(userRoleId)) {
      throw ApiError.forbidden(
        `Tu rol (${req.user.rol || userRoleId}) no tiene los permisos necesarios para realizar esta acción.`
      );
    }

    next();
  };
}

/**
 * Valida que el usuario tenga permiso específico sobre un módulo.
 * @param {string} modulo Nombre del módulo (ej: 'citas', 'ventas', 'productos')
 * @param {string} accion Acción a validar (ej: 'crear', 'editar', 'eliminar')
 */
export function authorizePermission(modulo, accion) {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized("Usuario no autenticado");
    }

    const userRoleId = Number(req.user.id_rol);
    // Administrador bypass
    if (userRoleId === ROLES.ADMIN) {
      return next();
    }

    // Si el usuario tiene permisos cargados en su token
    if (Array.isArray(req.user.permisos)) {
      const hasDirect = req.user.permisos.includes(`${modulo}_${accion}`) || req.user.permisos.includes(accion);
      if (hasDirect) {
        return next();
      }
    }

    // Reglas de negocio predeterminadas por rol si no están explícitos en el token
    if (userRoleId === ROLES.RECEPCIONISTA) {
      if (["citas", "clientes", "ventas", "horarios"].includes(modulo)) {
        return next();
      }
    }

    if (userRoleId === ROLES.BARBERO) {
      if (modulo === "citas" && ["ver", "editar"].includes(accion)) return next();
      if (modulo === "horarios" && ["ver"].includes(accion)) return next();
    }

    if (userRoleId === ROLES.CLIENTE) {
      if (modulo === "citas" && ["ver", "crear"].includes(accion)) return next();
    }

    throw ApiError.forbidden(`Permiso insuficiente: '${modulo}:${accion}'`);
  };
}
