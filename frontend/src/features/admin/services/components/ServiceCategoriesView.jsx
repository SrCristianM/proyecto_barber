import { useState } from "react";
import { Plus, Edit, Power, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import SearchableSelect from "../../shared/components/SearchableSelect";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import TiltCard from "../../shared/components/TiltCard";
import ViewModeToggle from "../../shared/components/ViewModeToggle";
import { useServiceCategories } from "../hooks/useServiceCategories";

export default function ServiceCategoriesView() {
  const [viewMode, setViewMode] = useState("cards");

  const {
    categories = [],
    filteredCategories = [],
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
    showDeleteModal,
    setShowDeleteModal,
    selectedCategory,
    setSelectedCategory,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    openDeleteModal
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
  const onHandleDelete = () => {
    if (selectedCategory) {
      handleDelete(selectedCategory.id_categoria_servicio);
    }
  };

  return (
    <div className="space-y-4">
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

        <div className="flex items-center gap-2">
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {categories.length === 0 ? "Crear primera categoría" : "Nueva Categoría"}
          </button>
        </div>
      </div>

      {/* Vista de categorías: Tabla o Tarjetas */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          No se encontraron categorías
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto border border-border rounded-xl bg-card">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.map((cat) => {
                const isActive = cat.estado === 1;
                return (
                  <tr key={cat.id_categoria_servicio} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground text-xs">
                      #{cat.id_categoria_servicio}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <Tag className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{cat.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      Servicios de Barbería
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          isActive ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                      >
                        {isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeactivateModal(cat)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isActive
                              ? "text-destructive hover:bg-destructive/10"
                              : "text-emerald-500 hover:bg-emerald-500/10"
                          }`}
                          title={isActive ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(cat)}
                          className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const isActive = cat.estado === 1;
            return (
              <TiltCard key={cat.id_categoria_servicio} maxTilt={6} scale={1.015}>
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
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">ID #{cat.id_categoria_servicio} · Categoría de Servicios</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
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
                    <button
                      type="button"
                      onClick={() => openDeleteModal(cat)}
                      title="Eliminar categoría"
                      className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors font-semibold cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Modal Crear */}
      {showCreateModal && (
        <Modal title="Nueva Categoría de Servicio" onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidthClass="max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); onHandleCreate(); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre de la Categoría <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                placeholder="Ej: Cortes Premium, Barbería Clásica, Tintes..."
                required
                autoFocus
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Permite agrupar los servicios en el catálogo y durante el agendamiento de citas.
              </span>
            </div>
            <div>
              <SearchableSelect
                label="Estado"
                value={formData.estado !== undefined ? formData.estado : 1}
                onChange={(val) => setFormData({ ...formData, estado: Number(val) })}
                options={[
                  { value: 1, label: "Activo" },
                  { value: 0, label: "Inactivo" }
                ]}
                searchable={false}
              />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 text-sm font-semibold shadow-xs cursor-pointer"
              >
                Crear Categoría
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 py-3 border border-border rounded-xl hover:bg-accent text-foreground text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedCategory && (
        <Modal title="Editar Categoría de Servicio" onClose={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }} maxWidthClass="max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); onHandleEdit(); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre de la Categoría <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                required
                autoFocus
              />
            </div>
            <div>
              <SearchableSelect
                label="Estado"
                value={formData.estado !== undefined ? formData.estado : (selectedCategory.estado !== undefined ? selectedCategory.estado : 1)}
                onChange={(val) => setFormData({ ...formData, estado: Number(val) })}
                options={[
                  { value: 1, label: "Activo" },
                  { value: 0, label: "Inactivo" }
                ]}
                searchable={false}
              />
            </div>
            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 text-sm font-semibold shadow-xs cursor-pointer"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }}
                className="flex-1 py-3 border border-border rounded-xl hover:bg-accent text-foreground text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
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

      {/* Modal Eliminar */}
      {showDeleteModal && selectedCategory && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar categoría de servicio?"
          description={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory.nombre}"? Si tiene servicios asociados, no podrá ser eliminada.`}
          confirmLabel="Eliminar Categoría"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedCategory(null); }}
        />
      )}
    </div>
  );
}
