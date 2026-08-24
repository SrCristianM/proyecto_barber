import { Plus, Search, Download } from "lucide-react";
import { useSales } from "../hooks/useSales";
import SalesStats from "../components/SalesStats";
import SalesTable from "../components/SalesTable";
import SaleFormModal from "../components/SaleFormModal";
import SaleDetailModal from "../components/SaleDetailModal";
import DeleteSaleModal from "../components/DeleteSaleModal";

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
    getClientName
  } = useSales();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Gestiona las ventas y facturación</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nueva Venta
        </button>
      </div>

      <SalesStats totalToday={totalToday} totalMonth={totalMonth} averageTicket={averageTicket} />

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <Download className="h-5 w-5" />
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
        />
      </div>

      {showCreateModal && (
        <SaleFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onToggleItem={toggleCatalogItem}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedSale && (
        <SaleFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onToggleItem={toggleCatalogItem}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSale(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedSale);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSale(null);
          }}
        />
      )}

      {showDeleteModal && selectedSale && (
        <DeleteSaleModal
          clientName={getClientName(selectedSale.id_cliente)}
          total={selectedSale.total}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
}
