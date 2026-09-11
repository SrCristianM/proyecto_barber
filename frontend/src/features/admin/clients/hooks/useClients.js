import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NIVELES_FIDELIDAD } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus
} from "../services/clientsService";

const mockClients = [];

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
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [loyaltyFilter, setLoyaltyFilter] = useState("all"); // 'all' | 'Nuevo' | 'Bronce' | 'Plata' | 'Oro'
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
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
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        fullName.includes(search) ||
        client.correo.toLowerCase().includes(search) ||
        (client.telefono || "").includes(search) ||
        (client.direccion || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && client.estado === 1) ||
        (statusFilter === "0" && client.estado === 0);

      const matchesLoyalty =
        loyaltyFilter === "all" || client.nivel_fidelidad === loyaltyFilter;

      return matchesSearch && matchesStatus && matchesLoyalty;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || loyaltyFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLoyaltyFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const loadLocalClients = () => {
    try {
      const rawClients = localStorage.getItem("barber_clients_db");
      const rawUsers = localStorage.getItem("barber_users_db");
      const storedClients = rawClients ? JSON.parse(rawClients) : [];
      const storedUsers = rawUsers ? JSON.parse(rawUsers) : [];

      const merged = [...storedClients];

      storedUsers
        .filter((u) => Number(u.id_rol) === 4)
        .forEach((u) => {
          const cleanEmail = (u.correo || "").trim().toLowerCase();
          const exists = merged.some(
            (c) =>
              (c.id_usuario && Number(c.id_usuario) === Number(u.id_usuario)) ||
              (c.correo && c.correo.toLowerCase() === cleanEmail)
          );
          if (!exists) {
            const nextId = Math.max(...merged.map((c) => Number(c.id_cliente) || 0), 0) + 1;
            merged.push({
              id_cliente: nextId,
              id_usuario: u.id_usuario,
              nombre: (u.nombre || "").trim(),
              apellido: (u.apellido || "").trim(),
              correo: cleanEmail,
              telefono: u.telefono || "",
              direccion: u.direccion || "No especificada",
              nivel_fidelidad: "Nuevo",
              estado: u.estado !== undefined ? u.estado : 1
            });
          }
        });

      setClients(merged);
      return;
    } catch (e) {
      console.error(e);
    }
    setClients([]);
  };

  useEffect(() => {
    getClients()
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
          try {
            localStorage.setItem("barber_clients_db", JSON.stringify(data));
          } catch {}
        } else {
          loadLocalClients();
        }
      })
      .catch((err) => {
        console.warn("[Clients] Usando datos de clientes registrados locales:", err.message);
        loadLocalClients();
      });
  }, []);

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      direccion: formData.direccion ? formData.direccion.trim() : null,
      nivel_fidelidad: formData.nivel_fidelidad || "Nuevo",
      estado: 1
    };

    try {
      const created = await createClient(payload);
      const newClient = {
        ...payload,
        id_cliente: created?.id_cliente || Math.max(...clients.map((c) => c.id_cliente), 0) + 1,
        id_usuario: created?.id_usuario || Math.max(...clients.map((c) => c.id_usuario || 0), 20) + 1
      };
      setClients((prev) => {
        const updated = [newClient, ...prev];
        try {
          localStorage.setItem("barber_clients_db", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setShowCreateModal(false);
      resetForm();
      toast.success("Cliente registrado exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al registrar el cliente.");
    }
  };

  const handleEdit = async () => {
    if (!selectedClient) return;
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      direccion: formData.direccion ? formData.direccion.trim() : null,
      nivel_fidelidad: formData.nivel_fidelidad
    };

    try {
      await updateClient(selectedClient.id_cliente, payload);
      setClients((prev) =>
        prev.map((client) =>
          client.id_cliente === selectedClient.id_cliente
            ? { ...client, ...payload }
            : client
        )
      );
      setShowEditModal(false);
      setSelectedClient(null);
      resetForm();
      toast.success("Cliente actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el cliente.");
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      await deleteClient(selectedClient.id_cliente);
      const updated = clients.filter((client) => client.id_cliente !== selectedClient.id_cliente);
      setClients(updated);
      try {
        localStorage.setItem("barber_clients_db", JSON.stringify(updated));
        const rawUsers = localStorage.getItem("barber_users_db");
        if (rawUsers) {
          const parsed = JSON.parse(rawUsers);
          const filteredUsers = parsed.filter(
            (u) =>
              (!selectedClient.id_usuario || Number(u.id_usuario) !== Number(selectedClient.id_usuario)) &&
              (!selectedClient.correo || u.correo?.toLowerCase() !== selectedClient.correo.toLowerCase())
          );
          localStorage.setItem("barber_users_db", JSON.stringify(filteredUsers));
        }
      } catch {}
      setShowDeleteModal(false);
      setSelectedClient(null);
      toast.success("Cliente eliminado.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el cliente.");
    }
  };

  const toggleStatus = async (clientId) => {
    try {
      await toggleClientStatus(clientId);
      setClients((prev) =>
        prev.map((client) =>
          client.id_cliente === clientId ? { ...client, estado: client.estado === 1 ? 0 : 1 } : client
        )
      );
      toast.success("Estado del cliente actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del cliente.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "REPORTE OFICIAL DE CLIENTES",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `clientes_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_cliente", width: 10, type: "number" },
        { header: "Nombre", key: "nombre", width: 20 },
        { header: "Apellido", key: "apellido", width: 20 },
        { header: "Correo Electrónico", key: "correo", width: 30 },
        { header: "Teléfono", key: "telefono", width: 18 },
        { header: "Dirección", key: "direccion", width: 30 },
        { header: "Nivel Fidelidad", key: "fidelidad", width: 16 },
        { header: "Estado", key: "estado_nombre", width: 14 }
      ],
      data: filteredClients.map((c) => ({
        ...c,
        telefono: c.telefono || "—",
        direccion: c.direccion || "—",
        fidelidad: c.nivel_fidelidad || "Nuevo",
        estado_nombre: c.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
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

  const openDeactivateModal = (client) => {
    setSelectedClient(client);
    setShowDeactivateModal(true);
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
    statusFilter,
    setStatusFilter,
    loyaltyFilter,
    setLoyaltyFilter,
    hasActiveFilters,
    resetFilters,
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
    handleExport,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal,
    stats
  };
}
