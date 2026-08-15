import { useState } from "react";

const mockUsers = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", phone: "+57 300 123 4567", role: "Administrador", status: "Activo", lastLogin: "Hace 2 horas", createdAt: "2026-01-15" },
  { id: 2, name: "María García", email: "maria@example.com", phone: "+57 301 234 5678", role: "Recepcionista", status: "Activo", lastLogin: "Hace 5 horas", createdAt: "2026-02-20" },
  { id: 3, name: "Carlos Rodríguez", email: "carlos@example.com", phone: "+57 302 345 6789", role: "Barbero", status: "Activo", lastLogin: "Hace 1 día", createdAt: "2026-03-10" },
  { id: 4, name: "Ana Torres", email: "ana@example.com", phone: "+57 303 456 7890", role: "Barbero", status: "Activo", lastLogin: "Hace 3 horas", createdAt: "2026-04-05" },
  { id: 5, name: "Luis Martínez", email: "luis@example.com", phone: "+57 304 567 8901", role: "Barbero", status: "Inactivo", lastLogin: "Hace 7 días", createdAt: "2026-05-12" }
];

export const availableRoles = ["Administrador", "Recepcionista", "Barbero", "Cliente"];

const emptyForm = { name: "", email: "", phone: "", role: "Barbero", password: "" };

export function useUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    const newUser = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "Activo",
      lastLogin: "Nunca",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setUsers([...users, newUser]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
          : user
      )
    );
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "Activo" ? "Inactivo" : "Activo" } : user
      )
    );
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone || "", role: user.role, password: "" });
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

  return {
    users,
    searchTerm,
    setSearchTerm,
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
    selectedUser,
    setSelectedUser,
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
