import { useState } from "react";
import { Plus, Download, RotateCcw, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSchedules, barbers, daysOfWeek } from "../hooks/useSchedules";
import SchedulesTable from "../components/SchedulesTable";
import SchedulesStats from "../components/SchedulesStats";
import ScheduleFormModal from "../components/ScheduleFormModal";
import ScheduleDetailModal from "../components/ScheduleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ScheduleNoveltiesView from "../components/ScheduleNoveltiesView";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";

const TABS = [
  { key: "schedules", label: "Horarios" },
  { key: "novelties", label: "Novedades de Horario" }
];

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = useState("schedules");

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    barberFilter,
    setBarberFilter,
    dayFilter,
    setDayFilter,
    hasActiveFilters,
    resetFilters,
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

  const barberOptions = barbers.map((b) => ({
    value: b.id_barbero,
    label: b.nombre
  }));

  const dayOptions = daysOfWeek.map((d) => ({
    value: d,
    label: d
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Horarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los turnos, horarios y novedades de disponibilidad</p>
        </div>
        {activeTab === "schedules" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Horario
          </motion.button>
        )}
      </div>

      {/* Tabs con animación de deslizamiento suave */}
      <div className="flex items-center gap-1 bg-secondary/70 p-1.5 rounded-xl w-fit border border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="schedulesTabPill"
                  className="absolute inset-0 bg-card rounded-lg border border-border shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Horarios */}
      {activeTab === "schedules" && (
        <>
          <SchedulesStats schedules={filteredSchedules} />

          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            {/* Toolbar Estandarizada */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* SearchBar */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar horarios..."
                  maxWidthClass="w-full sm:w-60"
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

                {/* FilterSelect FK: Barbero */}
                <FilterSelect
                  value={barberFilter}
                  onChange={setBarberFilter}
                  options={barberOptions}
                  placeholder="Todos los barberos"
                  icon={<User className="h-3.5 w-3.5" />}
                  className="min-w-[170px]"
                />

                {/* FilterSelect: Día de semana */}
                <FilterSelect
                  value={dayFilter}
                  onChange={setDayFilter}
                  options={dayOptions}
                  placeholder="Todos los días"
                  icon={<Calendar className="h-3.5 w-3.5" />}
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
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <ScheduleNoveltiesView />
        </div>
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
