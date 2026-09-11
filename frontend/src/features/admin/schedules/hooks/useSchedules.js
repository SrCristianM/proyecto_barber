import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DIAS_SEMANA } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus
} from "../services/schedulesService";
import { getBarbers } from "../../barbers/services/barbersService";

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" }
];

const mockSchedules = [];

export const barbers = mockBarbersList;
export const daysOfWeek = DIAS_SEMANA;

const emptyForm = {
  id_barbero: 1,
  dias_semana: ["Lunes"],
  hora_inicio: "09:00",
  hora_fin: "18:00",
  fecha_inicio: null,
  fecha_fin: null
};

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [barbersList, setBarbersList] = useState(mockBarbersList);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [barberFilter, setBarberFilter] = useState("all"); // 'all' | id_barbero
  const [dayFilter, setDayFilter] = useState("all"); // 'all' | 'Lunes' ...
  const [sortField, setSortField] = useState("id_barbero");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    getSchedules()
      .then((data) => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      })
      .catch((err) => {
        console.warn("[Schedules] Usando horarios locales por fallback:", err.message);
      });

    getBarbers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBarbersList(
            data.map((b) => ({
              id_barbero: b.id_barbero,
              nombre: `${b.nombre} ${b.apellido || ""}`.trim()
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("[Schedules] Usando barberos locales para horarios:", err.message);
      });
  }, []);

  const getBarberName = (id_barbero) => {
    const b = barbersList.find((barber) => barber.id_barbero === Number(id_barbero));
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
      const dias = (schedule.dias_semana || []).join(", ");
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        barberName.toLowerCase().includes(search) ||
        dias.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && schedule.estado === 1) ||
        (statusFilter === "0" && schedule.estado === 0);

      const matchesBarber =
        barberFilter === "all" || String(schedule.id_barbero) === String(barberFilter);

      const matchesDay =
        dayFilter === "all" || (schedule.dias_semana || []).includes(dayFilter);

      return matchesSearch && matchesStatus && matchesBarber && matchesDay;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "all" || barberFilter !== "all" || dayFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBarberFilter("all");
    setDayFilter("all");
  };

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const dias = formData.dias_semana || [];
    if (dias.length === 0) {
      toast.error("Debes seleccionar al menos un día de la semana.");
      return;
    }

    const payload = {
      id_barbero: Number(formData.id_barbero),
      dias_semana: dias,
      hora_inicio: formData.hora_inicio.length === 5 ? `${formData.hora_inicio}:00` : formData.hora_inicio,
      hora_fin: formData.hora_fin.length === 5 ? `${formData.hora_fin}:00` : formData.hora_fin,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_fin: formData.fecha_fin || null,
      estado: 1
    };

    try {
      const res = await createSchedule(payload);
      const newSchedule = {
        ...payload,
        id_horario: res?.id_horario || Math.max(...schedules.map((s) => s.id_horario), 0) + 1
      };
      setSchedules((prev) => [newSchedule, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success("Horario asignado exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al crear el horario.");
    }
  };

  const handleEdit = async () => {
    if (!selectedSchedule) return;
    const payload = {
      id_barbero: Number(formData.id_barbero),
      dias_semana: formData.dias_semana || [],
      hora_inicio: formData.hora_inicio.length === 5 ? `${formData.hora_inicio}:00` : formData.hora_inicio,
      hora_fin: formData.hora_fin.length === 5 ? `${formData.hora_fin}:00` : formData.hora_fin,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_fin: formData.fecha_fin || null
    };

    try {
      await updateSchedule(selectedSchedule.id_horario, payload);
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id_horario === selectedSchedule.id_horario
            ? { ...schedule, ...payload }
            : schedule
        )
      );
      setShowEditModal(false);
      setSelectedSchedule(null);
      resetForm();
      toast.success("Horario modificado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el horario.");
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await deleteSchedule(selectedSchedule.id_horario);
      setSchedules((prev) => prev.filter((schedule) => schedule.id_horario !== selectedSchedule.id_horario));
      setShowDeleteModal(false);
      setSelectedSchedule(null);
      toast.success("Horario eliminado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el horario.");
    }
  };

  const toggleStatus = async (scheduleId) => {
    try {
      await toggleScheduleStatus(scheduleId);
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id_horario === scheduleId ? { ...schedule, estado: schedule.estado === 1 ? 0 : 1 } : schedule
        )
      );
      toast.success("Estado de horario actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del horario.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      filename: "reporte_horarios",
      sheetName: "Horarios",
      title: "Programación y Asignación de Horarios Semanales",
      subtitle: "Turnos de atención y disponibilidad de barberos",
      columns: [
        { header: "ID", key: "id_horario", type: "number", width: 60, align: "center" },
        { header: "Barbero", key: "barberoNombre", width: 160 },
        { header: "Días de Atención", key: "diasTexto", width: 220 },
        { header: "Hora Inicio", key: "hora_inicio", width: 100, align: "center" },
        { header: "Hora Fin", key: "hora_fin", width: 100, align: "center" },
        { header: "Vigencia / Período", key: "vigenciaTexto", width: 180, align: "center" },
        { header: "Estado", key: "estadoLabel", type: "status", width: 90, align: "center" }
      ],
      data: filteredSchedules.map((s) => ({
        ...s,
        barberoNombre: getBarberName(s.id_barbero),
        diasTexto: (s.dias_semana || []).join(", "),
        vigenciaTexto: s.fecha_inicio || s.fecha_fin ? `${s.fecha_inicio || 'Inicio'} a ${s.fecha_fin || 'Indefinido'}` : "Permanente",
        estadoLabel: s.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      id_barbero: schedule.id_barbero,
      dias_semana: schedule.dias_semana || [],
      hora_inicio: schedule.hora_inicio ? String(schedule.hora_inicio).substring(0, 5) : "08:00",
      hora_fin: schedule.hora_fin ? String(schedule.hora_fin).substring(0, 5) : "18:00",
      fecha_inicio: schedule.fecha_inicio || null,
      fecha_fin: schedule.fecha_fin || null
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

  const openDeactivateModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeactivateModal(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    barberFilter,
    setBarberFilter,
    dayFilter,
    setDayFilter,
    hasActiveFilters,
    resetFilters,
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
    showDeactivateModal,
    setShowDeactivateModal,
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
    openDeactivateModal,
    getBarberName,
    schedules
  };
}
