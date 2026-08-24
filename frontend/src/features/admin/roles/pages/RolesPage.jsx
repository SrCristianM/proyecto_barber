import { Plus, Search, Download } from "lucide-react";
import { useRoles } from "../hooks/useRoles";
import RolesTable from "../components/RolesTable";
import RoleFormModal from "../components/RoleFormModal";
import RoleDetailModal from "../components/RoleDetailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function RolesPage() {
  const {
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
  } = useRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles y Permisos</h1>
          <p className="text-muted-foreground">Gestiona los roles y permisos del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Rol
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground">
            <Download className="h-5 w-5" />
            Exportar
          </button>
        </div>

        <RolesTable
          roles={filteredRoles}
          totalCount={roles.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onToggleStatus={toggleStatus}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <RoleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onToggleRolePermission={toggleFormRolePermission}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedRole && (
        <RoleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onToggleRolePermission={toggleFormRolePermission}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedRole);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRole(null);
          }}
        />
      )}

      {showDeleteModal && selectedRole && (
        <DeleteConfirmModal
          roleName={selectedRole.nombre_rol}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}
