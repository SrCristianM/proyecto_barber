import { useState } from "react";
import { Plus, Download, AlertCircle, RotateCcw, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useProducts, categories } from "../hooks/useProducts";
import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailModal from "../components/ProductDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ProductCategoriesView from "../components/ProductCategoriesView";
import ProductsStats from "../components/ProductsStats";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";

const TABS = [
  { key: "products", label: "Productos" },
  { key: "categories", label: "Categorías" }
];

export default function ProductsPage() {
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

  const categoryOptions = categories.map((cat) => ({
    value: cat.id_categoria_producto,
    label: cat.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona tu inventario de productos y categorías</p>
        </div>
        {activeTab === "products" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-xs border border-border"
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
          <ProductsStats products={products} />

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

          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            {/* Toolbar Estandarizada */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
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

            <ProductsTable
              products={filteredProducts}
              totalCount={products.length}
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
