import { Plus, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useRoles } from "../hooks/useRoles";
import { useSearchHighlight } from "../../shared/hooks/useSearchHighlight";
import RolesTable from "../components/RolesTable";
import RolesStats from "../components/RolesStats";
import RoleFormModal from "../components/RoleFormModal";
import RoleDetailModal from "../components/RoleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";

export default function RolesPage() {
  useSearchHighlight();
  const {
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
  } = useRoles();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Rol creado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Rol actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Rol eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedRole) return;
    const newState = selectedRole.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedRole.id_rol);
    toast.success(`Rol ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los roles, accesos y permisos del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </motion.button>
      </div>

      {/* Stats Cards */}
      <RolesStats roles={roles} />

      {/* Filtros y tabla */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Toolbar Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar roles..."
              maxWidthClass="w-full sm:w-64"
            />

            {/* StatusFilterPills */}
            <StatusFilterPills
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { key: "all", label: "Todos" },
                { key: "1", label: "Activos" },
                { key: "0", label: "Inactivos" }
              ]}
            />

            {/* Limpiar Filtros */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-secondary cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>

        <RolesTable
          roles={filteredRoles}
          totalCount={roles.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onToggleStatus={openDeactivateModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <RoleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {/* Modal Editar */}
      {showEditModal && selectedRole && (
        <RoleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => { setShowEditModal(false); setSelectedRole(null); resetForm(); }}
        />
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          onEdit={() => { setShowDetailModal(false); openEditModal(selectedRole); }}
          onClose={() => { setShowDetailModal(false); setSelectedRole(null); }}
        />
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedRole && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este rol?"
          description={`Se eliminará el rol "${selectedRole.nombre_rol}" de forma permanente. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedRole(null); }}
        />
      )}

      {/* Modal Confirmar Desactivar/Activar */}
      {showDeactivateModal && selectedRole && (
        <ConfirmModal
          variant="deactivate"
          title={selectedRole.estado === 1 ? "¿Desactivar este rol?" : "¿Activar este rol?"}
          description={`Esta acción cambiará el estado del rol "${selectedRole.nombre_rol}".`}
          confirmLabel={selectedRole.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedRole(null); }}
        />
      )}
    </div>
  );
}
