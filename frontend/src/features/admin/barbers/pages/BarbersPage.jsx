import { Plus, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useBarbers } from "../hooks/useBarbers";
import BarbersStats from "../components/BarbersStats";
import BarbersTable from "../components/BarbersTable";
import BarberFormModal from "../components/BarberFormModal";
import BarberDetailModal from "../components/BarberDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";

export default function BarbersPage() {
  const {
    barbers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedBarber,
    setSelectedBarber,
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
  } = useBarbers();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Barbero registrado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Barbero actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Barbero eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedBarber) return;
    const newState = selectedBarber.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedBarber.id_barbero);
    toast.success(`Barbero ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedBarber(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Barberos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona tu equipo de barberos y especialistas</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Barbero
        </motion.button>
      </div>

      <BarbersStats barbers={barbers} />

      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar barberos..."
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

        <BarbersTable
          barbers={filteredBarbers}
          totalCount={barbers.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onToggleStatus={openDeactivateModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <BarberFormModal
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

      {showEditModal && selectedBarber && (
        <BarberFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
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
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este barbero?"
          description={`Se eliminará el barbero "${selectedBarber.nombre} ${selectedBarber.apellido}" de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBarber(null);
          }}
        />
      )}

      {showDeactivateModal && selectedBarber && (
        <ConfirmModal
          variant="deactivate"
          title={selectedBarber.estado === 1 ? "¿Desactivar este barbero?" : "¿Activar este barbero?"}
          description={`Esta acción cambiará el estado del barbero "${selectedBarber.nombre} ${selectedBarber.apellido}".`}
          confirmLabel={selectedBarber.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedBarber(null);
          }}
        />
      )}
    </div>
  );
}
