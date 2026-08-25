import { useState } from "react";
import { ESTADOS_NOVEDAD } from "../../../../shared/types/database";

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Miguel Ángel" },
  { id_barbero: 3, nombre: "Javier Torres" },
  { id_barbero: 4, nombre: "Luis Martínez" }
];

export const NOVELTY_TYPES = ["Ausencia", "Cambio de turno", "Permiso", "Otro"];

const mockNovelties = [
  {
    id_novedad: 1,
    id_barbero: 1,
    tipo: "Permiso",
    fecha: "2026-08-28",
    descripcion: "Cita médica en la mañana (08:00 - 12:00)",
    estado: "Aprobado",
    fecha_registro: "2026-08-20 09:30:00"
  },
  {
    id_novedad: 2,
    id_barbero: 2,
    tipo: "Cambio de turno",
    fecha: "2026-08-29",
    descripcion: "Cambio de turno con Carlos para el sábado en la tarde",
    estado: "Pendiente",
    fecha_registro: "2026-08-22 14:15:00"
  },
  {
    id_novedad: 3,
    id_barbero: 3,
    tipo: "Ausencia",
    fecha: "2026-09-01",
    descripcion: "Asuntos personales urgentes fuera de la ciudad",
    estado: "Pendiente",
    fecha_registro: "2026-08-23 11:00:00"
  },
  {
    id_novedad: 4,
    id_barbero: 4,
    tipo: "Otro",
    fecha: "2026-08-15",
    descripcion: "Capacitación técnica de nuevas técnicas de corte",
    estado: "Aprobado",
    fecha_registro: "2026-08-10 16:00:00"
  },
  {
    id_novedad: 5,
    id_barbero: 1,
    tipo: "Ausencia",
    fecha: "2026-08-05",
    descripcion: "Solicitud sin previo aviso fuera de los tiempos permitidos",
    estado: "Rechazado",
    fecha_registro: "2026-08-04 18:20:00"
  }
];

const emptyForm = {
  id_barbero: 1,
  tipo: "Permiso",
  fecha: new Date().toISOString().split("T")[0],
  descripcion: "",
  estado: "Pendiente"
};

export function useScheduleNovelties() {
  const [novelties, setNovelties] = useState(mockNovelties);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const getBarberName = (id_barbero) => {
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
      id_novedad: Math.max(...novelties.map((n) => n.id_novedad), 0) + 1,
      id_barbero: Number(formData.id_barbero),
      tipo: formData.tipo,
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim(),
      estado: formData.estado || "Pendiente",
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setNovelties([newNovelty, ...novelties]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedNovelty) return;
    setNovelties(
      novelties.map((nov) =>
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
      )
    );
    setShowEditModal(false);
    setSelectedNovelty(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedNovelty) return;
    setNovelties(novelties.filter((nov) => nov.id_novedad !== selectedNovelty.id_novedad));
    setShowDeleteModal(false);
    setSelectedNovelty(null);
  };

  const changeStatus = (id, newStatus) => {
    setNovelties(
      novelties.map((nov) =>
        nov.id_novedad === id ? { ...nov, estado: newStatus } : nov
      )
    );
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
    aprobadas: novelties.filter((n) => n.estado === "Aprobado").length,
    rechazadas: novelties.filter((n) => n.estado === "Rechazado").length
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
