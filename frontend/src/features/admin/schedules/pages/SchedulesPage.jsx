import { Plus, Search, Download } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import SchedulesTable from "../components/SchedulesTable";
import ScheduleFormModal from "../components/ScheduleFormModal";
import ScheduleDetailModal from "../components/ScheduleDetailModal";
import DeleteScheduleModal from "../components/DeleteScheduleModal";

export default function SchedulesPage() {
  const {
    searchTerm,
    onSearchChange,
    sortField,
    sortDir,
    handleSort,
    paginatedSchedules,
    filteredSchedules,
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
    selectedSchedule,
    setSelectedSchedule,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    getBarberName
  } = useSchedules();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Horarios</h1>
          <p className="text-muted-foreground">Gestiona los horarios de disponibilidad</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Horario
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar horarios..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <Download className="h-5 w-5" />
            Exportar
          </button>
        </div>

        <SchedulesTable
          schedules={paginatedSchedules}
          totalCount={filteredSchedules.length}
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
        <ScheduleFormModal
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

      {showEditModal && selectedSchedule && (
        <ScheduleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedSchedule);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSchedule(null);
          }}
        />
      )}

      {showDeleteModal && selectedSchedule && (
        <DeleteScheduleModal
          barberName={getBarberName(selectedSchedule.id_barbero)}
          day={selectedSchedule.dia_semana}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
}
