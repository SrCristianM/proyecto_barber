import { Plus, Search, Download } from "lucide-react";
import { useServices } from "../hooks/useServices";
import ServicesTable from "../components/ServicesTable";
import ServiceFormModal from "../components/ServiceFormModal";
import ServiceDetailModal from "../components/ServiceDetailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function ServicesPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios de tu barbería</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-5 w-5" />
          Nuevo Servicio
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground">
            <Download className="h-5 w-5" />
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
          onToggleStatus={toggleStatus}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <ServiceFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedService && (
        <ServiceFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedService);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedService(null);
          }}
        />
      )}

      {showDeleteModal && selectedService && (
        <DeleteConfirmModal
          serviceName={selectedService.nombre}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}
