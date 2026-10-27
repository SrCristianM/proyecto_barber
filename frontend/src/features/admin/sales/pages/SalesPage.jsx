import { useState } from "react";
import { Plus, Download, RotateCcw, User } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { usePermissions } from "../../../auth/hooks/usePermissions";
import { useSales, clients } from "../hooks/useSales";
import { useSearchHighlight } from "../../shared/hooks/useSearchHighlight";
import SalesStats from "../components/SalesStats";
import SalesTable from "../components/SalesTable";
import SaleCard from "../components/SaleCard";
import SaleFormModal from "../components/SaleFormModal";
import SaleDetailModal from "../components/SaleDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";
import DateRangeFilter from "../../shared/components/DateRangeFilter";
import ViewModeToggle from "../../shared/components/ViewModeToggle";
import StraightRazorFoamReveal from "../../../../shared/components/animations/StraightRazorFoamReveal";

export default function SalesPage() {
  useSearchHighlight();
  const {
    sales = [],
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
    viewMode,
    setViewMode,
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
    getClientName,
    clients: salesClients,
    users: salesUsers,
    catalogItems: salesCatalog
  } = useSales();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [revealSaleData, setRevealSaleData] = useState(null);

  const { hasPermission } = usePermissions();
  const canCreateSale = hasPermission("ventas", "crear");
  const canEditSale = hasPermission("ventas", "editar");
  const canAnularSale = hasPermission("ventas", "anular");

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
    const saleResult = handleCreate();
    setRevealSaleData({
      id_venta: saleResult?.id_venta || (sales.length + 1),
      total: formData?.total || 35000,
      metodo_pago: formData?.metodo_pago || "Efectivo",
      cliente_nombre: getClientName(formData?.id_cliente) || "Cliente General",
      barbero_nombre: "Caja Principal",
      fecha: new Date().toLocaleDateString("es-CO")
    });
    triggerGoldenConfetti();
  };
  const onHandleEdit = () => { handleEdit(); };
  const onHandleDelete = () => { handleDelete(); };
  const onAnularVenta = () => {
    toggleStatus(deactivateTarget?.id_venta);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const openDeactivateModal = (sale) => {
    setDeactivateTarget(sale);
    setShowDeactivateModal(true);
  };

  const activeClientsList = (salesClients && salesClients.length > 0) ? salesClients : clients;

  const clientOptions = activeClientsList.map((c) => ({
    value: c.id_cliente,
    label: c.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Control de facturación, caja y ventas del negocio</p>
        </div>
        {canCreateSale && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {sales.length === 0 ? "Registrar primera venta" : "Nueva Venta"}
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <SalesStats
        totalToday={totalToday}
        totalMonth={totalMonth}
        salesCount={sales.length}
        averageTicket={averageTicket}
      />

      {/* Filtros y tabla / tarjetas */}
      <div className="bg-card border border-border rounded-xl p-3.5 sm:p-5 shadow-xs">
        {/* Toolbar Estandarizada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* SearchBar */}
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por cliente, cobrado por, detalle..."
              maxWidthClass="w-full sm:w-64"
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

          {/* Botón Exportar y Selector de Vista Universal */}
          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode || "table"} onChange={setViewMode} />

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
            canEdit={canEditSale}
            canAnular={canAnularSale}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSales.map((sale) => (
              <SaleCard
                key={sale.id_venta}
                sale={sale}
                clientName={getClientName(sale.id_cliente, sale)}
                onDetail={openDetailModal}
                onEdit={openEditModal}
                onDeactivate={openDeactivateModal}
                canEdit={canEditSale}
                canAnular={canAnularSale}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <SaleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          clients={activeClientsList}
          users={salesUsers}
          catalogItems={salesCatalog}
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
          clients={activeClientsList}
          users={salesUsers}
          catalogItems={salesCatalog}
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
          onClose={() => { setShowDetailModal(false); setSelectedSale(null); }}
        />
      )}

      {showDeleteModal && selectedSale && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar esta venta?"
          description={`Se eliminará la venta #${selectedSale.id_venta} permanentemente. Esta acción es irreversible.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedSale(null); }}
        />
      )}

      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          variant="deactivate"
          title="¿Anular esta venta?"
          description={`La venta #${deactivateTarget.id_venta} cambiará a estado "Anulada". Los productos se reintegrarán al stock.`}
          confirmLabel="Anular Venta"
          onConfirm={onAnularVenta}
          onClose={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}

      {/* ANIMACIÓN DE NAVAJA BARBERA DESLIZANTE SOBRE ESPUMA */}
      <StraightRazorFoamReveal
        isOpen={!!revealSaleData}
        onClose={() => setRevealSaleData(null)}
        saleData={revealSaleData}
      />
    </div>
  );
}
