import { useState } from "react";
import { ESTADOS_CITA } from "../../../../shared/types/database";

const mockClientsList = [
  { id_cliente: 1, nombre: "Juan Pérez" },
  { id_cliente: 2, nombre: "María García" },
  { id_cliente: 3, nombre: "Pedro López" },
  { id_cliente: 4, nombre: "Ana Torres" },
  { id_cliente: 5, nombre: "Carlos Ruiz" }
];

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Miguel Ángel" },
  { id_barbero: 3, nombre: "Javier Torres" },
  { id_barbero: 4, nombre: "Luis Martínez" }
];

const mockServicesList = [
  { id_servicio: 1, nombre: "Corte Clásico", duracion_minutos: 30, precio: 15000 },
  { id_servicio: 2, nombre: "Corte + Barba", duracion_minutos: 45, precio: 25000 },
  { id_servicio: 3, nombre: "Afeitado Premium", duracion_minutos: 35, precio: 20000 },
  { id_servicio: 4, nombre: "Diseño y Color", duracion_minutos: 60, precio: 30000 }
];

const TODAY = new Date().toISOString().split("T")[0];

const mockAppointments = [
  { id_cita: 1, id_cliente: 1, id_barbero: 1, id_servicio: 1, fecha: TODAY, hora: "09:00:00", estado: "Programada", precio: 15000, fecha_registro: "2026-06-01 08:00:00" },
  { id_cita: 2, id_cliente: 2, id_barbero: 2, id_servicio: 2, fecha: TODAY, hora: "09:00:00", estado: "Completada", precio: 25000, fecha_registro: "2026-06-01 10:00:00" },
  { id_cita: 3, id_cliente: 3, id_barbero: 3, id_servicio: 3, fecha: TODAY, hora: "10:00:00", estado: "Programada", precio: 20000, fecha_registro: "2026-06-01 11:30:00" },
  { id_cita: 4, id_cliente: 4, id_barbero: 4, id_servicio: 4, fecha: TODAY, hora: "11:00:00", estado: "Reprogramada", precio: 30000, fecha_registro: "2026-06-01 14:00:00" },
  { id_cita: 5, id_cliente: 5, id_barbero: 1, id_servicio: 1, fecha: TODAY, hora: "14:00:00", estado: "Programada", precio: 15000, fecha_registro: "2026-06-01 16:00:00" }
];

const timeSlots = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);

const emptyForm = {
  id_cliente: "",
  id_barbero: "",
  id_servicio: "",
  fecha: TODAY,
  hora: "09:00",
  estado: "Programada"
};

/** Avanza/retrocede una fecha ISO string en N días */
function addDays(isoDate, n) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Formatea fecha ISO a texto legible en español */
export function formatDateDisplay(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function useAppointments() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [barberFilter, setBarberFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // ---- Helpers ----
  const getClientName = (id_cliente) =>
    mockClientsList.find((c) => c.id_cliente === Number(id_cliente))?.nombre || "Cliente Desconocido";

  const getBarberName = (id_barbero) =>
    mockBarbersList.find((b) => b.id_barbero === Number(id_barbero))?.nombre || "Barbero Desconocido";

  const getServiceInfo = (id_servicio) =>
    mockServicesList.find((s) => s.id_servicio === Number(id_servicio)) || {
      nombre: "Servicio General",
      duracion_minutos: 30,
      precio: 0
    };

  /** Devuelve cita para un barbero y slot en la fecha seleccionada */
  const getAppointmentForSlot = (id_barbero, timeStr) => {
    const timePrefix = timeStr.substring(0, 5);
    return appointments.find(
      (apt) =>
        apt.id_barbero === Number(id_barbero) &&
        apt.hora.substring(0, 5) === timePrefix &&
        apt.fecha === selectedDate
    );
  };

  /** Citas del día seleccionado filtradas */
  const appointmentsForDate = appointments
    .filter((a) => a.fecha === selectedDate)
    .filter((apt) => {
      const clientName = getClientName(apt.id_cliente).toLowerCase();
      const barberName = getBarberName(apt.id_barbero).toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        search === "" ||
        clientName.includes(search) ||
        barberName.includes(search);

      const matchesStatus = statusFilter === "all" || apt.estado === statusFilter;
      const matchesBarber = barberFilter === "all" || String(apt.id_barbero) === String(barberFilter);

      return matchesSearch && matchesStatus && matchesBarber;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || barberFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBarberFilter("all");
  };

  // ---- Navegación de fechas ----
  const goToPrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const goToNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const goToToday = () => setSelectedDate(TODAY);
  const isToday = selectedDate === TODAY;

  // ---- CRUD ----
  const resetForm = () => setFormData({ ...emptyForm, fecha: selectedDate });

  const handleCreate = () => {
    const svc = getServiceInfo(Number(formData.id_servicio));
    const newAppointment = {
      id_cita: Math.max(...appointments.map((a) => a.id_cita), 0) + 1,
      id_cliente: Number(formData.id_cliente),
      id_barbero: Number(formData.id_barbero),
      id_servicio: Number(formData.id_servicio),
      fecha: formData.fecha,
      hora: formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora,
      estado: formData.estado || "Programada",
      precio: svc.precio,
      fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setAppointments([...appointments, newAppointment]);
    setShowFormModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedAppointment) return;
    const svc = getServiceInfo(Number(formData.id_servicio));
    setAppointments(
      appointments.map((apt) =>
        apt.id_cita === selectedAppointment.id_cita
          ? {
              ...apt,
              id_cliente: Number(formData.id_cliente),
              id_barbero: Number(formData.id_barbero),
              id_servicio: Number(formData.id_servicio),
              fecha: formData.fecha,
              hora: formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora,
              estado: formData.estado,
              precio: svc.precio
            }
          : apt
      )
    );
    setShowFormModal(false);
    setSelectedAppointment(null);
    resetForm();
  };

  /** Abrir modal de nueva cita con fecha/hora/barbero pre-llenados desde el calendario */
  const openCreateFromSlot = (barbero, time) => {
    setSelectedAppointment(null);
    setFormData({
      ...emptyForm,
      fecha: selectedDate,
      hora: time,
      id_barbero: barbero?.id_barbero || ""
    });
    setShowFormModal(true);
  };

  const openCreateModal = () => {
    setSelectedAppointment(null);
    setFormData({ ...emptyForm, fecha: selectedDate });
    setShowFormModal(true);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      id_cliente: appointment.id_cliente,
      id_barbero: appointment.id_barbero,
      id_servicio: appointment.id_servicio,
      fecha: appointment.fecha,
      hora: appointment.hora.substring(0, 5),
      estado: appointment.estado
    });
    setShowFormModal(true);
  };

  return {
    appointments,
    appointmentsForDate,
    setAppointments,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    barberFilter,
    setBarberFilter,
    hasActiveFilters,
    resetFilters,
    isToday,
    goToPrevDay,
    goToNextDay,
    goToToday,
    formatDateDisplay,
    timeSlots,
    barbers: mockBarbersList,
    clients: mockClientsList,
    services: mockServicesList,
    availableStatuses: ESTADOS_CITA,
    getClientName,
    getBarberName,
    getServiceInfo,
    getAppointmentForSlot,
    showFormModal,
    setShowFormModal,
    selectedAppointment,
    setSelectedAppointment,
    formData,
    setFormData,
    resetForm,
    handleCreate,
    handleEdit,
    openCreateModal,
    openCreateFromSlot,
    openEditModal
  };
}
