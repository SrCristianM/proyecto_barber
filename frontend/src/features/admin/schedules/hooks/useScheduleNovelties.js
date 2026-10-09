import { useState, useEffect, useCallback } from "react";
import { ESTADOS_NOVEDAD } from "../../../../shared/types/database";
import { createNotification, dispatchNotificationUpdate } from "../../../../shared/services/notificationService";
import { getNovelties, createNovelty as createNoveltyApi, updateNoveltyStatus as updateNoveltyStatusApi } from "../services/schedulesService.js";
import { getBarbers } from "../../barbers/services/barbersService.js";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService.js";
import { getLocalDateString } from "../../../../shared/utils/dateUtils";

const STORAGE_KEY = "barber_novelties_db";

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Esteban Mejía" },
  { id_barbero: 3, nombre: "Mateo Gómez" }
];

export const NOVELTY_TYPES = [
  "Permiso",
  "Ausencia",
  "Cambio de turno",
  "Incapacidad",
  "Vacaciones",
  "Calamidad",
  "Solicitud de cancelación de cita",
  "Otro"
];

const emptyForm = {
  id_barbero: 1,
  tipo: "Permiso",
  fecha: getLocalDateString(),
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
  const [barbersList, setBarbersList] = useState(mockBarbersList);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchBarbersList = useCallback(async () => {
    try {
      const data = await getBarbers();
      if (Array.isArray(data) && data.length > 0) {
        setBarbersList(data.map((b) => ({
          id_barbero: b.id_barbero,
          nombre: `${b.nombre} ${b.apellido || ""}`.trim()
        })));
      }
    } catch {}
  }, []);

  const fetchFromApi = useCallback(async () => {
    try {
      const data = await getNovelties();
      if (Array.isArray(data)) {
        setNovelties(data);
        saveStoredNovelties(data);
      }
    } catch (e) {
      // Fallback a localStorage si el backend no responde
      setNovelties(getStoredNovelties());
    }
  }, []);

  useEffect(() => {
    fetchFromApi();
    fetchBarbersList();

    // Sondeo de tiempo real para que novedades enviadas desde la app móvil aparezcan de inmediato
    const interval = setInterval(() => {
      fetchFromApi();
    }, 4000);

    const handleSync = () => {
      fetchFromApi();
      fetchBarbersList();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("barber_notification_update", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("barber_notification_update", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [fetchFromApi, fetchBarbersList]);

  useDataSync([SYNC_ENTITIES.BARBERS], fetchBarbersList);
  useDataSync([SYNC_ENTITIES.SCHEDULES], fetchFromApi);

  const getBarberName = (id_barbero, novObj) => {
    if (novObj && novObj.barbero_nombre) {
      return novObj.barbero_nombre;
    }
    const b = barbersList.find((barber) => Number(barber.id_barbero) === Number(id_barbero)) ||
      mockBarbersList.find((barber) => barber.id_barbero === Number(id_barbero));
    return b ? b.nombre : "Sin Barbero";
  };

  const filteredNovelties = novelties.filter((nov) => {
    const barberName = getBarberName(nov.id_barbero, nov).toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      barberName.includes(search) ||
      (nov.descripcion || "").toLowerCase().includes(search) ||
      (nov.tipo || "").toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || nov.estado === statusFilter;
    const matchesType = typeFilter === "all" || nov.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const payload = {
      id_barbero: Number(formData.id_barbero),
      tipo: formData.tipo,
      fecha: formData.fecha,
      descripcion: formData.descripcion ? formData.descripcion.trim() : ""
    };

    try {
      await createNoveltyApi(payload);
      await fetchFromApi();
    } catch (e) {
      console.warn("Fallo creando novedad vía API, usando local:", e);
      const newNovelty = {
        id_novedad: Math.max(...novelties.map((n) => n.id_novedad || 0), 0) + 1,
        id_barbero: payload.id_barbero,
        tipo: payload.tipo,
        fecha: payload.fecha,
        descripcion: payload.descripcion,
        estado: "Pendiente",
        fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      const updated = [newNovelty, ...novelties];
      setNovelties(updated);
      saveStoredNovelties(updated);
    }

    setShowCreateModal(false);
    resetForm();
    notifyDataChange(SYNC_ENTITIES.SCHEDULES);
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
    notifyDataChange(SYNC_ENTITIES.SCHEDULES);
  };

  const handleDelete = () => {
    if (!selectedNovelty) return;
    const updated = novelties.filter((nov) => nov.id_novedad !== selectedNovelty.id_novedad);
    setNovelties(updated);
    saveStoredNovelties(updated);
    setShowDeleteModal(false);
    setSelectedNovelty(null);
    notifyDataChange(SYNC_ENTITIES.SCHEDULES);
  };

  const changeStatus = async (id, newStatus) => {
    const targetNov = novelties.find((nov) => nov.id_novedad === id);
    const updated = novelties.map((nov) =>
      nov.id_novedad === id ? { ...nov, estado: newStatus } : nov
    );
    setNovelties(updated);
    saveStoredNovelties(updated);

    try {
      await updateNoveltyStatusApi(id, newStatus);
      await fetchFromApi();
    } catch (err) {
      console.warn("Error sincronizando cambio de estado con API:", err);
    }
    notifyDataChange(SYNC_ENTITIES.SCHEDULES);

    // Despachar notificación al Barbero
    if (targetNov) {
      try {
        createNotification({
          type: "schedule",
          title: `Novedad de horario ${newStatus}`,
          description: `Tu solicitud de ${targetNov.tipo} para el ${targetNov.fecha} ha sido ${newStatus} por la administración.`,
          targetRole: 3,
          targetUserId: 4,
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
    barbers: barbersList.length > 0 ? barbersList : mockBarbersList,
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
