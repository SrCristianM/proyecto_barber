import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ESTADOS_CITA } from "../../../../shared/types/database";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from "../services/appointmentsService";
import { getBarbers } from "../../barbers/services/barbersService";
import { getServices } from "../../services/services/servicesService";
import { getPackages } from "../../services/services/packagesService";
import { getClients } from "../../clients/services/clientsService";
import { getSchedules, getNovelties } from "../../schedules/services/schedulesService";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";
import { createNotification } from "../../../../shared/services/notificationService";
import {
  getLocalDateString,
  addDays,
  formatDateDisplay,
  getNowLocalDateTimeString
} from "../../../../shared/utils/dateUtils";

export { formatDateDisplay, getLocalDateString };

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
    return [];
  }
}

const mockBarbersList = [
  { id_barbero: 1, nombre: "Carlos Rodríguez" },
  { id_barbero: 2, nombre: "Esteban Mejía" },
  { id_barbero: 3, nombre: "Mateo Gómez" }
];

const mockServicesList = [
  { id_servicio: 1, nombre: "Corte Clásico", duracion_minutos: 30, precio: 15000 },
  { id_servicio: 2, nombre: "Corte + Barba", duracion_minutos: 45, precio: 25000 },
  { id_servicio: 3, nombre: "Afeitado Premium", duracion_minutos: 35, precio: 20000 },
  { id_servicio: 4, nombre: "Diseño y Color", duracion_minutos: 60, precio: 30000 }
];

const mockAppointments = [];

// Base de horarios cada 30 minutos alineado con la jornada de atención de la barbería
const BASE_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
];

const emptyForm = {
  id_cliente: "",
  id_barbero: "",
  id_servicio: "",
  fecha: getLocalDateString(),
  hora: "09:00",
  estado: "Programada"
};

export function useAppointments() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [barberFilter, setBarberFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [clientsList, setClientsList] = useState(() => getRealClients());
  const [barbersList, setBarbersList] = useState(mockBarbersList);
  const [servicesList, setServicesList] = useState(mockServicesList);
  const [packagesList, setPackagesList] = useState([]);
  const [schedulesList, setSchedulesList] = useState([]);
  const [noveltiesList, setNoveltiesList] = useState([]);

  // Generación reactiva de slots: incluye slots base y cualquier cita del día
  const timeSlots = useMemo(() => {
    const slotsSet = new Set(BASE_TIME_SLOTS);
    appointments
      .filter((a) => a.fecha === selectedDate && a.hora)
      .forEach((a) => {
        const timeStr = a.hora.substring(0, 5);
        if (timeStr) slotsSet.add(timeStr);
      });
    return Array.from(slotsSet).sort();
  }, [appointments, selectedDate]);

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
    if (found) return `${found.nombre} ${found.apellido || ""}`.trim() || found.nombre;
    return "Cliente Registrado";
  };

  const getBarberName = (id_barbero) =>
    barbersList.find((b) => Number(b.id_barbero) === Number(id_barbero))?.nombre ||
    mockBarbersList.find((b) => Number(b.id_barbero) === Number(id_barbero))?.nombre || "Barbero Desconocido";

  const getServiceInfo = (id_servicio) =>
    servicesList.find((s) => Number(s.id_servicio) === Number(id_servicio)) ||
    mockServicesList.find((s) => Number(s.id_servicio) === Number(id_servicio)) || {
      nombre: "Servicio General",
      duracion_minutos: 30,
      precio: 0
    };

  /** Devuelve cita para un barbero y slot en la fecha seleccionada */
  const getAppointmentForSlot = (id_barbero, timeStr) => {
    const timePrefix = timeStr.substring(0, 5);
    return appointments.find(
      (apt) =>
        Number(apt.id_barbero) === Number(id_barbero) &&
        apt.hora.substring(0, 5) === timePrefix &&
        apt.fecha === selectedDate &&
        apt.estado !== "Cancelada"
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
  const goToToday = () => setSelectedDate(getLocalDateString());
  const isToday = selectedDate === getLocalDateString();

  const loadLocalAppointments = () => {
    try {
      const data = localStorage.getItem("barber_appointments_db");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setAppointments(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAppointments([]);
  };

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((c) => ({
          id_cliente: Number(c.id_cliente),
          id_usuario: c.id_usuario,
          nombre: `${c.nombre} ${c.apellido || ""}`.trim() || "Cliente",
          correo: c.correo || "",
          telefono: c.telefono || "",
          documento: c.documento || ""
        }));
        setClientsList(mapped);
      } else {
        setClientsList(getRealClients());
      }
    } catch {
      setClientsList(getRealClients());
    }
  }, []);

  const fetchBarbers = useCallback(async () => {
    try {
      const data = await getBarbers();
      if (Array.isArray(data) && data.length > 0) {
        setBarbersList(data.map((b) => ({
          id_barbero: b.id_barbero,
          nombre: `${b.nombre} ${b.apellido || ""}`.trim(),
          documento: b.documento || ""
        })));
      }
    } catch {}
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const data = await getServices();
      if (Array.isArray(data) && data.length > 0) {
        setServicesList(data);
      }
    } catch {}
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      const data = await getPackages();
      if (Array.isArray(data) && data.length > 0) {
        setPackagesList(data);
      }
    } catch {}
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await getSchedules();
      if (Array.isArray(data)) {
        setSchedulesList(data);
      }
    } catch {}
  }, []);

  const fetchNovelties = useCallback(async () => {
    try {
      const data = await getNovelties();
      if (Array.isArray(data)) {
        setNoveltiesList(data);
      }
    } catch {}
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getAppointments();
      if (Array.isArray(data)) {
        // Combinar con almacenamiento local por resiliencia inmediata
        const localRaw = localStorage.getItem("barber_appointments_db");
        const local = localRaw ? JSON.parse(localRaw) : [];
        const map = new Map();
        data.forEach((a) => map.set(Number(a.id_cita), a));
        if (Array.isArray(local)) {
          local.forEach((a) => {
            if (a.id_cita && !map.has(Number(a.id_cita))) {
              map.set(Number(a.id_cita), a);
            }
          });
        }
        const merged = Array.from(map.values());
        setAppointments(merged);
        try {
          localStorage.setItem("barber_appointments_db", JSON.stringify(merged));
        } catch {}
      } else {
        loadLocalAppointments();
      }
    } catch (err) {
      console.warn("[Appointments] Usando citas locales por fallback:", err.message);
      loadLocalAppointments();
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchBarbers();
    fetchServices();
    fetchPackages();
    fetchSchedules();
    fetchNovelties();
    fetchAppointments();
  }, [fetchClients, fetchBarbers, fetchServices, fetchPackages, fetchSchedules, fetchNovelties, fetchAppointments]);

  useDataSync([SYNC_ENTITIES.CLIENTS, SYNC_ENTITIES.USERS], fetchClients);
  useDataSync([SYNC_ENTITIES.BARBERS], fetchBarbers);
  useDataSync([SYNC_ENTITIES.SERVICES], fetchServices);
  useDataSync([SYNC_ENTITIES.PACKAGES], fetchPackages);
  useDataSync([SYNC_ENTITIES.SCHEDULES], fetchSchedules);
  useDataSync([SYNC_ENTITIES.APPOINTMENTS], fetchAppointments);

  // ---- CRUD ----
  const resetForm = () => setFormData({ ...emptyForm, fecha: selectedDate });

  const handleCreate = async () => {
    const requestedTime = formData.hora.substring(0, 5);

    // Validación preventiva de colisión en frontend
    const conflict = appointments.find(
      (a) =>
        Number(a.id_barbero) === Number(formData.id_barbero) &&
        a.fecha === formData.fecha &&
        a.hora.substring(0, 5) === requestedTime &&
        a.estado !== "Cancelada"
    );

    if (conflict) {
      toast.error(`El horario ${requestedTime} ya se encuentra ocupado para este barbero.`);
      return;
    }

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
        fecha_registro: getNowLocalDateTimeString()
      };
      setAppointments((prev) => [newAppointment, ...prev]);
      try {
        const local = JSON.parse(localStorage.getItem("barber_appointments_db") || "[]");
        localStorage.setItem("barber_appointments_db", JSON.stringify([newAppointment, ...local]));
      } catch {}
      setShowFormModal(false);
      resetForm();

      // Notificaciones para Barbero, Cliente y Administración
      try {
        const clientName = getClientName(payload.id_cliente, payload);
        const barberName = getBarberName(payload.id_barbero);
        const barberObj = barbersList.find((b) => Number(b.id_barbero) === Number(payload.id_barbero));
        const clientObj = clientsList.find((c) => Number(c.id_cliente) === Number(payload.id_cliente));
        const horaDisplay = payload.hora ? payload.hora.substring(0, 5) : "";

        // 1. Notificación al Barbero
        createNotification({
          type: "appointment",
          title: "Nueva cita asignada",
          description: `Tienes una nueva cita agendada con ${clientName} para el ${payload.fecha} a las ${horaDisplay}.`,
          targetRole: 3,
          targetUserId: barberObj?.id_usuario || null,
          targetBarberId: Number(payload.id_barbero),
          route: "/barbero/agenda"
        });

        // 2. Notificación al Cliente
        if (clientObj?.id_usuario) {
          createNotification({
            type: "appointment",
            title: "¡Cita agendada por administración!",
            description: `Tu cita con ${barberName} para el ${payload.fecha} a las ${horaDisplay} ha sido confirmada.`,
            targetRole: 4,
            targetUserId: clientObj.id_usuario,
            route: "/portal/mis-citas"
          });
        }

        // 3. Notificación a Administración y Recepción
        createNotification({
          type: "appointment",
          title: "Cita agendada",
          description: `Cita programada: ${clientName} con ${barberName} para el ${payload.fecha} a las ${horaDisplay}.`,
          targetRole: [1, 2],
          route: "/dashboard/appointments"
        });
      } catch (errNotif) {
        console.warn("[useAppointments] Error despachando notificaciones:", errNotif);
      }

      notifyDataChange(SYNC_ENTITIES.APPOINTMENTS, newAppointment);
      toast.success("Cita agendada exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al agendar la cita.");
    }
  };

  const handleEdit = async () => {
    if (!selectedAppointment) return;
    const requestedTime = formData.hora.substring(0, 5);

    // Validación preventiva de colisión excluyendo la cita actual
    const conflict = appointments.find(
      (a) =>
        Number(a.id_barbero) === Number(formData.id_barbero) &&
        a.fecha === formData.fecha &&
        a.hora.substring(0, 5) === requestedTime &&
        a.estado !== "Cancelada" &&
        Number(a.id_cita) !== Number(selectedAppointment.id_cita)
    );

    if (conflict) {
      toast.error(`El horario ${requestedTime} ya se encuentra ocupado para este barbero.`);
      return;
    }

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
      try {
        const local = JSON.parse(localStorage.getItem("barber_appointments_db") || "[]");
        const updated = local.map((apt) =>
          apt.id_cita === selectedAppointment.id_cita ? { ...apt, ...payload, precio: svc.precio } : apt
        );
        localStorage.setItem("barber_appointments_db", JSON.stringify(updated));
      } catch {}
      setShowFormModal(false);
      setSelectedAppointment(null);
      resetForm();

      // Notificaciones ante cambios de estado o reprogramación
      try {
        const clientName = getClientName(payload.id_cliente, payload);
        const barberName = getBarberName(payload.id_barbero);
        const barberObj = barbersList.find((b) => Number(b.id_barbero) === Number(payload.id_barbero));
        const clientObj = clientsList.find((c) => Number(c.id_cliente) === Number(payload.id_cliente));
        const horaDisplay = payload.hora ? payload.hora.substring(0, 5) : "";

        if (payload.estado === "Cancelada") {
          createNotification({
            type: "appointment",
            title: "Cita cancelada",
            description: `La cita de ${clientName} para el ${payload.fecha} fue cancelada.`,
            targetRole: [1, 2],
            route: "/dashboard/appointments"
          });
          createNotification({
            type: "appointment",
            title: "Cita cancelada",
            description: `Tu cita con ${clientName} para el ${payload.fecha} ha sido cancelada.`,
            targetRole: 3,
            targetUserId: barberObj?.id_usuario || null,
            targetBarberId: Number(payload.id_barbero),
            route: "/barbero/agenda"
          });
          if (clientObj?.id_usuario) {
            createNotification({
              type: "appointment",
              title: "Cita cancelada",
              description: `Tu turno para el ${payload.fecha} fue cancelado por la barbería.`,
              targetRole: 4,
              targetUserId: clientObj.id_usuario,
              route: "/portal/mis-citas"
            });
          }
        } else if (payload.estado === "Reprogramada" || payload.fecha !== selectedAppointment.fecha || payload.hora !== selectedAppointment.hora) {
          createNotification({
            type: "appointment",
            title: "Cita reprogramada",
            description: `La cita de ${clientName} con ${barberName} fue reprogramada para el ${payload.fecha} a las ${horaDisplay}.`,
            targetRole: [1, 2],
            route: "/dashboard/appointments"
          });
          createNotification({
            type: "appointment",
            title: "Cita reprogramada",
            description: `Tu cita con ${clientName} fue reprogramada para el ${payload.fecha} a las ${horaDisplay}.`,
            targetRole: 3,
            targetUserId: barberObj?.id_usuario || null,
            targetBarberId: Number(payload.id_barbero),
            route: "/barbero/agenda"
          });
          if (clientObj?.id_usuario) {
            createNotification({
              type: "appointment",
              title: "Cita reprogramada",
              description: `Tu cita con ${barberName} ha sido reprogramada para el ${payload.fecha} a las ${horaDisplay}.`,
              targetRole: 4,
              targetUserId: clientObj.id_usuario,
              route: "/portal/mis-citas"
            });
          }
        } else if (payload.estado === "Completada") {
          if (clientObj?.id_usuario) {
            createNotification({
              type: "appointment",
              title: "¡Servicio completado!",
              description: `Tu visita en Tu Turno Barber ha finalizado. ¡Gracias por tu preferencia!`,
              targetRole: 4,
              targetUserId: clientObj.id_usuario,
              route: "/portal/mis-citas"
            });
          }
        }
      } catch (errNotif) {
        console.warn("[useAppointments] Error despachando notificaciones de edición:", errNotif);
      }

      notifyDataChange(SYNC_ENTITIES.APPOINTMENTS, { id_cita: selectedAppointment.id_cita, ...payload });
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
      fecha: appointment.fecha || getLocalDateString(),
      hora: appointment.hora ? String(appointment.hora).substring(0, 5) : "09:00",
      estado: appointment.estado || "Programada"
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const aptToDelete = appointments.find((a) => a.id_cita === id);
      await deleteAppointment(id);
      const updated = appointments.filter((apt) => apt.id_cita !== id);
      setAppointments(updated);
      try {
        localStorage.setItem("barber_appointments_db", JSON.stringify(updated));
      } catch {}

      if (aptToDelete) {
        try {
          const barberObj = barbersList.find((b) => Number(b.id_barbero) === Number(aptToDelete.id_barbero));
          const clientObj = clientsList.find((c) => Number(c.id_cliente) === Number(aptToDelete.id_cliente));

          createNotification({
            type: "appointment",
            title: "Cita eliminada",
            description: `La cita del ${aptToDelete.fecha} fue eliminada del sistema.`,
            targetRole: 3,
            targetUserId: barberObj?.id_usuario || null,
            targetBarberId: Number(aptToDelete.id_barbero),
            route: "/barbero/agenda"
          });
          if (clientObj?.id_usuario) {
            createNotification({
              type: "appointment",
              title: "Cita cancelada",
              description: `Tu cita programada para el ${aptToDelete.fecha} fue cancelada.`,
              targetRole: 4,
              targetUserId: clientObj.id_usuario,
              route: "/portal/mis-citas"
            });
          }
        } catch {}
      }

      notifyDataChange(SYNC_ENTITIES.APPOINTMENTS, { id_cita: id, deleted: true });
      toast.success("Cita eliminada correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar la cita.");
    }
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
    barbers: barbersList.length > 0 ? barbersList : mockBarbersList,
    clients: clientsList,
    services: servicesList.length > 0 ? servicesList : mockServicesList,
    packages: packagesList,
    schedules: schedulesList,
    novelties: noveltiesList,
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
    handleDelete,
    openCreateModal,
    openCreateFromSlot,
    openEditModal
  };
}
