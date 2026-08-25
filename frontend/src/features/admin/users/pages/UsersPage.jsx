import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "../hooks/useUsers";
import UsersStats from "../components/UsersStats";
import UsersTable from "../components/UsersTable";
import UserFormModal from "../components/UserFormModal";
import UserDetailModal from "../components/UserDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";

export default function UsersPage() {
  const {
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedUser,
    setSelectedUser,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      <UsersStats users={users} />

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
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
