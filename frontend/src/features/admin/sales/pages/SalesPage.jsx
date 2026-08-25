import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { useSales } from "../hooks/useSales";
import SalesStats from "../components/SalesStats";
import SalesTable from "../components/SalesTable";
import SaleFormModal from "../components/SaleFormModal";
import SaleDetailModal from "../components/SaleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";

export default function SalesPage() {
  const {
    searchTerm,
    onSearchChange,
    sortField,
    sortDir,
    handleSort,
    paginatedSales,
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona las ventas y facturación</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva Venta
        </motion.button>
      </div>

      <SalesStats totalToday={totalToday} totalMonth={totalMonth} averageTicket={averageTicket} />

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar ventas..."
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

        <SalesTable
          sales={paginatedSales}
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
          onToggleItem={toggleCatalogItem}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedSale && (
        <SaleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onToggleItem={toggleCatalogItem}
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
