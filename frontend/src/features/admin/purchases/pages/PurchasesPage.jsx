import { Plus, Download, LayoutGrid, List, RotateCcw, Building2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { usePurchases, availableSuppliers } from "../hooks/usePurchases";
import PurchasesStats from "../components/PurchasesStats";
import PurchaseCard from "../components/PurchaseCard";
import PurchasesTable from "../components/PurchasesTable";
import PurchaseFormModal from "../components/PurchaseFormModal";
import PurchaseDetailModal from "../components/PurchaseDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";
import DateRangeFilter from "../../shared/components/DateRangeFilter";

export default function PurchasesPage() {
  const {
    purchases,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasActiveFilters,
    resetFilters,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    handleSort,
    filteredPurchases,
    totalToday,
    totalMonth,
    averagePurchase,
    countRegistradas,
    countAnuladas,
    formData,
    setFormData,
    addProductRow,
    updateProductRow,
    removeProductRow,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    showCancelModal,
    setShowCancelModal,
    selectedPurchase,
    setSelectedPurchase,
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
    openCancelModal,
    getSupplierName,
    getSupplierNit,
    getUserName
  } = usePurchases();

  const triggerGoldenConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#DAA520", "#E5C875", "#FFFFFF", "#1E1E1E"]
      });
    } catch {
      // Ignorar si falla canvas
    }
  };

  const onHandleCreate = () => {
    handleCreate();
    triggerGoldenConfetti();
    toast.success("Compra registrada correctamente y agregada al inventario");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Compra actualizada correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Compra eliminada correctamente");
  };

  const onAnularCompra = () => {
    if (!selectedPurchase) return;
    toggleStatus(selectedPurchase.id_compra);
    toast.success(`Compra #${selectedPurchase.id_compra} anulada correctamente`);
    setShowCancelModal(false);
    setSelectedPurchase(null);
  };

  const supplierOptions = availableSuppliers.map((s) => ({
    value: s.id_proveedor,
    label: s.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Compras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona las compras y abastecimiento de productos
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Compra
        </motion.button>
      </div>

      {/* Tarjetas de estadísticas */}
      <PurchasesStats
        totalToday={totalToday}
        totalMonth={totalMonth}
        averagePurchase={averagePurchase}
        countRegistradas={countRegistradas}
        countAnuladas={countAnuladas}
      />

      {/* Contenedor Principal */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar compras..."
              maxWidthClass="w-full sm:w-60"
            />

            {/* StatusFilterPills */}
            <StatusFilterPills
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { key: "all", label: "Todas" },
                { key: "Registrada", label: "Registradas" },
                { key: "Anulada", label: "Anuladas" }
              ]}
            />

            {/* FilterSelect FK: Proveedor */}
            <FilterSelect
              value={supplierFilter}
              onChange={setSupplierFilter}
              options={supplierOptions}
              placeholder="Todos los proveedores"
              icon={<Building2 className="h-3.5 w-3.5" />}
              className="min-w-[170px]"
            />

            {/* DateRangeFilter */}
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onClear={() => { setStartDate(""); setEndDate(""); }}
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
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              No se encontraron órdenes de compra con los filtros aplicados.
            </p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id_compra}
                purchase={purchase}
                getSupplierName={getSupplierName}
                getSupplierNit={getSupplierNit}
                getUserName={getUserName}
                onDetail={openDetailModal}
                onEdit={openEditModal}
                onCancel={openCancelModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        ) : (
          <PurchasesTable
            purchases={filteredPurchases}
            totalCount={purchases.length}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            getSupplierName={getSupplierName}
            getUserName={getUserName}
            onDetail={openDetailModal}
            onEdit={openEditModal}
            onCancel={openCancelModal}
            onDelete={openDeleteModal}
          />
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <PurchaseFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          addProductRow={addProductRow}
          updateProductRow={updateProductRow}
          removeProductRow={removeProductRow}
          onSubmit={onHandleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedPurchase && (
        <PurchaseFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          addProductRow={addProductRow}
          updateProductRow={updateProductRow}
          removeProductRow={removeProductRow}
          onSubmit={onHandleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPurchase(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedPurchase);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPurchase(null);
          }}
        />
      )}

      {showDeleteModal && selectedPurchase && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar esta orden de compra?"
          description={`Se eliminará la compra #${selectedPurchase.id_compra} a ${getSupplierName(selectedPurchase.id_proveedor)} por $${Number(selectedPurchase.total).toLocaleString("es-CO")} de forma permanente.`}
          confirmLabel="Eliminar Compra"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPurchase(null);
          }}
        />
      )}

      {showCancelModal && selectedPurchase && (
        <ConfirmModal
          variant="deactivate"
          title="¿Anular esta orden de compra?"
          description={`La compra #${selectedPurchase.id_compra} a ${getSupplierName(selectedPurchase.id_proveedor)} por $${Number(selectedPurchase.total).toLocaleString("es-CO")} cambiará su estado a "Anulada".`}
          confirmLabel="Anular Compra"
          onConfirm={onAnularCompra}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedPurchase(null);
          }}
        />
      )}
    </div>
  );
}
