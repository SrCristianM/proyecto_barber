import { useState } from "react";

const mockRoles = [
  { id: 1, name: "Administrador", description: "Acceso total al sistema", permissions: 45, users: 2, status: "Activo", createdAt: "2026-01-15" },
  { id: 2, name: "Recepcionista", description: "Gestión de citas y clientes", permissions: 25, users: 3, status: "Activo", createdAt: "2026-02-20" },
  { id: 3, name: "Barbero", description: "Acceso a servicios y citas", permissions: 15, users: 8, status: "Activo", createdAt: "2026-03-10" },
  { id: 4, name: "Cliente", description: "Acceso limitado a reservas", permissions: 5, users: 150, status: "Activo", createdAt: "2026-04-05" }
];

const emptyForm = { name: "", description: "" };

export function useRoles() {
  const [roles, setRoles] = useState(mockRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
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
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newRole = {
      id: Math.max(...roles.map((r) => r.id), 0) + 1,
      name: formData.name,
      description: formData.description,
      permissions: 0,
      users: 0,
      status: "Activo",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedRole) return;
    setRoles(
      roles.map((role) =>
        role.id === selectedRole.id
          ? { ...role, name: formData.name, description: formData.description }
          : role
      )
    );
    setShowEditModal(false);
    setSelectedRole(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRole) return;
    setRoles(roles.filter((role) => role.id !== selectedRole.id));
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  const toggleStatus = (roleId) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId ? { ...role, status: role.status === "Activo" ? "Inactivo" : "Activo" } : role
      )
    );
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description });
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
    openEditModal,
    openDetailModal,
    openDeleteModal
  };
}
