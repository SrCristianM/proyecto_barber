import { Plus, Edit, Power, Tag } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import TiltCard from "../../shared/components/TiltCard";
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre de la Categoría <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          placeholder="Ej: Cuidado del Cabello, Estilizado, Barbería..."
          required
          autoFocus
        />
        <span className="text-[11px] text-muted-foreground mt-1 block">
          Define el nombre de la categoría para clasificar productos en inventario y ventas.
        </span>
      </div>
      <div className="flex gap-3 pt-3 border-t border-border">
        <button
          type="submit"
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 text-sm font-semibold shadow-xs cursor-pointer"
        >
          Guardar Categoría
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-border rounded-xl hover:bg-accent text-foreground text-sm font-medium transition-colors cursor-pointer"
        >
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Categorías", value: categories.length, cls: "text-foreground" },
          { label: "Categorías Activas", value: activeCount, cls: "text-success" },
          { label: "Categorías Inactivas", value: inactiveCount, cls: "text-muted-foreground" }
        ].map(({ label, value, cls }) => (
          <div key={label} className="text-center p-4 gold-card">
            <p className={`text-2xl font-extrabold ${cls}`}>{value}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const isActive = cat.estado === 1;
            return (
              <TiltCard key={cat.id_categoria_producto} maxTilt={6} scale={1.015}>
                <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-3.5 hover:border-primary/40 hover:shadow-xl transition-all h-full">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                        <Tag className="h-5 w-5" />
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                          isActive ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                      >
                        {isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-foreground text-base leading-snug">{cat.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">ID #{cat.id_categoria_producto} · Categoría de Productos</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeactivateModal(cat)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl transition-colors font-semibold cursor-pointer ${
                        isActive
                          ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                          : "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {isActive ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {showCreateModal && (
        <Modal title="Nueva Categoría de Producto" onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidthClass="max-w-2xl">
          <CategoryForm onSubmit={onHandleCreate} onCancel={() => { setShowCreateModal(false); resetForm(); }} />
        </Modal>
      )}

      {showEditModal && selectedCategory && (
        <Modal title="Editar Categoría" onClose={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} maxWidthClass="max-w-2xl">
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
