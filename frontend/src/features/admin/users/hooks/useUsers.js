import { useState } from "react";
import { ROLES } from "../../../../shared/types/database";

const mockUsers = [
  { id_usuario: 1, nombre: "Juan", apellido: "Pérez", correo: "juan@example.com", telefono: "+57 300 123 4567", id_rol: 1, estado: 1, fecha_registro: "2026-01-15 10:30:00" },
  { id_usuario: 2, nombre: "María", apellido: "García", correo: "maria@example.com", telefono: "+57 301 234 5678", id_rol: 2, estado: 1, fecha_registro: "2026-02-20 14:15:00" },
  { id_usuario: 3, nombre: "Carlos", apellido: "Rodríguez", correo: "carlos@example.com", telefono: "+57 302 345 6789", id_rol: 3, estado: 1, fecha_registro: "2026-03-10 09:00:00" },
  { id_usuario: 4, nombre: "Ana", apellido: "Torres", correo: "ana@example.com", telefono: "+57 303 456 7890", id_rol: 3, estado: 1, fecha_registro: "2026-04-05 16:45:00" },
  { id_usuario: 5, nombre: "Luis", apellido: "Martínez", correo: "luis@example.com", telefono: "+57 304 567 8901", id_rol: 3, estado: 0, fecha_registro: "2026-05-12 11:20:00" }
];

export const availableRoles = ROLES;

const emptyForm = { nombre: "", apellido: "", correo: "", telefono: "", id_rol: 3, contrasena: "", estado: 1 };

export function useUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombre");
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

  const getRoleName = (id_rol) => {
    const r = ROLES.find((role) => role.id_rol === Number(id_rol));
    return r ? r.nombre_rol : "Sin Rol";
  };

  const filteredUsers = users
    .filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || user.correo.toLowerCase().includes(search);
    })
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
      id_usuario: Math.max(...users.map((u) => u.id_usuario), 0) + 1,
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      telefono: formData.telefono,
      id_rol: Number(formData.id_rol),
      contrasena: formData.contrasena,
      estado: 1,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setUsers([...users, newUser]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((user) =>
        user.id_usuario === selectedUser.id_usuario
          ? {
              ...user,
              nombre: formData.nombre,
              apellido: formData.apellido,
              correo: formData.correo,
              telefono: formData.telefono,
              id_rol: Number(formData.id_rol)
            }
          : user
      )
    );
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter((user) => user.id_usuario !== selectedUser.id_usuario));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id_usuario === userId ? { ...user, estado: user.estado === 1 ? 0 : 1 } : user
      )
    );
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
    openDeleteModal,
    getRoleName
  };
}
