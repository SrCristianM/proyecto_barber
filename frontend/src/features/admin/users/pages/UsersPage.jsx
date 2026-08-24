import { Plus, Search, Download } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import UsersTable from "../components/UsersTable";
import UserFormModal from "../components/UserFormModal";
import UserDetailModal from "../components/UserDetailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

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
  } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

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
          onToggleStatus={toggleStatus}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <UserFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <UserFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
        />
      )}

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

      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          userName={`${selectedUser.nombre} ${selectedUser.apellido}`}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
