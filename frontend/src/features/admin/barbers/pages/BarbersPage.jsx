import { useState } from "react";
import { Plus, Download, RotateCcw, LayoutGrid, Table } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useBarbers } from "../hooks/useBarbers";
import { useSearchHighlight } from "../../shared/hooks/useSearchHighlight";
import BarbersStats from "../components/BarbersStats";
import BarbersTable from "../components/BarbersTable";
import BarberCard from "../components/BarberCard";
import BarberFormModal from "../components/BarberFormModal";
import BarberDetailModal from "../components/BarberDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";

export default function BarbersPage() {
  useSearchHighlight();
  const [viewMode, setViewMode] = useState("table");
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

          {/* Botón Exportar y Selector de Vista */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "table"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                title="Vista de Tabla"
              >
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                title="Vista de Tarjetas 3D"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Tarjetas 3D</span>
              </button>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-xs font-medium cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>

        {viewMode === "table" ? (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBarbers.map((barber) => (
              <BarberCard
                key={barber.id_barbero}
                barber={barber}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}
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
