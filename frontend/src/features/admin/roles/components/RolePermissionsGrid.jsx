import RolePermissionBlock from "./RolePermissionBlock";

export default function RolePermissionsGrid({ rolesPermisos = [], onTogglePermission }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 items-stretch"
      style={{ ["--role-card-height"]: "20rem" }}
    >
      {rolesPermisos.map((role) => (
        <RolePermissionBlock
          key={role.id_rol}
          roleName={role.nombre_rol}
          permisos={role.permisos}
          alcancePorPermiso={role.alcancePorPermiso}
          editable
          fixedHeight
          onTogglePermission={(permissionKey) => onTogglePermission(role.id_rol, permissionKey)}
        />
      ))}
    </div>
  );
}
