import { Plus, Edit, Power, Package, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
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
    openDeactivateModal,
    toggleServiceInForm,
    getServiceNames,
    availableServicesList
  } = useServicePackages();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Paquete creado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Paquete actualizado correctamente");
  };

  const onToggleStatus = () => {
    const newState = selectedPackage?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedPackage?.id_paquete);
    toast.success(`Paquete ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedPackage(null);
  };

  // Cálculo de valor acumulado y precio con descuento
  const selectedServices = availableServicesList.filter((s) =>
    (formData.servicios_ids || []).includes(s.id_servicio)
  );
  const basePrice = selectedServices.reduce((sum, s) => sum + Number(s.precio), 0);
  const discountRate = Number(formData.descuento_porcentaje) || 0;
  const finalPrice = Math.max(0, basePrice * (1 - discountRate / 100));

  const PackageForm = ({ onSubmit, onCancel, isEdit = false }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre del Paquete */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Paquete <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            maxLength={120}
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="Ej: Paquete Completo Ejecutivo"
            required
            autoFocus
          />
        </div>

        {/* Descuento Porcentaje */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Descuento Promocional (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            name="descuento_porcentaje"
            id="descuento_porcentaje"
            value={formData.descuento_porcentaje}
            onChange={(e) => setFormData({ ...formData, descuento_porcentaje: Number(e.target.value) })}
            className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="0"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Aplica sobre la sumatoria de servicios incluidos.
          </span>
        </div>

        {/* Resumen Financiero Calculado */}
        <div className="p-4 bg-secondary/30 rounded-xl border border-border/60 flex flex-col justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            Precio Estimado del Combo
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              ${Math.round(finalPrice).toLocaleString("es-CO")}
            </span>
            {discountRate > 0 && basePrice > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                ${basePrice.toLocaleString("es-CO")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Servicios que componen el paquete (paquete_servicio_detalle - Tabla Puente N:M) */}
      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Servicios Incluidos en el Paquete <span className="text-destructive">*</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">
            (Selecciona al menos 2 servicios)
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-3 bg-secondary/20 border border-border/70 rounded-xl">
          {availableServicesList.map((svc) => {
            const isChecked = (formData.servicios_ids || []).includes(svc.id_servicio);
            return (
              <label
                key={svc.id_servicio}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : "bg-input-background border-input text-muted-foreground hover:bg-accent/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleServiceInForm(svc.id_servicio)}
                    className="w-4 h-4 rounded text-primary border-input focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-medium text-foreground block">{svc.nombre}</span>
                    <span className="text-[10px] text-muted-foreground">{svc.duracion_minutos} min</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  ${Number(svc.precio).toLocaleString("es-CO")}
                </span>
              </label>
            );
          })}
        </div>
        {(formData.servicios_ids || []).length < 2 && (
          <p className="text-xs text-destructive mt-1.5">
            Un paquete debe componerse de al menos 2 servicios.
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-3 border-t border-border">
        <button
          type="submit"
          disabled={(formData.servicios_ids || []).length < 2 || !formData.nombre.trim()}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEdit ? "Guardar Cambios del Paquete" : "Crear Paquete"}
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
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Paquete
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPackages.map((pkg) => {
          const serviceNames = getServiceNames(pkg.servicios_ids);
          return (
            <div
              key={pkg.id_paquete}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      pkg.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pkg.estado === 1 ? "Activo" : "Inactivo"}
                  </span>
                  {pkg.descuento_porcentaje > 0 && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      -{pkg.descuento_porcentaje}% OFF
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{pkg.nombre}</p>
                {serviceNames.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {serviceNames.join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => openDeactivateModal(pkg)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors font-medium cursor-pointer ${
                    pkg.estado === 1
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-success hover:bg-success/10"
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {pkg.estado === 1 ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <Modal title="Crear Nuevo Paquete de Servicios" onClose={() => setShowCreateModal(false)}>
          <PackageForm onSubmit={onHandleCreate} onCancel={() => setShowCreateModal(false)} />
        </Modal>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedPackage && (
        <Modal title="Editar Paquete de Servicios" onClose={() => setShowEditModal(false)}>
          <PackageForm onSubmit={onHandleEdit} onCancel={() => setShowEditModal(false)} isEdit />
        </Modal>
      )}

      {/* Modal Desactivar/Activar */}
      {showDeactivateModal && selectedPackage && (
        <ConfirmModal
          variant={selectedPackage.estado === 1 ? "deactivate" : "default"}
          title={selectedPackage.estado === 1 ? "¿Desactivar paquete?" : "¿Activar paquete?"}
          description={`El paquete "${selectedPackage.nombre}" ${
            selectedPackage.estado === 1
              ? "no estará disponible para reservas o ventas mientras esté inactivo."
              : "volverá a estar disponible para clientes y recepción."
          }`}
          confirmLabel={selectedPackage.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => setShowDeactivateModal(false)}
        />
      )}
    </div>
  );
}
