import { Plus, Download, RotateCcw, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useUsers, availableRoles } from "../hooks/useUsers";
import UsersStats from "../components/UsersStats";
import UsersTable from "../components/UsersTable";
import UserFormModal from "../components/UserFormModal";
import UserDetailModal from "../components/UserDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";

export default function UsersPage() {
  const {
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
    openDeactivateModal
  } = useUsers();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Usuario creado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Usuario actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Usuario eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedUser) return;
    const newState = selectedUser.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedUser.id_usuario);
    toast.success(`Usuario ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedUser(null);
  };

  const roleOptions = availableRoles.map((r) => ({
    value: r.id_rol,
    label: r.nombre_rol
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los usuarios y accesos del sistema</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </motion.button>
      </div>

      <UsersStats users={users} />

      {/* Contenedor Principal */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Barra de Búsqueda */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar usuarios..."
              maxWidthClass="w-full sm:w-64"
            />

            {/* Pills de Estado Separados */}
            <StatusFilterPills
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { key: "all", label: "Todos" },
                { key: "1", label: "Activos" },
                { key: "0", label: "Inactivos" }
              ]}
            />

            {/* Filtro por Llave Foránea: Rol */}
            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={roleOptions}
              placeholder="Todos los roles"
              icon={<Shield className="h-3.5 w-3.5" />}
              className="min-w-[150px]"
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

          {/* Botón Exportar */}
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

        {/* Tabla */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">No se encontraron usuarios con los filtros aplicados.</p>
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            totalCount={users.length}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onDetail={openDetailModal}
            onToggleStatus={openDeactivateModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <UserFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {/* Modal Editar */}
      {showEditModal && selectedUser && (
        <UserFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
        />
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedUser);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedUser && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este usuario?"
          description={`Se eliminará el usuario "${selectedUser.nombre} ${selectedUser.apellido}" de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Modal Confirmar Desactivar / Activar */}
      {showDeactivateModal && selectedUser && (
        <ConfirmModal
          variant="deactivate"
          title={selectedUser.estado === 1 ? "¿Desactivar este usuario?" : "¿Activar este usuario?"}
          description={`Esta acción cambiará el estado de la cuenta de "${selectedUser.nombre} ${selectedUser.apellido}".`}
          confirmLabel={selectedUser.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
