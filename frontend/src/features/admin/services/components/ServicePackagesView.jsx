import { useState } from "react";
import { Plus, Edit, Power, Package, Check } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import FormFieldError from "../../shared/components/FormFieldError";
import NumericInput from "../../shared/components/NumericInput";
import TiltCard from "../../shared/components/TiltCard";
import { useServicePackages } from "../hooks/useServicePackages";
import { validateServicePackageForm } from "../validations/serviceValidation";

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

  const [formErrors, setFormErrors] = useState({});

  const onHandleCreate = () => {
    const result = validateServicePackageForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
    handleCreate();
    toast.success("Paquete creado correctamente");
  };

  const onHandleEdit = () => {
    const result = validateServicePackageForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5" noValidate>
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
            onChange={(e) => {
              setFormData({ ...formData, nombre: e.target.value });
              if (formErrors.nombre) setFormErrors((prev) => ({ ...prev, nombre: null }));
            }}
            className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              formErrors.nombre
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
            placeholder="Ej: Paquete Completo Ejecutivo"
            autoFocus
          />
          <FormFieldError error={formErrors.nombre} />
        </div>

        {/* Descuento Porcentaje */}
        <div>
          <NumericInput
            label="Descuento Promocional (%)"
            name="descuento_porcentaje"
            id="descuento_porcentaje"
            min={0}
            max={100}
            allowDecimal={true}
            value={formData.descuento_porcentaje}
            onChange={(val) => {
              setFormData({ ...formData, descuento_porcentaje: val });
              if (formErrors.descuento_porcentaje) setFormErrors((prev) => ({ ...prev, descuento_porcentaje: null }));
            }}
            error={formErrors.descuento_porcentaje}
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
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-3 bg-secondary/20 border rounded-xl transition-all ${
          formErrors.servicios_ids ? "border-destructive ring-1 ring-destructive/30" : "border-border/70"
        }`}>
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
                    onChange={() => {
                      toggleServiceInForm(svc.id_servicio);
                      if (formErrors.servicios_ids) setFormErrors((prev) => ({ ...prev, servicios_ids: null }));
                    }}
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
        <FormFieldError error={formErrors.servicios_ids} />
      </div>

      <div className="flex gap-3 pt-3 border-t border-border">
        <button
          type="submit"
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
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
            setFormErrors({});
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo Paquete
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => {
          const serviceNames = getServiceNames(pkg.servicios_ids);
          const isActive = pkg.estado === 1;

          return (
            <TiltCard key={pkg.id_paquete} maxTilt={6} scale={1.015}>
              <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-3.5 hover:border-primary/40 hover:shadow-xl transition-all h-full">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                          isActive ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                      {pkg.descuento_porcentaje > 0 && (
                        <span className="text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full shadow-2xs">
                          -{pkg.descuento_porcentaje}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-foreground text-base leading-snug">{pkg.nombre}</p>
                    {serviceNames.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {serviceNames.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors({});
                      openEditModal(pkg);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeactivateModal(pkg)}
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
