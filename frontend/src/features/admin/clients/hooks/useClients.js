import { useState } from "react";

const mockClients = [
  { id: 1, name: "Pedro López", email: "pedro@example.com", phone: "+57 300 123 4567", visits: 12, lastVisit: "2 días", loyalty: "Oro", status: "Activo", createdAt: "2026-01-15" },
  { id: 2, name: "Ana Martínez", email: "ana@example.com", phone: "+57 301 234 5678", visits: 8, lastVisit: "1 semana", loyalty: "Plata", status: "Activo", createdAt: "2026-02-20" },
  { id: 3, name: "Roberto Sánchez", email: "roberto@example.com", phone: "+57 302 345 6789", visits: 5, lastVisit: "3 días", loyalty: "Bronce", status: "Activo", createdAt: "2026-03-10" },
  { id: 4, name: "Laura Gómez", email: "laura@example.com", phone: "+57 303 456 7890", visits: 15, lastVisit: "1 día", loyalty: "Oro", status: "Activo", createdAt: "2026-04-05" },
  { id: 5, name: "Diego Torres", email: "diego@example.com", phone: "+57 304 567 8901", visits: 3, lastVisit: "2 semanas", loyalty: "Bronce", status: "Inactivo", createdAt: "2026-05-12" }
];

export const availableLoyalties = ["Bronce", "Plata", "Oro"];

const emptyForm = { name: "", email: "", phone: "" };

export function useClients() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredClients = clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newClient = {
      id: Math.max(...clients.map((c) => c.id), 0) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      visits: 0,
      lastVisit: "Nunca",
      loyalty: "Bronce",
      status: "Activo",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setClients([...clients, newClient]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedClient) return;
    setClients(
      clients.map((client) =>
        client.id === selectedClient.id
          ? { ...client, name: formData.name, email: formData.email, phone: formData.phone }
          : client
      )
    );
    setShowEditModal(false);
    setSelectedClient(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedClient) return;
    setClients(clients.filter((client) => client.id !== selectedClient.id));
    setShowDeleteModal(false);
    setSelectedClient(null);
  };

  const toggleStatus = (clientId) => {
    setClients(
      clients.map((client) =>
        client.id === clientId ? { ...client, status: client.status === "Activo" ? "Inactivo" : "Activo" } : client
      )
    );
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({ name: client.name, email: client.email, phone: client.phone || "" });
    setShowEditModal(true);
  };

  const openDetailModal = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const stats = {
    total: clients.length,
    newThisMonth: 12,
    avgRating: 4.8
  };

  return {
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
  };
}
