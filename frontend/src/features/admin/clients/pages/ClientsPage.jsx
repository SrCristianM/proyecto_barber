import { useState } from "react";
import { Plus, Download, RotateCcw, Award, LayoutGrid, Table } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useClients, availableLoyalties } from "../hooks/useClients";
import { useSearchHighlight } from "../../shared/hooks/useSearchHighlight";
import ClientsStats from "../components/ClientsStats";
import ClientsTable from "../components/ClientsTable";
import ClientCard from "../components/ClientCard";
import ClientFormModal from "../components/ClientFormModal";
import ClientDetailModal from "../components/ClientDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";

export default function ClientsPage() {
  useSearchHighlight();
  const [viewMode, setViewMode] = useState("table");
  const {
    clients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loyaltyFilter,
    setLoyaltyFilter,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredClients,
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
    selectedClient,
    setSelectedClient,
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
    openDeactivateModal,
    stats
  } = useClients();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Cliente registrado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Cliente actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Cliente eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedClient) return;
    const newState = selectedClient.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedClient.id_cliente);
    toast.success(`Cliente ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedClient(null);
  };

  const loyaltyOptions = availableLoyalties.map((lvl) => ({
    value: lvl,
    label: lvl
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona tu base de clientes y su nivel de fidelización</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </motion.button>
      </div>

      <ClientsStats stats={stats} />

      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar clientes..."
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

            {/* FilterSelect: Nivel de Fidelidad */}
            <FilterSelect
              value={loyaltyFilter}
              onChange={setLoyaltyFilter}
              options={loyaltyOptions}
              placeholder="Todos los niveles"
              icon={<Award className="h-3.5 w-3.5" />}
              className="min-w-[170px]"
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
          <ClientsTable
            clients={filteredClients}
            totalCount={clients.length}
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
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id_cliente}
                client={client}
                onDetail={openDetailModal}
                onToggleStatus={openDeactivateModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <ClientFormModal
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
      {showEditModal && selectedClient && (
        <ClientFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
            resetForm();
          }}
        />
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedClient);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedClient && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este cliente?"
          description={`Se eliminará el cliente "${selectedClient.nombre} ${selectedClient.apellido}" de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Modal Confirmar Desactivar / Activar */}
      {showDeactivateModal && selectedClient && (
        <ConfirmModal
          variant="deactivate"
          title={selectedClient.estado === 1 ? "¿Desactivar este cliente?" : "¿Activar este cliente?"}
          description={`Esta acción cambiará el estado del cliente "${selectedClient.nombre} ${selectedClient.apellido}".`}
          confirmLabel={selectedClient.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
