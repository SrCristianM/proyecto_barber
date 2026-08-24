import { Plus, Search, Edit, Power, Tag } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import { useServiceCategories } from "../hooks/useServiceCategories";

export default function ServiceCategoriesView() {
  const {
    filteredCategories,
    searchTerm,
    setSearchTerm,
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
  } = useServiceCategories();

  const onHandleCreate = () => { handleCreate(); toast.success("Categoría creada correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Categoría actualizada correctamente"); };
  const onToggleStatus = () => {
    const newState = selectedCategory?.estado === 1 ? "desactivada" : "activada";
    toggleStatus(selectedCategory?.id_categoria_servicio);
    toast.success(`Categoría ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id_categoria_servicio}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  cat.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {cat.estado === 1 ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{cat.nombre}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ID #{cat.id_categoria_servicio}</p>
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
                  cat.estado === 1
                    ? "text-warning hover:bg-warning/10"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {cat.estado === 1 ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <Modal title="Nueva Categoría" onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidthClass="max-w-sm">
          <form onSubmit={(e) => { e.preventDefault(); onHandleCreate(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                placeholder="Ej: Cortes Premium"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium">Crear</button>
              <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedCategory && (
        <Modal title="Editar Categoría" onClose={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} maxWidthClass="max-w-sm">
          <form onSubmit={(e) => { e.preventDefault(); onHandleEdit(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nombre <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium">Guardar</button>
              <button type="button" onClick={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} className="flex-1 py-2.5 border border-border rounded-lg hover:bg-accent text-foreground text-sm font-medium">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Desactivar */}
      {showDeactivateModal && selectedCategory && (
        <ConfirmModal
          variant="deactivate"
          title={selectedCategory.estado === 1 ? "¿Desactivar categoría?" : "¿Activar categoría?"}
          description={`Esta acción cambiará el estado de la categoría "${selectedCategory.nombre}".`}
          confirmLabel={selectedCategory.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedCategory(null); }}
        />
      )}
    </div>
  );
}
