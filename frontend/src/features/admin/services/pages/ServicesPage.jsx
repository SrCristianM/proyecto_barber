import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { useServices } from "../hooks/useServices";
import ServicesTable from "../components/ServicesTable";
import ServiceFormModal from "../components/ServiceFormModal";
import ServiceDetailModal from "../components/ServiceDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ServiceCategoriesView from "../components/ServiceCategoriesView";
import ServicePackagesView from "../components/ServicePackagesView";
import ServicesStats from "../components/ServicesStats";

const TABS = [
  { key: "services", label: "Servicios" },
  { key: "categories", label: "Categorías" },
  { key: "packages", label: "Paquetes" }
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("services");

  const {
    services,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    handleSort,
    filteredServices,
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
    selectedService,
    setSelectedService,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal
  } = useServices();

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const onHandleCreate = () => { handleCreate(); toast.success("Servicio creado correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Servicio actualizado correctamente"); };
  const onHandleDelete = () => { handleDelete(); toast.success("Servicio eliminado correctamente"); };
  const onToggleStatus = () => {
    const newState = deactivateTarget?.estado === 1 ? "desactivado" : "activado";
    toggleStatus(deactivateTarget?.id_servicio);
    toast.success(`Servicio ${newState} correctamente`);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const openDeactivateModal = (service) => {
    setDeactivateTarget(service);
    setShowDeactivateModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los servicios, categorías y paquetes</p>
        </div>
        {activeTab === "services" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </button>
        )}
      </div>

      {/* Tabs de navegación */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit border border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vista Servicios */}
      {activeTab === "services" && (
        <>
          <ServicesStats services={services} />

          <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              />
            </div>
            <button className="ml-auto flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>

          <ServicesTable
            services={filteredServices}
            totalCount={services.length}
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

      {/* Vista Categorías */}
      {activeTab === "categories" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <ServiceCategoriesView />
        </div>
      )}

      {/* Vista Paquetes */}
      {activeTab === "packages" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <ServicePackagesView />
        </div>
      )}

      {/* Modales de Servicios */}
      {showCreateModal && (
        <ServiceFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
        />
      )}

      {showEditModal && selectedService && (
        <ServiceFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => { setShowEditModal(false); setSelectedService(null); resetForm(); }}
        />
      )}

      {showDetailModal && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onEdit={() => { setShowDetailModal(false); openEditModal(selectedService); }}
          onClose={() => { setShowDetailModal(false); setSelectedService(null); }}
        />
      )}

      {showDeleteModal && selectedService && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este servicio?"
          description={`Se eliminará el servicio "${selectedService.nombre}" de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedService(null); }}
        />
      )}

      {showDeactivateModal && deactivateTarget && (
        <ConfirmModal
          variant="deactivate"
          title={deactivateTarget.estado === 1 ? "¿Desactivar servicio?" : "¿Activar servicio?"}
          description={`Esta acción cambiará el estado del servicio "${deactivateTarget.nombre}".`}
          confirmLabel={deactivateTarget.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setDeactivateTarget(null); }}
        />
      )}
    </div>
  );
}
