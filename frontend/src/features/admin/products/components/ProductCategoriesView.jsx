import { Plus, Edit, Power, Tag } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import { useProductCategories } from "../hooks/useProductCategories";

export default function ProductCategoriesView() {
  const {
    filteredCategories,
    categories,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeactivateModal,
    setShowDeactivateModal,
    selectedCategory,
    setSelectedCategory,
    resetForm,
    handleCreate,
    handleEdit,
    toggleStatus,
    openEditModal,
    openDeactivateModal
  } = useProductCategories();

  const onHandleCreate = () => { handleCreate(); toast.success("Categoría creada correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Categoría actualizada correctamente"); };
  const onToggleStatus = () => {
    const newState = selectedCategory?.estado === 1 ? "desactivada" : "activada";
    toggleStatus(selectedCategory?.id_categoria_producto);
    toast.success(`Categoría ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedCategory(null);
  };

  const CategoryForm = ({ onSubmit, onCancel }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          placeholder="Ej: Estilizado"
          required
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium">
          Cancelar
        </button>
      </div>
    </form>
  );

  const activeCount = categories.filter((c) => c.estado === 1).length;
  const inactiveCount = categories.filter((c) => c.estado === 0).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: categories.length, cls: "text-foreground" },
          { label: "Activas", value: activeCount, cls: "text-success" },
          { label: "Inactivas", value: inactiveCount, cls: "text-muted-foreground" }
        ].map(({ label, value, cls }) => (
          <div key={label} className="text-center p-3 bg-muted/30 rounded-xl border border-border">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar categorías..."
            maxWidthClass="w-full sm:w-56"
          />
          <StatusFilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { key: "all", label: "Todas" },
              { key: "active", label: "Activas" },
              { key: "inactive", label: "Inactivas" }
            ]}
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de cards */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No se encontraron categorías
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id_categoria_producto}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  cat.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {cat.estado === 1 ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{cat.nombre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">ID #{cat.id_categoria_producto}</p>
              </div>
              <div className="flex gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => openDeactivateModal(cat)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                    cat.estado === 1 ? "text-warning hover:bg-warning/10" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {cat.estado === 1 ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {showCreateModal && (
        <Modal title="Nueva Categoría de Producto" onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidthClass="max-w-sm">
          <CategoryForm onSubmit={onHandleCreate} onCancel={() => { setShowCreateModal(false); resetForm(); }} />
        </Modal>
      )}

      {showEditModal && selectedCategory && (
        <Modal title="Editar Categoría" onClose={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} maxWidthClass="max-w-sm">
          <CategoryForm onSubmit={onHandleEdit} onCancel={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} />
        </Modal>
      )}

      {showDeactivateModal && selectedCategory && (
        <ConfirmModal
          variant="deactivate"
          title={selectedCategory.estado === 1 ? "¿Desactivar categoría?" : "¿Activar categoría?"}
          description={`Esta acción cambiará el estado de "${selectedCategory.nombre}".`}
          confirmLabel={selectedCategory.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedCategory(null); }}
        />
      )}
    </div>
  );
}
