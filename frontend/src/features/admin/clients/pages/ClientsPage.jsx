import { Plus, Search, Download } from "lucide-react";
import { useClients } from "../hooks/useClients";
import ClientsStats from "../components/ClientsStats";
import ClientsTable from "../components/ClientsTable";
import ClientFormModal from "../components/ClientFormModal";
import ClientDetailModal from "../components/ClientDetailModal";
import ClientDeleteConfirmModal from "../components/ClientDeleteConfirmModal";

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
    selectedClient,
    setSelectedClient,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    stats
  } = useClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
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
          onToggleStatus={toggleStatus}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {showCreateModal && (
        <ClientFormModal
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

      {showEditModal && selectedClient && (
        <ClientFormModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
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

      {showDeleteModal && selectedClient && (
        <ClientDeleteConfirmModal
          clientName={selectedClient.name}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
