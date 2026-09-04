import { useState } from "react";
import { ROLES } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

const emptyForm = {
  nombre_rol: "",
  descripcion: "",
  estado: 1,
  permisos: []
};

export function useRoles() {
  const [roles, setRoles] = useState(ROLES.map((r) => ({
    ...r,
    permisos: r.permisos || [],
    alcancePorPermiso: r.alcancePorPermiso || {}
  })));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [sortField, setSortField] = useState("nombre_rol");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
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
    .filter((role) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        search === "" ||
        role.nombre_rol.toLowerCase().includes(search) ||
        (role.descripcion || "").toLowerCase().includes(search);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && role.estado === 1) ||
        (statusFilter === "0" && role.estado === 0);

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newRole = {
      id_rol: Math.max(...roles.map((r) => r.id_rol), 0) + 1,
      nombre_rol: formData.nombre_rol.trim(),
      descripcion: formData.descripcion.trim(),
      estado: 1,
      fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19),
      permisos: formData.permisos || [],
      alcancePorPermiso: {}
    };
    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedRole) return;
    setRoles(
      roles.map((role) =>
        role.id_rol === selectedRole.id_rol
          ? {
              ...role,
              nombre_rol: formData.nombre_rol.trim(),
              descripcion: formData.descripcion.trim(),
              permisos: formData.permisos || role.permisos
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

  const handleExport = () => {
    exportToStyledExcel({
      title: "MATRIZ OFICIAL DE ROLES Y PERMISOS",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `roles_seguridad_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_rol", width: 10, type: "number" },
        { header: "Nombre del Rol", key: "nombre_rol", width: 22 },
        { header: "Descripción", key: "descripcion", width: 35 },
        { header: "Módulos Asignados", key: "permisos_str", width: 35 },
        { header: "Estado", key: "estado_nombre", width: 14 }
      ],
      data: filteredRoles.map((r) => ({
        ...r,
        descripcion: r.descripcion || "Sin descripción",
        permisos_str: (r.permisos || []).join(", ") || "Todos los permisos",
        estado_nombre: r.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setShowCreateModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      nombre_rol: role.nombre_rol,
      descripcion: role.descripcion || "",
      estado: role.estado,
      permisos: role.permisos || []
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

  const openDeactivateModal = (role) => {
    setSelectedRole(role);
    setShowDeactivateModal(true);
  };

  return {
    roles,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedRole,
    setSelectedRole,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    toggleStatus,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal
  };
}
