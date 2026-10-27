import { useState } from "react";
import { Plus, Edit, Power, Package, Check, Trash2, Tag } from "lucide-react";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FormFieldError from "../../shared/components/FormFieldError";
import NumericInput from "../../shared/components/NumericInput";
import SearchableSelect from "../../shared/components/SearchableSelect";
import TiltCard from "../../shared/components/TiltCard";
import ViewModeToggle from "../../shared/components/ViewModeToggle";
import { useServicePackages } from "../hooks/useServicePackages";
import { validateServicePackageForm } from "../validations/serviceValidation";

function PackageForm({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  availableServicesList = [],
  toggleServiceInForm,
  onSubmit,
  onCancel,
  isEdit = false
}) {
  const selectedServices = availableServicesList.filter((s) =>
    (formData.servicios_ids || []).includes(s.id_servicio)
  );
  const basePrice = selectedServices.reduce((sum, s) => sum + Number(s.precio || 0), 0);
  const totalDurationMin = selectedServices.reduce((sum, s) => sum + Number(s.duracion_minutos || 0), 0);
  const discountRate = Number(formData.descuento_porcentaje) || 0;
  const finalPrice = Math.max(0, basePrice * (1 - discountRate / 100));
  const savedAmount = Math.max(0, basePrice - finalPrice);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Formulario de Configuración (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Nombre del Paquete */}
          <div>
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
              placeholder="Ej: Combo Ejecutivo (Corte + Barba + Exfoliación)..."
              required
            />
            <FormFieldError error={formErrors.nombre} />
          </div>

          {/* Descuento Porcentaje */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Porcentaje de Descuento (%) <span className="text-destructive">*</span>
            </label>
            <NumericInput
              name="descuento_porcentaje"
              id="descuento_porcentaje"
              min="0"
              max="100"
              step="1"
              value={formData.descuento_porcentaje}
              onChange={(val) => {
                setFormData({ ...formData, descuento_porcentaje: val });
                if (formErrors.descuento_porcentaje) setFormErrors((prev) => ({ ...prev, descuento_porcentaje: null }));
              }}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                formErrors.descuento_porcentaje
                  ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                  : "border-input focus:ring-2 focus:ring-primary"
              }`}
              placeholder="0 a 100%"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Ahorro aplicado automáticamente sobre la suma de los servicios seleccionados.
            </span>
            <FormFieldError error={formErrors.descuento_porcentaje} />
          </div>

          {/* Selección de Servicios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Servicios Incluidos <span className="text-destructive">*</span>
              </label>
              <span className="text-xs font-semibold text-primary">
                {(formData.servicios_ids || []).length} seleccionados
              </span>
            </div>

            <div className="border border-border rounded-xl p-3 max-h-56 overflow-y-auto space-y-2 bg-background/50">
              {availableServicesList.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No hay servicios disponibles registrados</p>
              ) : (
                availableServicesList.map((srv) => {
                  const isChecked = (formData.servicios_ids || []).includes(srv.id_servicio);
                  return (
                    <label
                      key={srv.id_servicio}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "border-border hover:bg-accent/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => {
                            toggleServiceInForm(srv.id_servicio);
                            if (formErrors.servicios_ids) setFormErrors((prev) => ({ ...prev, servicios_ids: null }));
                          }}
                        />
                        <span className="text-xs font-medium text-foreground">{srv.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-foreground">
                          ${Number(srv.precio).toLocaleString("es-CO")}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {srv.duracion_minutos || 30} min
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <FormFieldError error={formErrors.servicios_ids} />
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Resumen en Vivo (5 cols) */}
        <div className="lg:col-span-5 bg-card/60 border border-primary/20 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" />
                Resumen del Paquete
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {totalDurationMin} min estim.
              </span>
            </div>

            {/* Lista visual de ítems incluidos */}
            <div className="py-3 space-y-1.5 min-h-[140px]">
              {selectedServices.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Selecciona al menos 2 servicios a la izquierda para ver el cálculo.
                </div>
              ) : (
                selectedServices.map((s) => (
                  <div key={s.id_servicio} className="flex items-center justify-between text-xs py-1">
                    <span className="text-foreground truncate max-w-[170px]">{s.nombre}</span>
                    <span className="font-mono text-muted-foreground">
                      ${Number(s.precio).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Resumen de Precios y Ahorro */}
            <div className="border-t border-border/80 pt-3 flex items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Precio Final
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-primary">
                    ${Math.round(finalPrice).toLocaleString("es-CO")}
                  </span>
                  {discountRate > 0 && basePrice > 0 && (
                    <span className="text-xs text-muted-foreground line-through font-semibold">
                      ${basePrice.toLocaleString("es-CO")}
                    </span>
                  )}
                </div>
              </div>

              {discountRate > 0 && savedAmount > 0 && (
                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    ¡Ahorras ${Math.round(savedAmount).toLocaleString("es-CO")}!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Paquete (Universal al final) */}
      <div>
        <SearchableSelect
          label="Estado"
          value={formData.estado !== undefined ? formData.estado : 1}
          onChange={(val) => setFormData({ ...formData, estado: Number(val) })}
          options={[
            { value: 1, label: "Activo (Disponible para contratación)" },
            { value: 0, label: "Inactivo" }
          ]}
          searchable={false}
        />
      </div>

      {/* Botones de acción del formulario */}
      <div className="flex gap-3 pt-4 border-t border-border">
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
}

export default function ServicePackagesView() {
  const [viewMode, setViewMode] = useState("cards");

  const {
    packages = [],
    filteredPackages,
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
    selectedPackage,
    setSelectedPackage,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    openDeleteModal,
    toggleServiceInForm,
    getServiceNames,
    availableServicesList
  } = useServicePackages();

  const [formErrors, setFormErrors] = useState({});

  const onHandleDelete = () => {
    if (selectedPackage) {
      handleDelete(selectedPackage.id_paquete);
    }
  };

  const onHandleCreate = () => {
    const result = validateServicePackageForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
    handleCreate();
  };

  const onHandleEdit = () => {
    const result = validateServicePackageForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
    handleEdit();
  };

  const onToggleStatus = () => {
    toggleStatus(selectedPackage?.id_paquete);
    setShowDeactivateModal(false);
    setSelectedPackage(null);
  };



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
            onClick={() => {
              resetForm();
              setFormErrors({});
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {packages?.length === 0 ? "Crear primer paquete" : "Nuevo Paquete"}
          </button>
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          No se encontraron paquetes
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto border border-border rounded-xl bg-card">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Paquete</th>
                <th className="py-3.5 px-4">Servicios Incluidos</th>
                <th className="py-3.5 px-4">Descuento</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPackages.map((pkg) => {
                const serviceNames = getServiceNames(pkg.servicios_ids);
                const isActive = pkg.estado === 1;

                return (
                  <tr key={pkg.id_paquete} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-muted-foreground text-xs">
                      #{pkg.id_paquete}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{pkg.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[250px] truncate" title={serviceNames.join(", ")}>
                      {serviceNames.length > 0 ? serviceNames.join(" · ") : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {pkg.descuento_porcentaje > 0 ? (
                        <span className="text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full shadow-2xs">
                          -{pkg.descuento_porcentaje}% OFF
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0%</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          isActive ? "badge-glow-success" : "badge-glow-destructive"
                        }`}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormErrors({});
                            openEditModal(pkg);
                          }}
                          className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeactivateModal(pkg)}
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
                          onClick={() => openDeleteModal(pkg)}
                          className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                          title="Eliminar paquete"
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

                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
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
                    <button
                      type="button"
                      onClick={() => openDeleteModal(pkg)}
                      title="Eliminar paquete"
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
        <Modal title="Crear Nuevo Paquete de Servicios" onClose={() => setShowCreateModal(false)} maxWidthClass="max-w-4xl">
          <PackageForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            availableServicesList={availableServicesList}
            toggleServiceInForm={toggleServiceInForm}
            onSubmit={onHandleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedPackage && (
        <Modal title="Editar Paquete de Servicios" onClose={() => setShowEditModal(false)} maxWidthClass="max-w-4xl">
          <PackageForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            availableServicesList={availableServicesList}
            toggleServiceInForm={toggleServiceInForm}
            onSubmit={onHandleEdit}
            onCancel={() => setShowEditModal(false)}
            isEdit
          />
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

      {/* Modal Eliminar */}
      {showDeleteModal && selectedPackage && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar paquete de servicios?"
          description={`¿Estás seguro de que deseas eliminar permanentemente el paquete "${selectedPackage.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar Paquete"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedPackage(null); }}
        />
      )}
    </div>
  );
}
