import { useState } from "react";
import { Plus, Download, RotateCcw, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useServices, availableCategories } from "../hooks/useServices";
import ServicesTable from "../components/ServicesTable";
import ServiceFormModal from "../components/ServiceFormModal";
import ServiceDetailModal from "../components/ServiceDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import ServiceCategoriesView from "../components/ServiceCategoriesView";
import ServicePackagesView from "../components/ServicePackagesView";
import ServicesStats from "../components/ServicesStats";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";

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
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilters,
    resetFilters,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedService,
    setSelectedService,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal
  } = useServices();

  const onHandleCreate = () => { handleCreate(); toast.success("Servicio creado correctamente"); };
  const onHandleEdit = () => { handleEdit(); toast.success("Servicio actualizado correctamente"); };
  const onHandleDelete = () => { handleDelete(); toast.success("Servicio eliminado correctamente"); };
  const onToggleStatus = () => {
    if (!selectedService) return;
    const newState = selectedService.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedService.id_servicio);
    toast.success(`Servicio ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedService(null);
  };

  const categoryOptions = availableCategories.map((c) => ({
    value: c.id_categoria_servicio,
    label: c.nombre
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los servicios, categorías y paquetes</p>
        </div>
        {activeTab === "services" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </motion.button>
        )}
      </div>

      {/* Tabs de navegación */}
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

      {/* Vista Servicios */}
      {activeTab === "services" && (
        <>
          <ServicesStats services={services} />

          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            {/* Toolbar Estandarizada */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* SearchBar */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar servicios..."
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
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <ServiceCategoriesView />
        </div>
      )}

      {/* Vista Paquetes */}
      {activeTab === "packages" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
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

      {showDeactivateModal && selectedService && (
        <ConfirmModal
          variant="deactivate"
          title={selectedService.estado === 1 ? "¿Desactivar servicio?" : "¿Activar servicio?"}
          description={`Esta acción cambiará el estado del servicio "${selectedService.nombre}".`}
          confirmLabel={selectedService.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => { setShowDeactivateModal(false); setSelectedService(null); }}
        />
      )}
    </div>
  );
}
