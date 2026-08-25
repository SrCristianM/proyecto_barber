import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { useSchedules } from "../hooks/useSchedules";
import SchedulesTable from "../components/SchedulesTable";
import SchedulesStats from "../components/SchedulesStats";
import ScheduleFormModal from "../components/ScheduleFormModal";
import ScheduleDetailModal from "../components/ScheduleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ScheduleNoveltiesView from "../components/ScheduleNoveltiesView";

const TABS = [
  { key: "schedules", label: "Horarios" },
  { key: "novelties", label: "Novedades de Horario" }
];

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = useState("schedules");

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
    showDeactivateModal,
    setShowDeactivateModal,
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
    openDeactivateModal,
    getBarberName
  } = useSchedules();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Horario creado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Horario actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Horario eliminado correctamente");
  };

  const onToggleStatus = () => {
    const newState = selectedSchedule?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedSchedule?.id_horario);
    toast.success(`Horario ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedSchedule(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los turnos, horarios y novedades de disponibilidad</p>
        </div>
        {activeTab === "schedules" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nuevo Horario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Horarios */}
      {activeTab === "schedules" && (
        <>
          <SchedulesStats schedules={filteredSchedules} />

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar horarios..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                />
              </div>
              <button
                onClick={handleExport}
                className="ml-auto flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm"
              >
                <Download className="h-4 w-4" />
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
              onToggleStatus={openDeactivateModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              getBarberName={getBarberName}
            />
          </div>
        </>
      )}

      {/* Tab Novedades de Horario */}
      {activeTab === "novelties" && (
        <ScheduleNoveltiesView />
      )}

      {showCreateModal && (
        <ScheduleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedSchedule && (
        <ScheduleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => { setShowEditModal(false); setSelectedSchedule(null); resetForm(); }}
        />
      )}

      {showDetailModal && selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onEdit={() => { setShowDetailModal(false); openEditModal(selectedSchedule); }}
          onClose={() => { setShowDetailModal(false); setSelectedSchedule(null); }}
        />
      )}

      {showDeleteModal && selectedSchedule && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este horario?"
          description={`Se eliminará el horario de ${getBarberName(selectedSchedule.id_barbero)} — ${(selectedSchedule.dias_semana || []).join(", ")}.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedSchedule(null); }}
        />
      )}

      {showDeactivateModal && selectedSchedule && (
        <ConfirmModal
          variant="deactivate"
          title={selectedSchedule.estado === 1 ? "¿Desactivar este horario?" : "¿Activar este horario?"}
          description="Esta acción cambiará el estado del horario seleccionado."
          confirmLabel={selectedSchedule.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedSchedule(null); }}
        />
      )}
    </div>
  );
}
