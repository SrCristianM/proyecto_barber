import { Plus, Search, Download, AlertCircle } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailModal from "../components/ProductDetailModal";
import DeleteProductModal from "../components/DeleteProductModal";

export default function ProductsPage() {
  const {
    products,
    searchTerm,
    onSearchChange,
    sortField,
    sortDir,
    handleSort,
    paginatedProducts,
    filteredProducts,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    lowStockCount,
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
    selectedProduct,
    setSelectedProduct,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal
  } = useProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Alerta de Stock</p>
            <p className="text-sm text-warning/90">Tienes {lowStockCount} productos con stock bajo o agotado</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
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

        <ProductsTable
          products={paginatedProducts}
          totalCount={filteredProducts.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onToggleStatus={toggleStatus}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <ProductFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedProduct);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <DeleteProductModal
          productName={selectedProduct.nombre}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
