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
    permisos: [
      "usuarios_ver", "usuarios_crear", "usuarios_editar", "usuarios_eliminar", "usuarios_activar",
      "roles_ver", "roles_crear", "roles_editar", "roles_eliminar", "roles_asignar",
      "citas_ver", "citas_crear", "citas_editar", "citas_cancelar",
      "servicios_ver", "servicios_crear", "servicios_editar", "servicios_eliminar", "servicios_activar",
      "productos_ver", "productos_crear", "productos_editar", "productos_eliminar", "productos_activar",
      "ventas_ver", "ventas_crear", "ventas_editar", "ventas_anular",
      "horarios_ver", "horarios_crear", "horarios_editar", "horarios_eliminar", "horarios_activar",
      "clientes_ver", "clientes_crear", "clientes_editar", "clientes_activar",
      "proveedores_ver", "proveedores_crear", "proveedores_editar", "proveedores_eliminar", "proveedores_activar",
      "compras_ver", "compras_crear", "compras_editar", "compras_anular", "compras_eliminar",
      "barberos_ver", "barberos_crear", "barberos_editar", "barberos_eliminar", "barberos_activar",
      "paquetes_ver", "paquetes_crear", "paquetes_editar", "paquetes_eliminar",
      "abastecimiento_ver", "abastecimiento_crear", "abastecimiento_anular", "abastecimiento_editar", "abastecimiento_eliminar"
    ],
    alcancePorPermiso: {}
  },
  Recepcionista: {
    permisos: [
      "citas_ver", "citas_crear", "citas_editar", "citas_cancelar",
      "servicios_ver", "servicios_crear", "servicios_editar", "servicios_eliminar", "servicios_activar",
      "productos_ver", "productos_crear", "productos_editar", "productos_eliminar", "productos_activar",
      "ventas_ver", "ventas_crear", "ventas_editar", "ventas_anular",
      "horarios_ver", "horarios_crear", "horarios_editar", "horarios_eliminar", "horarios_activar",
      "clientes_ver", "clientes_crear", "clientes_editar", "clientes_activar",
      "proveedores_ver", "proveedores_eliminar",
      "compras_ver", "compras_crear", "compras_editar", "compras_anular", "compras_eliminar",
      "barberos_ver", "barberos_crear", "barberos_editar", "barberos_eliminar", "barberos_activar",
      "paquetes_ver", "paquetes_crear", "paquetes_editar", "paquetes_eliminar",
      "abastecimiento_ver", "abastecimiento_crear", "abastecimiento_anular"
    ],
    alcancePorPermiso: {}
  },
  Barbero: {
    permisos: [
      "citas_ver", "citas_crear", "citas_editar", "citas_cancelar",
      "horarios_ver", "horarios_crear", "horarios_editar", "horarios_eliminar", "horarios_activar",
      "servicios_ver", "paquetes_ver",
      "productos_ver",
      "clientes_ver",
      "ventas_ver"
    ],
    alcancePorPermiso: {
      citas_editar: "sus citas asignadas",
      citas_cancelar: "sus citas asignadas",
      horarios_crear: "sus novedades de turno",
      ventas_ver: "sus comisiones y reportes"
    }
  },
  Cliente: {
    permisos: [
      "citas_ver", "citas_crear", "citas_cancelar",
      "servicios_ver", "paquetes_ver",
      "productos_ver",
      "horarios_ver",
      "barberos_ver",
      "ventas_ver", "ventas_crear"
    ],
    alcancePorPermiso: {
      citas_crear: "sus propias reservas",
      citas_cancelar: "sus propias citas",
      ventas_ver: "sus propios comprobantes"
    }
  }
};

export function getPermissionLabel(key) {
  return PERMISSION_ACTIONS.find((action) => action.key === key)?.label ?? key;
}

export function formatPermissionItems(permisos = [], alcancePorPermiso = {}) {
  return permisos.map((key) => {
    const label = getHumanPermissionLabel(key) || getPermissionLabel(key);
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
  },
  {
    id: "barberos",
    label: "Barberos",
    iconName: "Scissors",
    acciones: [
      { key: "barberos_ver", label: "Ver Barberos", accion: "Ver" },
      { key: "barberos_crear", label: "Crear Barberos", accion: "Crear" },
      { key: "barberos_editar", label: "Editar Barberos", accion: "Editar" },
      { key: "barberos_eliminar", label: "Eliminar Barberos", accion: "Eliminar" },
      { key: "barberos_activar", label: "Activar / Desactivar", accion: "Estado" }
    ]
  },
  {
    id: "paquetes",
    label: "Paquetes",
    iconName: "Layers",
    acciones: [
      { key: "paquetes_ver", label: "Ver Paquetes", accion: "Ver" },
      { key: "paquetes_crear", label: "Crear Paquetes", accion: "Crear" },
      { key: "paquetes_editar", label: "Editar Paquetes", accion: "Editar" },
      { key: "paquetes_eliminar", label: "Eliminar Paquetes", accion: "Eliminar" }
    ]
  },
  {
    id: "abastecimiento",
    label: "Abastecimiento",
    iconName: "Boxes",
    acciones: [
      { key: "abastecimiento_ver", label: "Ver Abastecimiento", accion: "Ver" },
      { key: "abastecimiento_crear", label: "Registrar Abastecimiento", accion: "Crear" },
      { key: "abastecimiento_anular", label: "Anular Abastecimiento", accion: "Anular" },
      { key: "abastecimiento_editar", label: "Editar Abastecimiento", accion: "Editar" },
      { key: "abastecimiento_eliminar", label: "Eliminar Abastecimiento", accion: "Eliminar" }
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
