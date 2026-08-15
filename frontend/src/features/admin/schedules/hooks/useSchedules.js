import { useState } from "react";

const mockSchedules = [
  { id: 1, barber: "Carlos Rodríguez", day: "Lunes", startTime: "09:00", endTime: "18:00", status: "Activo", notes: "Horario regular" },
  { id: 2, barber: "Carlos Rodríguez", day: "Martes", startTime: "09:00", endTime: "18:00", status: "Activo", notes: "Horario regular" },
  { id: 3, barber: "Carlos Rodríguez", day: "Miércoles", startTime: "09:00", endTime: "17:00", status: "Activo", notes: "Sale temprano" },
  { id: 4, barber: "Miguel Ángel", day: "Lunes", startTime: "10:00", endTime: "19:00", status: "Activo" },
  { id: 5, barber: "Miguel Ángel", day: "Martes", startTime: "10:00", endTime: "19:00", status: "Activo" },
  { id: 6, barber: "Javier Torres", day: "Lunes", startTime: "08:00", endTime: "16:00", status: "Activo" },
  { id: 7, barber: "Javier Torres", day: "Sábado", startTime: "09:00", endTime: "14:00", status: "Activo", notes: "Medio día" },
  { id: 8, barber: "Luis Martínez", day: "Viernes", startTime: "14:00", endTime: "20:00", status: "Inactivo", notes: "Temporal" }
];

export const barbers = ["Carlos Rodríguez", "Miguel Ángel", "Javier Torres", "Luis Martínez"];
export const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const emptyForm = { barber: "Carlos Rodríguez", day: "Lunes", startTime: "09:00", endTime: "18:00", notes: "" };

export function useSchedules() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("barber");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredSchedules = schedules
    .filter(
      (schedule) =>
        schedule.barber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.day.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      id: Math.max(...schedules.map((s) => s.id)) + 1,
      barber: formData.barber,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "Activo",
      notes: formData.notes
    };
    setSchedules([...schedules, newSchedule]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedSchedule) return;
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === selectedSchedule.id
          ? { ...schedule, barber: formData.barber, day: formData.day, startTime: formData.startTime, endTime: formData.endTime, notes: formData.notes }
          : schedule
      )
    );
    setShowEditModal(false);
    setSelectedSchedule(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedSchedule) return;
    setSchedules(schedules.filter((schedule) => schedule.id !== selectedSchedule.id));
    setShowDeleteModal(false);
    setSelectedSchedule(null);
  };

  const toggleStatus = (scheduleId) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, status: schedule.status === "Activo" ? "Inactivo" : "Activo" } : schedule
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Barbero", "Día", "Hora Inicio", "Hora Fin", "Estado", "Notas"];
    const csvContent = [
      headers.join(","),
      ...filteredSchedules.map(
        (s) => `${s.id},"${s.barber}","${s.day}","${s.startTime}","${s.endTime}","${s.status}","${s.notes || ""}"`
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
      barber: schedule.barber,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      notes: schedule.notes || ""
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
    openDeleteModal
  };
}
