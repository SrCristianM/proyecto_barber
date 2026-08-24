import { Plus, Search, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "../hooks/useRoles";
import RolesTable from "../components/RolesTable";
import RoleFormModal from "../components/RoleFormModal";
import RoleDetailModal from "../components/RoleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";

export default function RolesPage() {
  const {
    roles,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
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
    const newState = selectedRole?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedRole?.id_rol);
    toast.success(`Rol ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles y Permisos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los roles y permisos del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Búsqueda */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="ml-auto">
            <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm">
              <Download className="h-4 w-4" />
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
