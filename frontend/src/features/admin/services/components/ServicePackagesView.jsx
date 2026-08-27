import { Plus, Edit, Power, Package } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import { useServicePackages } from "../hooks/useServicePackages";

export default function ServicePackagesView() {
  const {
    filteredPackages,
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
    selectedPackage,
    setSelectedPackage,
    resetForm,
    handleCreate,
    handleEdit,
    toggleStatus,
    openEditModal,
    openDeactivateModal
  } = useServicePackages();

  const onHandleCreate = () => { handleCreate(); toast.success("Paquete creado correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Paquete actualizado correctamente"); };
  const onToggleStatus = () => {
    const newState = selectedPackage?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedPackage?.id_paquete);
    toast.success(`Paquete ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedPackage(null);
  };

  const PackageForm = ({ onSubmit, onCancel }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Paquete <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="Ej: Paquete Completo Ejecutivo"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Descuento Promocional (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.descuento_porcentaje}
            onChange={(e) => setFormData({ ...formData, descuento_porcentaje: Number(e.target.value) })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="0"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Aplica sobre el valor total acumulado de los servicios.
          </span>
        </div>

        <div className="p-4 bg-secondary/30 rounded-xl border border-border/60 flex flex-col justify-center">
          <span className="text-xs font-semibold text-foreground block mb-0.5">Vista previa</span>
          <span className="text-xs text-muted-foreground">
            {formData.nombre ? formData.nombre : "Nombre del paquete"} —{" "}
            {formData.descuento_porcentaje > 0 ? `${formData.descuento_porcentaje}% de descuento` : "Sin descuento aplicado"}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-3 border-t border-border">
        <button
          type="submit"
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
        >
          Guardar Paquete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-border rounded-xl hover:bg-accent text-foreground transition-colors text-sm font-medium cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar paquetes..."
            maxWidthClass="w-full sm:w-60"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Paquete
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id_paquete} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  pkg.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {pkg.estado === 1 ? "Activo" : "Inactivo"}
                </span>
                {pkg.descuento_porcentaje > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    -{pkg.descuento_porcentaje}%
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{pkg.nombre}</p>
              {pkg.servicios && pkg.servicios.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{pkg.servicios.join(" · ")}</p>
              )}
            </div>
            <div className="flex gap-2 pt-1 border-t border-border">
              <button
                onClick={() => openEditModal(pkg)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                onClick={() => openDeactivateModal(pkg)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                  pkg.estado === 1 ? "text-warning hover:bg-warning/10" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {pkg.estado === 1 ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <Modal title="Nuevo Paquete de Servicios" onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidthClass="max-w-2xl">
          <PackageForm onSubmit={onHandleCreate} onCancel={() => { setShowCreateModal(false); resetForm(); }} />
        </Modal>
      )}

      {showEditModal && selectedPackage && (
        <Modal title="Editar Paquete de Servicios" onClose={() => { setShowEditModal(false); setSelectedPackage(null); resetForm(); }} maxWidthClass="max-w-2xl">
          <PackageForm onSubmit={onHandleEdit} onCancel={() => { setShowEditModal(false); setSelectedPackage(null); resetForm(); }} />
        </Modal>
      )}

      {showDeactivateModal && selectedPackage && (
        <ConfirmModal
          variant="deactivate"
          title={selectedPackage.estado === 1 ? "¿Desactivar paquete?" : "¿Activar paquete?"}
          description={`Esta acción cambiará el estado del paquete "${selectedPackage.nombre}".`}
          confirmLabel={selectedPackage.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedPackage(null); }}
        />
      )}
    </div>
  );
}
