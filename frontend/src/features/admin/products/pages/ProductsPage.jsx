import { useState } from "react";
import { Plus, Search, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "../hooks/useProducts";
import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailModal from "../components/ProductDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ProductCategoriesView from "../components/ProductCategoriesView";

const TABS = [
  { key: "products", label: "Productos" },
  { key: "categories", label: "Categorías" }
];

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

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("products");

  const onHandleCreate = () => { handleCreate(); toast.success("Producto creado correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Producto actualizado correctamente"); };
  const onHandleDelete = () => { handleDelete(); toast.success("Producto eliminado correctamente"); };
  const onToggleStatus = () => {
    const newState = deactivateTarget?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(deactivateTarget?.id_producto);
    toast.success(`Producto ${newState} correctamente`);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const openDeactivateModal = (product) => {
    setDeactivateTarget(product);
    setShowDeactivateModal(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona tu inventario de productos y categorías</p>
        </div>
        {activeTab === "products" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vista condicional por tab */}
      {activeTab === "products" && (
        <>
          {lowStockCount > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-warning">Alerta de Stock</p>
                <p className="text-xs text-warning/80 mt-0.5">
                  {lowStockCount} producto{lowStockCount > 1 ? "s" : ""} con stock bajo o agotado
                </p>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
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

            <ProductsTable
              products={paginatedProducts}
              totalCount={filteredProducts.length}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onDetail={openDetailModal}
              onToggleStatus={openDeactivateModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <ProductCategoriesView />
        </div>
      )}

      {showCreateModal && (
        <ProductFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => { setShowEditModal(false); setSelectedProduct(null); resetForm(); }}
        />
      )}

      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onEdit={() => { setShowDetailModal(false); openEditModal(selectedProduct); }}
          onClose={() => { setShowDetailModal(false); setSelectedProduct(null); }}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este producto?"
          description={`Se eliminará "${selectedProduct.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedProduct(null); }}
        />
      )}

      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          variant="deactivate"
          title={deactivateTarget.estado === 1 ? "¿Desactivar producto?" : "¿Activar producto?"}
          description={`Esta acción cambiará el estado de "${deactivateTarget.nombre}".`}
          confirmLabel={deactivateTarget.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}
    </div>
  );
}
