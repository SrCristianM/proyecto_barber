import { Plus, Search, Download } from "lucide-react";
import { useBarbers } from "../hooks/useBarbers";
import BarbersTable from "../components/BarbersTable";
import BarberFormModal from "../components/BarberFormModal";
import BarberDetailModal from "../components/BarberDetailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function BarbersPage() {
  const {
    barbers,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    handleSort,
    filteredBarbers,
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
    selectedBarber,
    setSelectedBarber,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal
  } = useBarbers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Barberos</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de barberos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Barbero
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar barberos..."
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

        <BarbersTable
          barbers={filteredBarbers}
          totalCount={barbers.length}
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
        <BarberFormModal
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

      {showEditModal && selectedBarber && (
        <BarberFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBarber(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedBarber && (
        <BarberDetailModal
          barber={selectedBarber}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedBarber);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBarber(null);
          }}
        />
      )}

      {showDeleteModal && selectedBarber && (
        <DeleteConfirmModal
          barberName={selectedBarber.name}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBarber(null);
          }}
        />
      )}
    </div>
  );
}
