import { Plus, Download, LayoutGrid, List, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useSuppliers } from "../hooks/useSuppliers";
import SuppliersStats from "../components/SuppliersStats";
import SupplierCard from "../components/SupplierCard";
import SuppliersTable from "../components/SuppliersTable";
import SupplierFormModal from "../components/SupplierFormModal";
import SupplierDetailModal from "../components/SupplierDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";

export default function SuppliersPage() {
  const {
    suppliers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    handleSort,
    filteredSuppliers,
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
    selectedSupplier,
    setSelectedSupplier,
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
  } = useSuppliers();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Proveedor registrado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Proveedor actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Proveedor eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedSupplier) return;
    const newState = selectedSupplier.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedSupplier.id_proveedor);
    toast.success(`Proveedor ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los proveedores de tu negocio</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </motion.button>
      </div>

      {/* Tarjetas de estadísticas */}
      <SuppliersStats stats={stats} />

      {/* Contenedor Principal */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar proveedores..."
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

          {/* Opciones a la derecha: Toggle Vista y Exportar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "cards"
                    ? "bg-card text-primary shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Vista en Cards"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-card text-primary shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Vista en Tabla"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Visualización de Datos */}
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">No se encontraron proveedores que coincidan con la búsqueda o filtro.</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id_proveedor}
                supplier={supplier}
                onDetail={openDetailModal}
                onToggleStatus={openDeactivateModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        ) : (
          <SuppliersTable
            suppliers={filteredSuppliers}
            totalCount={suppliers.length}
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
        <SupplierFormModal
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
      {showEditModal && selectedSupplier && (
        <SupplierFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSupplier(null);
            resetForm();
          }}
        />
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedSupplier);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedSupplier && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este proveedor?"
          description={`Se eliminará el proveedor "${selectedSupplier.nombre}" de forma permanente. Ten en cuenta que si posee compras asociadas no podrá eliminarse.`}
          confirmLabel="Eliminar Proveedor"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {/* Modal Confirmar Desactivar / Activar */}
      {showDeactivateModal && selectedSupplier && (
        <ConfirmModal
          variant="deactivate"
          title={selectedSupplier.estado === 1 ? "¿Desactivar este proveedor?" : "¿Activar este proveedor?"}
          description={`El proveedor "${selectedSupplier.nombre}" ${
            selectedSupplier.estado === 1
              ? "dejará de estar disponible para nuevas órdenes de compra."
              : "volverá a estar disponible para el abastecimiento."
          }`}
          confirmLabel={selectedSupplier.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedSupplier(null);
          }}
        />
      )}
    </div>
  );
}
