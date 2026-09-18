import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "../services/authService";

/**
 * Hook centralizado de autorización RBAC en el Frontend.
 * Controla el acceso a módulos, botones, acciones y vistas
 * de forma 100% reactiva según los permisos asignados en la BD por el Administrador.
 */
const SYSTEM_ROLES_PERMISSIONS = ["roles_ver", "roles_crear", "roles_editar", "roles_eliminar", "roles_asignar"];

export function usePermissions() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [permissionVersion, setPermissionVersion] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser());
      setPermissionVersion((v) => v + 1);
    };

    const handlePermissionsUpdated = () => {
      setUser(getCurrentUser());
      setPermissionVersion((v) => v + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("barber_permissions_updated", handlePermissionsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("barber_permissions_updated", handlePermissionsUpdated);
    };
  }, []);

  const roleId = user ? Number(user.id_rol) : null;
  const isAdmin = roleId === 1;
  const isRecepcionista = roleId === 2;
  const isBarbero = roleId === 3;
  const isCliente = roleId === 4;

  /**
   * Obtiene la lista vigente de permisos para el rol del usuario en sesión.
   * Prioriza la base de datos de roles persistida en localStorage (actualizada por Admin),
   * luego el usuario en sesión, y finalmente los permisos por defecto.
   */
  const getRolePermissions = useCallback(() => {
    if (!roleId) return [];

    // 1. Revisar si en localStorage está la base de datos de roles actualizada dinámicamente por el Admin
    try {
      const storedRolesRaw = localStorage.getItem("barber_roles_db");
      if (storedRolesRaw) {
        const storedRoles = JSON.parse(storedRolesRaw);
        const currentRole = storedRoles.find((r) => Number(r.id_rol) === Number(roleId));
        if (currentRole && Array.isArray(currentRole.permisos)) {
          if (isAdmin) {
            // Regla de seguridad anti-lockout: Administrador SIEMPRE conserva los permisos de gestión de roles
            return Array.from(new Set([...currentRole.permisos, ...SYSTEM_ROLES_PERMISSIONS]));
          }
          return currentRole.permisos;
        }
      }
    } catch {
      // Continuar al siguiente nivel
    }

    // 2. Revisar permisos cargados en la sesión del usuario
    if (Array.isArray(user?.permisos) && user.permisos.length > 0) {
      if (isAdmin) {
        return Array.from(new Set([...user.permisos, ...SYSTEM_ROLES_PERMISSIONS]));
      }
      return user.permisos;
    }

    // 3. Permisos predeterminados de fábrica (solo si no han sido personalizados)
    if (isAdmin) {
      return ["*"];
    }

    if (isRecepcionista) {
      return [
        "citas_ver", "citas_crear", "citas_editar", "citas_cancelar",
        "servicios_ver", "servicios_crear", "servicios_editar", "servicios_eliminar", "servicios_activar",
        "productos_ver", "productos_crear", "productos_editar", "productos_eliminar", "productos_activar",
        "ventas_ver", "ventas_crear", "ventas_editar", "ventas_anular",
        "horarios_ver", "horarios_crear", "horarios_editar", "horarios_eliminar", "horarios_activar",
        "clientes_ver", "clientes_crear", "clientes_editar", "clientes_activar",
        "compras_ver", "compras_crear", "compras_editar", "compras_anular", "compras_eliminar",
        "barberos_ver", "barberos_crear", "barberos_editar", "barberos_eliminar", "barberos_activar",
        "proveedores_ver", "proveedores_eliminar"
      ];
    }

    if (isBarbero) {
      return [
        "citas_ver", "citas_editar",
        "horarios_ver", "horarios_crear",
        "servicios_ver",
        "ventas_ver"
      ];
    }

    if (isCliente) {
      return ["citas_ver", "citas_crear", "citas_cancelar", "servicios_ver", "productos_ver"];
    }

    return [];
  }, [isAdmin, roleId, isRecepcionista, isBarbero, isCliente, user, permissionVersion]);

  /**
   * Normaliza nombres de módulo a su identificador canónico en base de datos.
   */
  const normalizeModule = (moduleName) => {
    const raw = (moduleName || "")
      .toLowerCase()
      .trim()
      .replace(/^\/dashboard\/?/, "")
      .replace(/^\/barbero\/?/, "")
      .replace(/^\/portal\/?/, "")
      .replace(/^\//, "");

    const mapping = {
      "": "dashboard",
      dashboard: "dashboard",
      barbero: "dashboard",
      portal: "dashboard",
      agenda: "citas",
      citas: "citas",
      appointments: "citas",
      "mis-citas": "citas",
      clients: "clientes",
      clientes: "clientes",
      suppliers: "proveedores",
      proveedores: "proveedores",
      barbers: "barberos",
      barberos: "barberos",
      schedules: "horarios",
      horarios: "horarios",
      novelties: "horarios",
      novedades: "horarios",
      services: "servicios",
      servicios: "servicios",
      packages: "servicios",
      paquetes: "servicios",
      products: "productos",
      productos: "productos",
      categories: "productos",
      categorias: "productos",
      purchases: "compras",
      compras: "compras",
      sales: "ventas",
      ventas: "ventas",
      reportes: "ventas",
      reports: "ventas",
      users: "usuarios",
      usuarios: "usuarios",
      roles: "roles",
      settings: "configuracion",
      configuracion: "configuracion",
      perfil: "perfil"
    };

    return mapping[raw] || raw;
  };

  /**
   * Determina si el rol actual puede acceder a un módulo específico.
   * Se evalúa si el rol posee comodín '*' o al menos un permiso activo en ese módulo.
   * Aplica tanto a Administrador y Recepcionista como al Barbero según los permisos dados por el Admin.
   * @param {string} moduleName - Nombre o ruta del módulo ('citas', '/barbero/agenda', 'horarios', etc.)
   */
  const canAccess = useCallback((moduleName) => {
    const mod = normalizeModule(moduleName);

    // Dashboard principal siempre accesible para cualquier usuario autenticado en su respectivo panel
    if (mod === "dashboard" || mod === "") {
      return true;
    }

    // Perfil personal siempre accesible para ver/actualizar sus datos
    if (mod === "perfil") {
      return true;
    }

    // El Administrador SIEMPRE tiene acceso al módulo de roles y configuración (regla anti-lockout)
    if (isAdmin && (mod === "roles" || mod === "configuracion")) {
      return true;
    }

    // Rutas específicas del portal de cliente
    if (isCliente) {
      return ["agendar", "mis-citas", "servicios", "paquetes", "productos", "mis-compras"].includes(mod);
    }

    const permissions = getRolePermissions();
    if (permissions.includes("*")) {
      return true;
    }

    // Configuración requiere permisos de roles o usuarios
    if (mod === "configuracion") {
      return permissions.some((p) => p.startsWith("roles_") || p.startsWith("usuarios_"));
    }

    // Reportes requiere permiso en ventas o citas
    if (mod === "ventas" || mod === "reportes") {
      return permissions.some((p) => p.startsWith("ventas_") || p.startsWith("citas_"));
    }

    // Para cualquier otro módulo (citas, horarios, servicios, productos, etc.):
    // Debe tener al menos UN permiso activo en ese módulo (ej: 'citas_ver', 'horarios_ver', etc.)
    return permissions.some((p) => p.startsWith(`${mod}_`) || p === mod);
  }, [isAdmin, isCliente, getRolePermissions]);

  /**
   * Determina si el rol actual puede ejecutar una acción específica en un módulo.
   * @param {string} moduleName - Módulo ('suppliers', 'sales', 'barbers', etc.)
   * @param {string} action - Acción ('crear', 'editar', 'eliminar', 'ver', 'anular', 'activar', etc.)
   */
  const hasPermission = useCallback((moduleName, action) => {
    const mod = normalizeModule(moduleName);
    const act = (action || "").toLowerCase().trim();
    const permissions = getRolePermissions();

    // El Administrador SIEMPRE tiene permiso pleno sobre el módulo de roles
    if (isAdmin && mod === "roles") {
      return true;
    }

    if (permissions.includes("*")) {
      return true;
    }

    const targetKey = `${mod}_${act}`;
    if (permissions.includes(targetKey)) {
      return true;
    }

    // Alias de activación / estado: REQUIERE EXCLUSIVAMENTE el permiso de activación
    if (["activar", "desactivar", "estado", "status", "toggle"].includes(act)) {
      return permissions.includes(`${mod}_activar`);
    }

    // Alias de anulación / cancelación: REQUIERE permiso de anular o cancelar
    if (["anular", "cancelar"].includes(act)) {
      return permissions.includes(`${mod}_anular`) || permissions.includes(`${mod}_cancelar`);
    }

    // Alias de creación
    if (["crear", "create", "agregar", "add", "nuevo", "new"].includes(act)) {
      return permissions.includes(`${mod}_crear`) || permissions.includes(`${mod}_agregar`);
    }

    // Alias de edición
    if (["editar", "edit", "actualizar", "update", "modificar"].includes(act)) {
      return permissions.includes(`${mod}_editar`) || permissions.includes(`${mod}_modificar`);
    }

    // Alias de eliminación
    if (["eliminar", "delete", "borrar", "remove"].includes(act)) {
      return permissions.includes(`${mod}_eliminar`) || permissions.includes(`${mod}_borrar`);
    }

    // Alias de lectura
    if (["ver", "view", "read", "listar", "list", "detalle", "detail", "exportar", "export", "filtrar", "paginar"].includes(act)) {
      return (
        permissions.includes(`${mod}_ver`) ||
        permissions.includes(`${mod}_consultar`) ||
        permissions.includes(`${mod}_listar`)
      );
    }

    return false;
  }, [getRolePermissions]);

  return {
    user,
    roleId,
    isAdmin,
    isRecepcionista,
    isBarbero,
    isCliente,
    canAccess,
    hasPermission,
    getRolePermissions
  };
}

export default usePermissions;
