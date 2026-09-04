import { useState } from "react";
import { ROLES } from "../../../../shared/types/database";
import { getStoredUsers, saveStoredUsers } from "../../../auth/services/authService";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

export const availableRoles = ROLES;

const emptyForm = { nombre: "", apellido: "", correo: "", telefono: "", id_rol: 3, contrasena: "", estado: 1 };

export function useUsers() {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | id_rol
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getRoleName = (id_rol) => {
    const r = ROLES.find((role) => role.id_rol === Number(id_rol));
    return r ? r.nombre_rol : "Sin Rol";
  };

  const filteredUsers = users
    .filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        fullName.includes(search) ||
        user.correo.toLowerCase().includes(search) ||
        (user.telefono || "").includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && user.estado === 1) ||
        (statusFilter === "0" && user.estado === 0);

      const matchesRole =
        roleFilter === "all" || String(user.id_rol) === String(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || roleFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newUser = {
      id_usuario: Math.max(...users.map((u) => u.id_usuario), 0) + 1,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      id_rol: Number(formData.id_rol),
      contrasena: formData.contrasena || "Admin123*",
      estado: 1,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    const updated = users.map((user) =>
      user.id_usuario === selectedUser.id_usuario
        ? {
            ...user,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            correo: formData.correo.trim(),
            telefono: formData.telefono ? formData.telefono.trim() : null,
            id_rol: Number(formData.id_rol)
          }
        : user
    );
    setUsers(updated);
    saveStoredUsers(updated);
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    const updated = users.filter((user) => user.id_usuario !== selectedUser.id_usuario);
    setUsers(updated);
    saveStoredUsers(updated);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleStatus = (userId) => {
    const updated = users.map((user) =>
      user.id_usuario === userId ? { ...user, estado: user.estado === 1 ? 0 : 1 } : user
    );
    setUsers(updated);
    saveStoredUsers(updated);
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "REPORTE OFICIAL DE USUARIOS",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `usuarios_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_usuario", width: 10, type: "number" },
        { header: "Nombre", key: "nombre", width: 20 },
        { header: "Apellido", key: "apellido", width: 20 },
        { header: "Correo Electrónico", key: "correo", width: 30 },
        { header: "Teléfono", key: "telefono", width: 18 },
        { header: "Rol", key: "rol", width: 18 },
        { header: "Estado", key: "estado_nombre", width: 14 },
        { header: "Fecha Registro", key: "fecha_registro", width: 20 }
      ],
      data: filteredUsers.map((u) => ({
        ...u,
        telefono: u.telefono || "—",
        rol: getRoleName(u.id_rol),
        estado_nombre: u.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono || "",
      id_rol: user.id_rol,
      contrasena: ""
    });
    setShowEditModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openDeactivateModal = (user) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  return {
    users,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredUsers,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedUser,
    setSelectedUser,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal,
    getRoleName
  };
}
