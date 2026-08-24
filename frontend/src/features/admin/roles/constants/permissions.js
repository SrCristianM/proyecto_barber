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

export function snapshotRolesPermisos(roles = []) {
  return [...roles]
    .sort((a, b) => {
      const indexA = SYSTEM_ROLE_ORDER.indexOf(a.nombre_rol);
      const indexB = SYSTEM_ROLE_ORDER.indexOf(b.nombre_rol);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    })
    .slice(0, 4)
    .map((role) => ({
      id_rol: role.id_rol,
      nombre_rol: role.nombre_rol,
      permisos: [...(role.permisos || [])],
      alcancePorPermiso: { ...(role.alcancePorPermiso || {}) }
    }));
}
