import { useState } from "react";
import { Plus, Download, AlertCircle, RotateCcw, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useProducts, categories } from "../hooks/useProducts";
import { useSearchHighlight } from "../../shared/hooks/useSearchHighlight";
import ProductsTable from "../components/ProductsTable";
import ProductCard from "../components/ProductCard";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailModal from "../components/ProductDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ProductCategoriesView from "../components/ProductCategoriesView";
import ProductsStats from "../components/ProductsStats";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";
import ViewModeToggle from "../../shared/components/ViewModeToggle";
import { usePermissions } from "../../../auth/hooks/usePermissions";

const TABS = [
  { key: "categories", label: "Categorías" },
  { key: "products", label: "Productos" }
];

export default function ProductsPage() {
  useSearchHighlight();
  const { hasPermission } = usePermissions();
  const canCreateProduct = hasPermission("productos", "crear");
  const canEditProduct = hasPermission("productos", "editar");
  const canDeleteProduct = hasPermission("productos", "eliminar");
  const canToggleProduct = hasPermission("productos", "activar");

  const [viewMode, setViewMode] = useState("table");
  const {
    products,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
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
    openDeleteModal,
    categories: productCategories
  } = useProducts();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  const onHandleCreate = () => { handleCreate(); };
  const onHandleEdit = () => { handleEdit(); };
  const onHandleDelete = () => { handleDelete(); };
  const onToggleStatus = () => {
    toggleStatus(deactivateTarget?.id_producto);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const openDeactivateModal = (product) => {
    setDeactivateTarget(product);
    setShowDeactivateModal(true);
  };

  const activeCategoriesList = (productCategories && productCategories.length > 0) ? productCategories : categories;

  const categoryOptions = activeCategoriesList.map((cat) => ({
    value: cat.id_categoria_producto,
    label: cat.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona las categorías y el catálogo de productos</p>
        </div>
        {activeTab === "products" && canCreateProduct && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {products.length === 0 ? "Crear primer producto" : "Nuevo Producto"}
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-secondary/70 p-1.5 rounded-xl w-fit border border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="productsTabPill"
                  className="absolute inset-0 bg-card rounded-lg border border-border shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Vista Categorías */}
      {activeTab === "categories" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <ProductCategoriesView />
        </div>
      )}

      {/* Vista Productos */}
      {activeTab === "products" && (
        <>
          <ProductsStats products={products} />

          {lowStockCount > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-warning">Alerta de stock:</span>
                <span className="text-foreground ml-1">
                  Hay {lowStockCount} producto{lowStockCount > 1 ? "s" : ""} con stock crítico (menos de 5 unidades).
                </span>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-3 sm:p-5 shadow-xs">
            {/* Toolbar Estandarizada */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-6">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* SearchBar */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar productos..."
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

                {/* FilterSelect FK: Categoría */}
                <FilterSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={categoryOptions}
                  placeholder="Todas las categorías"
                  icon={<Tag className="h-3.5 w-3.5" />}
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

              {/* Botón Exportar y Selector de Vista Universal */}
              <div className="flex items-center gap-2">
                <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />

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
              <ProductsTable
                products={filteredProducts}
                totalCount={products.length}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onDetail={openDetailModal}
                onToggleStatus={canToggleProduct ? openDeactivateModal : null}
                onEdit={canEditProduct ? openEditModal : null}
                onDelete={canDeleteProduct ? openDeleteModal : null}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id_producto}
                    product={product}
                    onDetail={openDetailModal}
                    onToggleStatus={canToggleProduct ? openDeactivateModal : null}
                    onEdit={canEditProduct ? openEditModal : null}
                    onDelete={canDeleteProduct ? openDeleteModal : null}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <ProductFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          categories={activeCategoriesList}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          categories={activeCategoriesList}
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
