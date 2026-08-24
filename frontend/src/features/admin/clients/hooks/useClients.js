import { useState } from "react";
import { NIVELES_FIDELIDAD } from "../../../../shared/types/database";

const mockClients = [
  { id_cliente: 1, id_usuario: 4, nombre: "Pedro", apellido: "López", correo: "pedro@example.com", telefono: "+57 300 123 4567", direccion: "Calle 10 # 5-20", nivel_fidelidad: "Oro", estado: 1 },
  { id_cliente: 2, id_usuario: 8, nombre: "Ana", apellido: "Martínez", correo: "ana.m@example.com", telefono: "+57 301 234 5678", direccion: "Carrera 15 # 45-12", nivel_fidelidad: "Plata", estado: 1 },
  { id_cliente: 3, id_usuario: 9, nombre: "Roberto", apellido: "Sánchez", correo: "roberto@example.com", telefono: "+57 302 345 6789", direccion: "Av. Siempre Viva 123", nivel_fidelidad: "Bronce", estado: 1 },
  { id_cliente: 4, id_usuario: 10, nombre: "Laura", apellido: "Gómez", correo: "laura@example.com", telefono: "+57 303 456 7890", direccion: "Calle 80 # 20-30", nivel_fidelidad: "Oro", estado: 1 },
  { id_cliente: 5, id_usuario: 11, nombre: "Diego", apellido: "Torres", correo: "diego.t@example.com", telefono: "+57 304 567 8901", direccion: "Diagonal 40 # 12-50", nivel_fidelidad: "Nuevo", estado: 0 }
];

export const availableLoyalties = NIVELES_FIDELIDAD;

const emptyForm = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  direccion: "",
  nivel_fidelidad: "Nuevo",
  id_usuario: null
};

export function useClients() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombre");
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
    .filter((client) => {
      const fullName = `${client.nombre} ${client.apellido}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return (
        fullName.includes(search) ||
        client.correo.toLowerCase().includes(search) ||
        (client.telefono || "").includes(search) ||
        (client.direccion || "").toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const nextClientId = Math.max(...clients.map((c) => c.id_cliente), 0) + 1;
    const nextUserId = formData.id_usuario || Math.max(...clients.map((c) => c.id_usuario), 20) + 1;

    const newClient = {
      id_cliente: nextClientId,
      id_usuario: nextUserId,
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      telefono: formData.telefono,
      direccion: formData.direccion || null,
      nivel_fidelidad: formData.nivel_fidelidad || "Nuevo",
      estado: 1
    };
    setClients([...clients, newClient]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedClient) return;
    setClients(
      clients.map((client) =>
        client.id_cliente === selectedClient.id_cliente
          ? {
              ...client,
              nombre: formData.nombre,
              apellido: formData.apellido,
              correo: formData.correo,
              telefono: formData.telefono,
              direccion: formData.direccion || null,
              nivel_fidelidad: formData.nivel_fidelidad
            }
          : client
      )
    );
    setShowEditModal(false);
    setSelectedClient(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedClient) return;
    setClients(clients.filter((client) => client.id_cliente !== selectedClient.id_cliente));
    setShowDeleteModal(false);
    setSelectedClient(null);
  };

  const toggleStatus = (clientId) => {
    setClients(
      clients.map((client) =>
        client.id_cliente === clientId ? { ...client, estado: client.estado === 1 ? 0 : 1 } : client
      )
    );
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      nombre: client.nombre,
      apellido: client.apellido,
      correo: client.correo,
      telefono: client.telefono || "",
      direccion: client.direccion || "",
      nivel_fidelidad: client.nivel_fidelidad || "Nuevo",
      id_usuario: client.id_usuario
    });
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
    activos: clients.filter((c) => c.estado === 1).length,
    fidelizados: clients.filter((c) => c.nivel_fidelidad === "Oro" || c.nivel_fidelidad === "Plata").length
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
