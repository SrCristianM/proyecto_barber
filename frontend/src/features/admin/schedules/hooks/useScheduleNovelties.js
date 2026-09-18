import { useState, useEffect } from "react";
import { ESTADOS_NOVEDAD } from "../../../../shared/types/database";
import { createNotification, dispatchNotificationUpdate } from "../../../../shared/services/notificationService";

const STORAGE_KEY = "barber_novelties_db";

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Miguel Ángel" },
  { id_barbero: 3, nombre: "Javier Torres" },
  { id_barbero: 4, nombre: "Luis Martínez" }
];

export const NOVELTY_TYPES = ["Ausencia", "Cambio de turno", "Permiso", "Otro"];

const emptyForm = {
  id_barbero: 1,
  tipo: "Permiso",
  fecha: new Date().toISOString().split("T")[0],
  descripcion: "",
  estado: "Pendiente"
};

function getStoredNovelties() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredNovelties(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    dispatchNotificationUpdate();
  } catch (err) {
    console.warn("Error guardando novedades:", err);
  }
}

export function useScheduleNovelties() {
  const [novelties, setNovelties] = useState(getStoredNovelties);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const handleSync = () => {
      setNovelties(getStoredNovelties());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("barber_notification_update", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("barber_notification_update", handleSync);
    };
  }, []);

  const getBarberName = (id_barbero) => {
    try {
      const rawBarbers = localStorage.getItem("barber_barbers_db");
      const storedBarbers = rawBarbers ? JSON.parse(rawBarbers) : mockBarbersList;
      const b = storedBarbers.find((barber) => Number(barber.id_barbero) === Number(id_barbero));
      if (b) return `${b.nombre} ${b.apellido || ""}`.trim();
    } catch {}
    const b = mockBarbersList.find((barber) => barber.id_barbero === Number(id_barbero));
    return b ? b.nombre : "Sin Barbero";
  };

  const filteredNovelties = novelties.filter((nov) => {
    const barberName = getBarberName(nov.id_barbero).toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      barberName.includes(search) ||
      (nov.descripcion || "").toLowerCase().includes(search) ||
      nov.tipo.toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || nov.estado === statusFilter;
    const matchesType = typeFilter === "all" || nov.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newNovelty = {
      id_novedad: Math.max(...novelties.map((n) => n.id_novedad || 0), 0) + 1,
      id_barbero: Number(formData.id_barbero),
      tipo: formData.tipo,
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim(),
      estado: formData.estado || "Pendiente",
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    const updated = [newNovelty, ...novelties];
    setNovelties(updated);
    saveStoredNovelties(updated);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedNovelty) return;
    const updated = novelties.map((nov) =>
      nov.id_novedad === selectedNovelty.id_novedad
        ? {
            ...nov,
            id_barbero: Number(formData.id_barbero),
            tipo: formData.tipo,
            fecha: formData.fecha,
            descripcion: formData.descripcion.trim(),
            estado: formData.estado
          }
        : nov
    );
    setNovelties(updated);
    saveStoredNovelties(updated);
    setShowEditModal(false);
    setSelectedNovelty(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedNovelty) return;
    const updated = novelties.filter((nov) => nov.id_novedad !== selectedNovelty.id_novedad);
    setNovelties(updated);
    saveStoredNovelties(updated);
    setShowDeleteModal(false);
    setSelectedNovelty(null);
  };

  const changeStatus = (id, newStatus) => {
    const targetNov = novelties.find((nov) => nov.id_novedad === id);
    const updated = novelties.map((nov) =>
      nov.id_novedad === id ? { ...nov, estado: newStatus } : nov
    );
    setNovelties(updated);
    saveStoredNovelties(updated);

    // Despachar notificación al Barbero
    if (targetNov) {
      try {
        createNotification({
          type: "schedule",
          title: `Novedad de horario ${newStatus}`,
          description: `Tu solicitud de ${targetNov.tipo} para el ${targetNov.fecha} ha sido ${newStatus} por la administración.`,
          targetRole: 3,
          targetUserId: 4, // ID de usuario estándar del barbero
          route: "/barbero/novedades"
        });
      } catch (err) {
        console.warn("Error al notificar al barbero:", err);
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (novelty) => {
    setSelectedNovelty(novelty);
    setFormData({
      id_barbero: novelty.id_barbero,
      tipo: novelty.tipo,
      fecha: novelty.fecha,
      descripcion: novelty.descripcion || "",
      estado: novelty.estado
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (novelty) => {
    setSelectedNovelty(novelty);
    setShowDeleteModal(true);
  };

  const stats = {
    total: novelties.length,
    pendientes: novelties.filter((n) => n.estado === "Pendiente").length,
    aprobadas: novelties.filter((n) => n.estado === "Aprobado" || n.estado === "Aprobada").length,
    rechazadas: novelties.filter((n) => n.estado === "Rechazado" || n.estado === "Rechazada").length
  };

  return {
    novelties,
    filteredNovelties,
    barbers: mockBarbersList,
    noveltyTypes: NOVELTY_TYPES,
    noveltyStatuses: ESTADOS_NOVEDAD,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedNovelty,
    setSelectedNovelty,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    changeStatus,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    getBarberName,
    stats
  };
}
