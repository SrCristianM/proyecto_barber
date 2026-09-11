import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ROLES } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from "../services/rolesService";

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

  useEffect(() => {
    getRoles()
      .then((data) => {
        if (Array.isArray(data)) {
          setRoles(
            data.map((r) => ({
              ...r,
              permisos: r.permisos || [],
              alcancePorPermiso: r.alcancePorPermiso || {}
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("[Roles] Usando roles locales por fallback:", err.message);
      });
  }, []);

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

  const handleCreate = async () => {
    const payload = {
      nombre_rol: formData.nombre_rol.trim(),
      descripcion: formData.descripcion.trim(),
      estado: 1,
      permisos: formData.permisos || []
    };

    try {
      const res = await createRole(payload);
      const newRole = {
        ...payload,
        id_rol: res?.id_rol || Math.max(...roles.map((r) => r.id_rol), 0) + 1,
        fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19),
        alcancePorPermiso: {}
      };
      setRoles((prev) => [newRole, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success("Rol creado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al crear el rol.");
    }
  };

  const handleEdit = async () => {
    if (!selectedRole) return;
    const payload = {
      nombre_rol: formData.nombre_rol.trim(),
      descripcion: formData.descripcion.trim(),
      permisos: formData.permisos || selectedRole.permisos
    };

    try {
      await updateRole(selectedRole.id_rol, payload);
      setRoles((prev) =>
        prev.map((role) =>
          role.id_rol === selectedRole.id_rol
            ? { ...role, ...payload }
            : role
        )
      );
      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
      toast.success("Rol actualizado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el rol.");
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id_rol);
      setRoles((prev) => prev.filter((role) => role.id_rol !== selectedRole.id_rol));
      setShowDeleteModal(false);
      setSelectedRole(null);
      toast.success("Rol eliminado.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el rol.");
    }
  };

  const toggleStatus = async (roleId) => {
    const target = roles.find((r) => r.id_rol === roleId);
    if (!target) return;
    const nextEstado = target.estado === 1 ? 0 : 1;

    try {
      await updateRole(roleId, { estado: nextEstado });
      setRoles((prev) =>
        prev.map((role) =>
          role.id_rol === roleId ? { ...role, estado: nextEstado } : role
        )
      );
      toast.success("Estado del rol actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar estado del rol.");
    }
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
