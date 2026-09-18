import { ApiError } from "../errors/apiError.js";
import { ROLES } from "../config/constants.js";
import { AuthRepository } from "../models/auth.model.js";

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

    if (!normalizedAllowed.includes(userRoleId)) {
      throw ApiError.forbidden(
        `Tu rol (${req.user.rol || userRoleId}) no tiene los permisos necesarios para realizar esta acción.`
      );
    }

    next();
  };
}

/**
 * Valida dinámicamente que el usuario tenga el permiso asignado a su rol en la base de datos.
 * Se consulta en tiempo real para que cualquier cambio del Administrador tome efecto de inmediato.
 * Si el Administrador le retira un permiso a cualquier rol (incluso al propio rol Administrador),
 * la acción quedará bloqueada estrictamente.
 * @param {string} modulo Nombre del módulo (ej: 'citas', 'ventas', 'productos', 'proveedores', 'usuarios')
 * @param {string} accion Acción a validar (ej: 'ver', 'crear', 'editar', 'eliminar', 'activar', 'anular')
 */
export function authorizePermission(modulo, accion) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized("Usuario no autenticado");
      }

      const userRoleId = Number(req.user.id_rol);

      // Consultar los permisos vigentes en la BD para el rol del usuario
      const rawRolePermissions = await AuthRepository.getUserPermissions(userRoleId);
      const rolePermissions = (rawRolePermissions || []).map((p) =>
        (p || "").toLowerCase().replace(":", "_").trim()
      );

      // Si el rol tiene comodín universal '*' concedido
      if (rolePermissions.includes("*")) {
        return next();
      }

      // Si es Administrador pero aún no se le han asignado permisos explícitos en BD, permitir acceso por defecto
      if (userRoleId === ROLES.ADMIN && rolePermissions.length === 0) {
        return next();
      }

      const normMod = (modulo || "").toLowerCase().trim();
      const normAct = (accion || "").toLowerCase().trim();
      const targetKey = `${normMod}_${normAct}`;

      // Regla de sistema irrevocable: El Administrador SIEMPRE tiene permiso total para gestionar roles y permisos (anti-lockout)
      if (userRoleId === ROLES.ADMIN && (normMod === "roles" || normMod === "configuracion")) {
        return next();
      }

      // 1. Coincidencia exacta (ej: 'productos_crear', 'usuarios_activar')
      if (rolePermissions.includes(targetKey)) {
        return next();
      }

      // 2. Alias de activación / estado: REQUIERE EXCLUSIVAMENTE el permiso de activación
      if (["activar", "desactivar", "estado", "status"].includes(normAct)) {
        if (rolePermissions.includes(`${normMod}_activar`)) {
          return next();
        }
      }

      // 3. Alias de anulación / cancelación: REQUIERE permiso de anular o cancelar
      if (["anular", "cancelar"].includes(normAct)) {
        if (
          rolePermissions.includes(`${normMod}_anular`) ||
          rolePermissions.includes(`${normMod}_cancelar`)
        ) {
          return next();
        }
      }

      // 4. Alias de creación
      if (["crear", "create", "agregar", "add"].includes(normAct)) {
        if (
          rolePermissions.includes(`${normMod}_crear`) ||
          rolePermissions.includes(`${normMod}_agregar`)
        ) {
          return next();
        }
      }

      // 5. Alias de lectura
      if (["ver", "view", "listar", "list", "consultar", "detalle"].includes(normAct)) {
        if (
          rolePermissions.includes(`${normMod}_ver`) ||
          rolePermissions.includes(`${normMod}_consultar`) ||
          rolePermissions.includes(`${normMod}_listar`)
        ) {
          return next();
        }
      }

      // 6. Alias de edición
      if (["editar", "edit", "actualizar", "update", "modificar"].includes(normAct)) {
        if (
          rolePermissions.includes(`${normMod}_editar`) ||
          rolePermissions.includes(`${normMod}_modificar`)
        ) {
          return next();
        }
      }

      // 7. Alias de eliminación
      if (["eliminar", "delete", "borrar", "remove"].includes(normAct)) {
        if (
          rolePermissions.includes(`${normMod}_eliminar`) ||
          rolePermissions.includes(`${normMod}_borrar`)
        ) {
          return next();
        }
      }

      // 8. Reglas especiales para Cliente
      if (userRoleId === ROLES.CLIENTE) {
        if (normMod === "citas" && ["crear", "ver", "cancelar"].includes(normAct)) {
          if (
            rolePermissions.includes(`citas_${normAct}`) ||
            rolePermissions.includes("citas_ver") ||
            normAct === "crear"
          ) {
            return next();
          }
        }
      }

      // 9. Reglas especiales para Barbero
      if (userRoleId === ROLES.BARBERO) {
        if (normMod === "citas" && ["ver", "editar"].includes(normAct)) {
          if (rolePermissions.includes(`citas_${normAct}`) || rolePermissions.includes("citas_ver")) {
            return next();
          }
        }
        if (normMod === "horarios" && ["ver", "crear"].includes(normAct)) {
          if (rolePermissions.includes(`horarios_${normAct}`) || rolePermissions.includes("horarios_ver")) {
            return next();
          }
        }
      }

      throw ApiError.forbidden(
        `Tu rol no tiene permiso para realizar esta acción: [${normMod}:${normAct}]. Contacta al administrador.`
      );
    } catch (err) {
      next(err);
    }
  };
}

