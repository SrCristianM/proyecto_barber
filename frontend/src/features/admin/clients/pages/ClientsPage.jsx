import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "../hooks/useClients";
import ClientsStats from "../components/ClientsStats";
import ClientsTable from "../components/ClientsTable";
import ClientFormModal from "../components/ClientFormModal";
import ClientDetailModal from "../components/ClientDetailModal";
import ConfirmModal from "../../shared/components/ConfirmModal";

export default function ClientsPage() {
  const {
    clients,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    handleSort,
    filteredClients,
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
    selectedClient,
    setSelectedClient,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal,
    stats
  } = useClients();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Cliente registrado correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Cliente actualizado correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Cliente eliminado correctamente");
  };

  const onToggleStatus = () => {
    if (!selectedClient) return;
    const newState = selectedClient.estado === 1 ? "desactivado" : "activado";
    toggleStatus(selectedClient.id_cliente);
    toast.success(`Cliente ${newState} correctamente`);
    setShowDeactivateModal(false);
    setSelectedClient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      <ClientsStats stats={stats} />

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar clientes..."
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

        <ClientsTable
          clients={filteredClients}
          totalCount={clients.length}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={openDetailModal}
          onToggleStatus={openDeactivateModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <ClientFormModal
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleCreate}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedClient && (
        <ClientFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onHandleEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
            resetForm();
          }}
        />
      )}

      {showDetailModal && selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onEdit={() => {
            setShowDetailModal(false);
            openEditModal(selectedClient);
          }}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedClient && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar este cliente?"
          description={`Se eliminará el cliente "${selectedClient.nombre} ${selectedClient.apellido}" de forma permanente.`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Modal Confirmar Desactivar / Activar */}
      {showDeactivateModal && selectedClient && (
        <ConfirmModal
          variant="deactivate"
          title={selectedClient.estado === 1 ? "¿Desactivar este cliente?" : "¿Activar este cliente?"}
          description={`Esta acción cambiará el estado del cliente "${selectedClient.nombre} ${selectedClient.apellido}".`}
          confirmLabel={selectedClient.estado === 1 ? "Desactivar" : "Activar"}
          onConfirm={onToggleStatus}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
