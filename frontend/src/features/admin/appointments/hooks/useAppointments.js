import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ESTADOS_CITA } from "../../../../shared/types/database";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from "../services/appointmentsService";

export function getRealClients() {
  try {
    const rawClients = localStorage.getItem("barber_clients_db");
    const rawUsers = localStorage.getItem("barber_users_db");
    const storedClients = rawClients ? JSON.parse(rawClients) : [];
    const storedUsers = rawUsers ? JSON.parse(rawUsers) : [];

    const clientList = [...storedClients];

    storedUsers
      .filter((u) => Number(u.id_rol) === 4)
      .forEach((u) => {
        const cleanEmail = (u.correo || "").trim().toLowerCase();
        const exists = clientList.some(
          (c) =>
            (c.id_usuario && Number(c.id_usuario) === Number(u.id_usuario)) ||
            (c.correo && c.correo.toLowerCase() === cleanEmail)
        );
        if (!exists) {
          const nextId = Math.max(...clientList.map((c) => Number(c.id_cliente) || 0), 0) + 1;
          clientList.push({
            id_cliente: nextId,
            id_usuario: u.id_usuario,
            nombre: (u.nombre || "").trim(),
            apellido: (u.apellido || "").trim(),
            correo: cleanEmail,
            telefono: u.telefono || "",
            direccion: u.direccion || "No especificada",
            nivel_fidelidad: "Nuevo",
            estado: 1
          });
        }
      });

    return clientList.map((c) => ({
      id_cliente: Number(c.id_cliente),
      id_usuario: c.id_usuario,
      nombre: `${c.nombre} ${c.apellido || ""}`.trim() || "Cliente",
      correo: c.correo || "",
      telefono: c.telefono || ""
    }));
  } catch (err) {
    console.error("Error al obtener clientes reales:", err);
    return [
      { id_cliente: 1, nombre: "Pedro López", correo: "cliente@example.com", telefono: "3001234567" }
    ];
  }
}

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

  const [clientsList, setClientsList] = useState(() => getRealClients());

  // ---- Helpers ----
  const getClientName = (id_cliente, apt) => {
    if (apt?.cliente_nombre && apt.cliente_nombre.trim() !== "" && apt.cliente_nombre !== "Cliente") {
      return apt.cliente_nombre.trim();
    }
    const currentClients = clientsList.length > 0 ? clientsList : getRealClients();
    const found = currentClients.find(
      (c) =>
        Number(c.id_cliente) === Number(id_cliente) ||
        (apt?.id_usuario && Number(c.id_usuario) === Number(apt.id_usuario)) ||
        (apt?.cliente_correo && c.correo && c.correo.toLowerCase() === apt.cliente_correo.toLowerCase())
    );
    if (found) return found.nombre;
    return "Cliente Registrado";
  };

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
      const clientName = getClientName(apt.id_cliente, apt).toLowerCase();
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

  const loadLocalAppointments = () => {
    try {
      const data = localStorage.getItem("barber_appointments_db");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAppointments(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAppointments(mockAppointments);
  };

  useEffect(() => {
    setClientsList(getRealClients());

    getAppointments()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
        } else {
          loadLocalAppointments();
        }
      })
      .catch((err) => {
        console.warn("[Appointments] Usando citas locales por fallback:", err.message);
        loadLocalAppointments();
      });
  }, []);

  // ---- CRUD ----
  const resetForm = () => setFormData({ ...emptyForm, fecha: selectedDate });

  const handleCreate = async () => {
    const svc = getServiceInfo(Number(formData.id_servicio));
    const payload = {
      id_cliente: Number(formData.id_cliente),
      id_barbero: Number(formData.id_barbero),
      servicios: [Number(formData.id_servicio)],
      id_servicio: Number(formData.id_servicio),
      fecha: formData.fecha,
      hora: formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora,
      estado: formData.estado || "Programada"
    };

    try {
      const created = await createAppointment(payload);
      const newAppointment = {
        ...payload,
        id_cita: created?.id_cita || Math.max(...appointments.map((a) => a.id_cita), 0) + 1,
        precio: svc.precio,
        fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      setAppointments((prev) => [newAppointment, ...prev]);
      setShowFormModal(false);
      resetForm();
      toast.success("Cita agendada exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al agendar la cita.");
    }
  };

  const handleEdit = async () => {
    if (!selectedAppointment) return;
    const svc = getServiceInfo(Number(formData.id_servicio));
    const payload = {
      id_cliente: Number(formData.id_cliente),
      id_barbero: Number(formData.id_barbero),
      servicios: [Number(formData.id_servicio)],
      id_servicio: Number(formData.id_servicio),
      fecha: formData.fecha,
      hora: formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora,
      estado: formData.estado
    };

    try {
      await updateAppointment(selectedAppointment.id_cita, payload);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id_cita === selectedAppointment.id_cita
            ? {
                ...apt,
                ...payload,
                precio: svc.precio
              }
            : apt
        )
      );
      setShowFormModal(false);
      setSelectedAppointment(null);
      resetForm();
      toast.success("Cita actualizada correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar la cita.");
    }
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
      fecha: appointment.fecha || new Date().toISOString().substring(0, 10),
      hora: appointment.hora ? String(appointment.hora).substring(0, 5) : "09:00",
      estado: appointment.estado || "Programada"
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
    clients: clientsList,
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
