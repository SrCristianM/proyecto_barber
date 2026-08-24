import { useState } from "react";
import { ROLES } from "../../../../shared/types/database";
import { withDefaultPermissions, PERMISSION_ACTIONS, snapshotRolesPermisos } from "../constants/permissions";

const togglePermissionList = (permisos = [], permissionKey) => {
  const next = permisos.includes(permissionKey)
    ? permisos.filter((key) => key !== permissionKey)
    : [...permisos, permissionKey];

  return PERMISSION_ACTIONS.map((action) => action.key).filter((key) => next.includes(key));
};

const emptyForm = {
  nombre_rol: "",
  descripcion: "",
  estado: 1,
  permisos: ["ver"],
  alcancePorPermiso: {},
  rolesPermisos: []
};

export function useRoles() {
  const [roles, setRoles] = useState(ROLES.map(withDefaultPermissions));
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombre_rol");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredRoles = roles
    .filter((role) =>
      role.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const applyRolesPermisos = (currentRoles) =>
    currentRoles.map((role) => {
      const updated = (formData.rolesPermisos || []).find((item) => item.id_rol === role.id_rol);
      if (!updated) return role;
      return {
        ...role,
        permisos: updated.permisos,
        alcancePorPermiso: updated.alcancePorPermiso || role.alcancePorPermiso
      };
    });

  const handleCreate = () => {
    const newRole = {
      id_rol: Math.max(...roles.map((r) => r.id_rol), 0) + 1,
      nombre_rol: formData.nombre_rol,
      descripcion: formData.descripcion,
      estado: 1,
      fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19),
      permisos: formData.permisos || ["ver"],
      alcancePorPermiso: formData.alcancePorPermiso || {}
    };
    setRoles([...applyRolesPermisos(roles), newRole]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedRole) return;
    setRoles(
      applyRolesPermisos(roles).map((role) =>
        role.id_rol === selectedRole.id_rol
          ? {
              ...role,
              nombre_rol: formData.nombre_rol,
              descripcion: formData.descripcion
            }
          : role
      )
    );
    setShowEditModal(false);
    setSelectedRole(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRole) return;
    setRoles(roles.filter((role) => role.id_rol !== selectedRole.id_rol));
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  const toggleStatus = (roleId) => {
    setRoles(
      roles.map((role) =>
        role.id_rol === roleId ? { ...role, estado: role.estado === 1 ? 0 : 1 } : role
      )
    );
  };

  const openCreateModal = () => {
    setFormData({
      ...emptyForm,
      rolesPermisos: snapshotRolesPermisos(roles)
    });
    setShowCreateModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      nombre_rol: role.nombre_rol,
      descripcion: role.descripcion || "",
      estado: role.estado,
      permisos: role.permisos || ["ver"],
      alcancePorPermiso: role.alcancePorPermiso || {},
      rolesPermisos: snapshotRolesPermisos(roles)
    });
    setShowEditModal(true);
  };

  const openDetailModal = (role) => {
    setSelectedRole(role);
    setShowDetailModal(true);
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const toggleFormRolePermission = (roleId, permissionKey) => {
    setFormData({
      ...formData,
      permisos:
        selectedRole && selectedRole.id_rol === roleId
          ? togglePermissionList(formData.permisos, permissionKey)
          : formData.permisos,
      rolesPermisos: (formData.rolesPermisos || []).map((role) =>
        role.id_rol === roleId
          ? { ...role, permisos: togglePermissionList(role.permisos, permissionKey) }
          : role
      )
    });
  };

  return {
    roles,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    handleSort,
    filteredRoles,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedRole,
    setSelectedRole,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    toggleFormRolePermission
  };
}
