import { useState } from "react";
import { DIAS_SEMANA } from "../../../../shared/types/database";

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Miguel Ángel" },
  { id_barbero: 3, nombre: "Javier Torres" },
  { id_barbero: 4, nombre: "Luis Martínez" }
];

const mockSchedules = [
  { id_horario: 1, id_barbero: 1, dia_semana: "Lunes", hora_inicio: "09:00:00", hora_fin: "18:00:00", estado: 1 },
  { id_horario: 2, id_barbero: 1, dia_semana: "Martes", hora_inicio: "09:00:00", hora_fin: "18:00:00", estado: 1 },
  { id_horario: 3, id_barbero: 1, dia_semana: "Miercoles", hora_inicio: "09:00:00", hora_fin: "17:00:00", estado: 1 },
  { id_horario: 4, id_barbero: 2, dia_semana: "Lunes", hora_inicio: "10:00:00", hora_fin: "19:00:00", estado: 1 },
  { id_horario: 5, id_barbero: 2, dia_semana: "Martes", hora_inicio: "10:00:00", hora_fin: "19:00:00", estado: 1 },
  { id_horario: 6, id_barbero: 3, dia_semana: "Lunes", hora_inicio: "08:00:00", hora_fin: "16:00:00", estado: 1 },
  { id_horario: 7, id_barbero: 3, dia_semana: "Sabado", hora_inicio: "09:00:00", hora_fin: "14:00:00", estado: 1 },
  { id_horario: 8, id_barbero: 4, dia_semana: "Viernes", hora_inicio: "14:00:00", hora_fin: "20:00:00", estado: 0 }
];

export const barbers = mockBarbersList;
export const daysOfWeek = DIAS_SEMANA;

const emptyForm = {
  id_barbero: 1,
  dia_semana: "Lunes",
  hora_inicio: "09:00",
  hora_fin: "18:00"
};

export function useSchedules() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id_barbero");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [formData, setFormData] = useState(emptyForm);

  const getBarberName = (id_barbero) => {
    const b = mockBarbersList.find((barber) => barber.id_barbero === Number(id_barbero));
    return b ? b.nombre : "Sin Barbero";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredSchedules = schedules
    .filter((schedule) => {
      const barberName = getBarberName(schedule.id_barbero);
      return (
        barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.dia_semana.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newSchedule = {
      id_horario: Math.max(...schedules.map((s) => s.id_horario), 0) + 1,
      id_barbero: Number(formData.id_barbero),
      dia_semana: formData.dia_semana,
      hora_inicio: formData.hora_inicio.length === 5 ? `${formData.hora_inicio}:00` : formData.hora_inicio,
      hora_fin: formData.hora_fin.length === 5 ? `${formData.hora_fin}:00` : formData.hora_fin,
      estado: 1
    };
    setSchedules([...schedules, newSchedule]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedSchedule) return;
    setSchedules(
      schedules.map((schedule) =>
        schedule.id_horario === selectedSchedule.id_horario
          ? {
              ...schedule,
              id_barbero: Number(formData.id_barbero),
              dia_semana: formData.dia_semana,
              hora_inicio: formData.hora_inicio.length === 5 ? `${formData.hora_inicio}:00` : formData.hora_inicio,
              hora_fin: formData.hora_fin.length === 5 ? `${formData.hora_fin}:00` : formData.hora_fin
            }
          : schedule
      )
    );
    setShowEditModal(false);
    setSelectedSchedule(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedSchedule) return;
    setSchedules(schedules.filter((schedule) => schedule.id_horario !== selectedSchedule.id_horario));
    setShowDeleteModal(false);
    setSelectedSchedule(null);
  };

  const toggleStatus = (scheduleId) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id_horario === scheduleId ? { ...schedule, estado: schedule.estado === 1 ? 0 : 1 } : schedule
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Barbero", "Día", "Hora Inicio", "Hora Fin", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredSchedules.map(
        (s) => `${s.id_horario},"${getBarberName(s.id_barbero)}","${s.dia_semana}","${s.hora_inicio}","${s.hora_fin}","${s.estado === 1 ? "Activo" : "Inactivo"}"`
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `horarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      id_barbero: schedule.id_barbero,
      dia_semana: schedule.dia_semana,
      hora_inicio: schedule.hora_inicio.substring(0, 5),
      hora_fin: schedule.hora_fin.substring(0, 5)
    });
    setShowEditModal(true);
  };

  const openDetailModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const openDeleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  const onSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    onSearchChange,
    sortField,
    sortDir,
    handleSort,
    paginatedSchedules,
    filteredSchedules,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
    selectedSchedule,
    setSelectedSchedule,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    getBarberName
  };
}
