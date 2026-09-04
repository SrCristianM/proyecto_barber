export const PERMISSION_ACTIONS = [
  { key: "ver", label: "Ver" },
  { key: "crear", label: "Crear" },
  { key: "editar", label: "Editar" },
  { key: "eliminar", label: "Eliminar" },
  { key: "asignar_roles", label: "Asignar roles" }
];

export const SYSTEM_ROLE_ORDER = ["Administrador", "Barbero", "Recepcionista", "Cliente"];

export const DEFAULT_ROLE_PERMISSIONS = {
  Administrador: {
    permisos: ["ver", "crear", "editar", "eliminar", "asignar_roles"],
    alcancePorPermiso: {}
  },
  Barbero: {
    permisos: ["ver", "editar"],
    alcancePorPermiso: { editar: "solo sus citas" }
  },
  Recepcionista: {
    permisos: ["ver", "crear", "editar"],
    alcancePorPermiso: {}
  },
  Cliente: {
    permisos: ["ver", "crear"],
    alcancePorPermiso: { crear: "solo sus propias citas" }
  }
};

export function getPermissionLabel(key) {
  return PERMISSION_ACTIONS.find((action) => action.key === key)?.label ?? key;
}

export function formatPermissionItems(permisos = [], alcancePorPermiso = {}) {
  return permisos.map((key) => {
    const label = getPermissionLabel(key).toLowerCase();
    const alcance = alcancePorPermiso[key];
    return alcance ? `${label} (${alcance})` : label;
  });
}

export function withDefaultPermissions(role) {
  const defaults = DEFAULT_ROLE_PERMISSIONS[role.nombre_rol] ?? {
    permisos: ["ver"],
    alcancePorPermiso: {}
  };

  return {
    ...role,
    permisos: role.permisos ?? defaults.permisos,
    alcancePorPermiso: role.alcancePorPermiso ?? defaults.alcancePorPermiso
  };
}

export const SYSTEM_MODULES = [
  {
    id: "usuarios",
    label: "Usuarios",
    iconName: "Users",
    acciones: [
      { key: "usuarios_ver", label: "Ver Usuarios", accion: "Ver" },
      { key: "usuarios_crear", label: "Crear Usuarios", accion: "Crear" },
      { key: "usuarios_editar", label: "Editar Usuarios", accion: "Editar" },
      { key: "usuarios_eliminar", label: "Eliminar Usuarios", accion: "Eliminar" },
      { key: "usuarios_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "roles",
    label: "Roles y Permisos",
    iconName: "ShieldCheck",
    acciones: [
      { key: "roles_ver", label: "Ver Roles", accion: "Ver" },
      { key: "roles_crear", label: "Crear Roles", accion: "Crear" },
      { key: "roles_editar", label: "Editar Roles", accion: "Editar" },
      { key: "roles_eliminar", label: "Eliminar Roles", accion: "Eliminar" },
      { key: "roles_asignar", label: "Asignar Roles", accion: "Asignar" }
    ]
  },
  {
    id: "citas",
    label: "Citas",
    iconName: "Calendar",
    acciones: [
      { key: "citas_ver", label: "Ver Citas", accion: "Ver" },
      { key: "citas_crear", label: "Agendar Citas", accion: "Crear" },
      { key: "citas_editar", label: "Editar Citas", accion: "Editar" },
      { key: "citas_cancelar", label: "Cancelar Citas", accion: "Cancelar" }
    ]
  },
  {
    id: "servicios",
    label: "Servicios",
    iconName: "Scissors",
    acciones: [
      { key: "servicios_ver", label: "Ver Servicios", accion: "Ver" },
      { key: "servicios_crear", label: "Crear Servicios", accion: "Crear" },
      { key: "servicios_editar", label: "Editar Servicios", accion: "Editar" },
      { key: "servicios_eliminar", label: "Eliminar Servicios", accion: "Eliminar" },
      { key: "servicios_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "productos",
    label: "Productos",
    iconName: "Package",
    acciones: [
      { key: "productos_ver", label: "Ver Productos", accion: "Ver" },
      { key: "productos_crear", label: "Crear Productos", accion: "Crear" },
      { key: "productos_editar", label: "Editar Productos", accion: "Editar" },
      { key: "productos_eliminar", label: "Eliminar Productos", accion: "Eliminar" },
      { key: "productos_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "ventas",
    label: "Ventas",
    iconName: "Receipt",
    acciones: [
      { key: "ventas_ver", label: "Ver Ventas", accion: "Ver" },
      { key: "ventas_crear", label: "Registrar Ventas", accion: "Crear" },
      { key: "ventas_editar", label: "Editar Ventas", accion: "Editar" },
      { key: "ventas_anular", label: "Anular Ventas", accion: "Anular" }
    ]
  },
  {
    id: "horarios",
    label: "Horarios",
    iconName: "Clock",
    acciones: [
      { key: "horarios_ver", label: "Ver Horarios", accion: "Ver" },
      { key: "horarios_crear", label: "Crear Horarios", accion: "Crear" },
      { key: "horarios_editar", label: "Editar Horarios", accion: "Editar" },
      { key: "horarios_eliminar", label: "Eliminar Horarios", accion: "Eliminar" },
      { key: "horarios_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "clientes",
    label: "Clientes",
    iconName: "UserCheck",
    acciones: [
      { key: "clientes_ver", label: "Ver Clientes", accion: "Ver" },
      { key: "clientes_crear", label: "Crear Clientes", accion: "Crear" },
      { key: "clientes_editar", label: "Editar Clientes", accion: "Editar" },
      { key: "clientes_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "proveedores",
    label: "Proveedores",
    iconName: "Truck",
    acciones: [
      { key: "proveedores_ver", label: "Ver Proveedores", accion: "Ver" },
      { key: "proveedores_crear", label: "Crear Proveedores", accion: "Crear" },
      { key: "proveedores_editar", label: "Editar Proveedores", accion: "Editar" },
      { key: "proveedores_eliminar", label: "Eliminar Proveedores", accion: "Eliminar" },
      { key: "proveedores_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "compras",
    label: "Compras",
    iconName: "ShoppingCart",
    acciones: [
      { key: "compras_ver", label: "Ver Compras", accion: "Ver" },
      { key: "compras_crear", label: "Registrar Compras", accion: "Crear" },
      { key: "compras_editar", label: "Editar Compras", accion: "Editar" },
      { key: "compras_anular", label: "Anular Compras", accion: "Anular" },
      { key: "compras_eliminar", label: "Eliminar Compras", accion: "Eliminar" }
    ]
  }
];

export function getHumanPermissionLabel(key) {
  for (const mod of SYSTEM_MODULES) {
    const found = mod.acciones.find((a) => a.key === key);
    if (found) return found.label;
  }
  return getPermissionLabel(key);
}

export function groupPermissionsByModule(permisos = []) {
  const result = [];
  const assignedSet = new Set(permisos || []);

  // 1. Módulos estándar del sistema
  SYSTEM_MODULES.forEach((mod) => {
    const activeActions = mod.acciones.filter((acc) => assignedSet.has(acc.key));
    if (activeActions.length > 0) {
      result.push({
        id: mod.id,
        label: mod.label,
        iconName: mod.iconName,
        totalInModule: mod.acciones.length,
        assignedCount: activeActions.length,
        acciones: activeActions
      });
    }
  });

  // 2. Permisos globales que no tengan prefijo de módulo
  const knownKeys = new Set(SYSTEM_MODULES.flatMap((m) => m.acciones.map((a) => a.key)));
  const generalPerms = (permisos || []).filter((p) => !knownKeys.has(p));

  if (generalPerms.length > 0) {
    result.push({
      id: "general",
      label: "Permisos Globales del Sistema",
      iconName: "Shield",
      totalInModule: generalPerms.length,
      assignedCount: generalPerms.length,
      acciones: generalPerms.map((k) => ({
        key: k,
        label: getPermissionLabel(k),
        accion: getPermissionLabel(k)
      }))
    });
  }

  return result;
}
