import { useState } from "react";
import { Plus, Download, RotateCcw, User } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { useSales, clients } from "../hooks/useSales";
import SalesStats from "../components/SalesStats";
import SalesTable from "../components/SalesTable";
import SaleFormModal from "../components/SaleFormModal";
import SaleDetailModal from "../components/SaleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";
import DateRangeFilter from "../../shared/components/DateRangeFilter";

export default function SalesPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredSales,
    totalToday,
    totalMonth,
    averageTicket,
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
    selectedSale,
    setSelectedSale,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    toggleCatalogItem,
    addItemToSale,
    updateItemQuantity,
    removeItemFromSale,
    toggleStatus,
    getClientName
  } = useSales();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const triggerGoldenConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#C9A24A", "#E5C875", "#FFFFFF", "#1E1E1E"]
      });
    } catch {
      // Ignorar si falla canvas
    }
  };

  const onHandleCreate = () => {
    handleCreate();
    triggerGoldenConfetti();
    toast.success("Venta registrada correctamente");
  };
  const onHandleEdit = () => { handleEdit(); toast.success("Venta actualizada correctamente"); };
  const onHandleDelete = () => { handleDelete(); toast.success("Venta eliminada correctamente"); };
  const onAnularVenta = () => {
    toggleStatus(deactivateTarget?.id_venta);
    toast.success(`Venta #${deactivateTarget?.id_venta} anulada correctamente`);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const openDeactivateModal = (sale) => {
    setDeactivateTarget(sale);
    setShowDeactivateModal(true);
  };

  const clientOptions = clients.map((c) => ({
    value: c.id_cliente,
    label: c.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona las ventas y facturación de la barbería</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Venta
        </motion.button>
      </div>

      <SalesStats totalToday={totalToday} totalMonth={totalMonth} averageTicket={averageTicket} />

      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        {/* Barra de Filtros Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar ventas..."
              maxWidthClass="w-full sm:w-60"
            />

            {/* StatusFilterPills */}
            <StatusFilterPills
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { key: "all", label: "Todas" },
                { key: "Activa", label: "Activas" },
                { key: "Anulada", label: "Anuladas" }
              ]}
            />

            {/* FilterSelect FK: Cliente */}
            <FilterSelect
              value={clientFilter}
              onChange={setClientFilter}
              options={clientOptions}
              placeholder="Todos los clientes"
              icon={<User className="h-3.5 w-3.5" />}
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

        <SalesTable
          sales={filteredSales}
          totalCount={filteredSales.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onDeactivate={openDeactivateModal}
        />
      </div>

      {showCreateModal && (
        <SaleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onAddItem={addItemToSale}
          onUpdateItemQuantity={updateItemQuantity}
          onRemoveItem={removeItemFromSale}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedSale && (
        <SaleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onAddItem={addItemToSale}
          onUpdateItemQuantity={updateItemQuantity}
          onRemoveItem={removeItemFromSale}
          onSubmit={onHandleEdit}
          onClose={() => { setShowEditModal(false); setSelectedSale(null); resetForm(); }}
        />
      )}

      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onEdit={() => { setShowDetailModal(false); openEditModal(selectedSale); }}
          onClose={() => { setShowDetailModal(false); setSelectedSale(null); }}
        />
      )}

      {showDeleteModal && selectedSale && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar esta venta?"
          description={`Se eliminará la venta #${selectedSale.id_venta} de ${getClientName(selectedSale.id_cliente)} por $${Number(selectedSale.total).toLocaleString()} de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedSale(null); }}
        />
      )}

      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          variant="deactivate"
          title="¿Anular esta venta?"
          description={`La venta #${deactivateTarget.id_venta} de ${getClientName(deactivateTarget.id_cliente)} por $${Number(deactivateTarget.total).toLocaleString()} será marcada como Anulada.`}
          confirmLabel="Anular Venta"
          onConfirm={onAnularVenta}
          onClose={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}
    </div>
  );
}
