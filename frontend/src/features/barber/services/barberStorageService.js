import {
  getNovelties as getNoveltiesApi,
  createNovelty as createNoveltyApi,
  updateNoveltyStatus as updateNoveltyStatusApi,
  getSchedules as getSchedulesApi
} from "../../admin/schedules/services/schedulesService.js";
import { getAppointments as getAppointmentsApi } from "../../admin/appointments/services/appointmentsService.js";
import { getPackages as getPackagesApi } from "../../admin/services/services/packagesService.js";
/**
 * @file barberStorageService.js
 * Servicio centralizado de datos y persistencia para el Portal del Barbero.
 * Conectado con la arquitectura existente en localStorage (citas, barberos, horarios, servicios, paquetes, novedades)
 * garantizando que el Barbero acceda únicamente a sus propios datos sin permisos administrativos.
 */

import { getCurrentUser, updateUserProfile } from "../../auth/services/authService.js";
import { updateBarber as updateBarberApi } from "../../admin/barbers/services/barbersService.js";
import { createNotification } from "../../../shared/services/notificationService.js";
import { notifyDataChange, SYNC_ENTITIES } from "../../../shared/services/dataSyncService.js";

const STORAGE_KEYS = {
  APPOINTMENTS: "barber_appointments_db",
  CLIENTS: "barber_clients_db",
  SERVICES: "barber_services_db",
  PACKAGES: "barber_packages_db",
  BARBERS: "barber_barbers_db",
  SCHEDULES: "barber_schedules_db",
  NOVELTIES: "barber_novelties_db"
};

import { getLocalDateString } from "../../../shared/utils/dateUtils.js";

const TODAY = getLocalDateString();

const INITIAL_BARBERS = [
  {
    id_barbero: 1,
    id_usuario: 4,
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "barbero@tuturnobarber.com",
    telefono: "+57 302 345 6789",
    especialidad: "Corte Clásico & Fade",
    imagen_url: null,
    estado: 1
  }
];

const INITIAL_SERVICES = [];

const INITIAL_PACKAGES = [];

const INITIAL_SCHEDULES = [
  {
    id_horario: 1,
    id_barbero: 1,
    dia_semana: "Lunes",
    hora_inicio: "09:00:00",
    hora_fin: "18:00:00",
    fecha_inicio_vigencia: "2026-01-01",
    fecha_fin_vigencia: "2026-12-31",
    estado: 1,
    barbero_nombre: "Carlos Rodríguez"
  },
  {
    id_horario: 2,
    id_barbero: 1,
    dia_semana: "Martes",
    hora_inicio: "09:00:00",
    hora_fin: "18:00:00",
    fecha_inicio_vigencia: "2026-01-01",
    fecha_fin_vigencia: "2026-12-31",
    estado: 1,
    barbero_nombre: "Carlos Rodríguez"
  }
];

const INITIAL_CLIENTS = [];

const INITIAL_BARBER_APPOINTMENTS = [];

const INITIAL_NOVELTIES = [];

/** Helper para leer/inicializar localStorage */
function getOrInit(key, initialData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialData;
  } catch (err) {
    console.error(`Error leyendo ${key} de localStorage:`, err);
    return initialData;
  }
}

/** Helper para guardar en localStorage */
function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error guardando ${key} en localStorage:`, err);
  }
}

// ==========================================
// 1. PERFIL DEL BARBERO AUTENTICADO
// ==========================================

export function getCurrentBarberProfile() {
  const user = getCurrentUser();
  const barbers = getOrInit(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);

  // Identificar por id_barbero, id_usuario o correo
  let barber = barbers.find(
    (b) =>
      b.id_barbero === user?.id_barbero ||
      b.id_usuario === user?.id_usuario ||
      (b.correo && user?.correo && b.correo.toLowerCase() === user.correo.toLowerCase())
  );

  // Si no se encuentra pero el rol es barbero (rol 3), asociar con Carlos Rodríguez (id_barbero: 1)
  if (!barber && user && Number(user.id_rol) === 3) {
    barber = barbers.find((b) => b.id_barbero === 1) || barbers[0];
  }

  if (!barber) {
    barber = INITIAL_BARBERS[0];
  }

  // Resolver fotografía asegurando que si fue eliminada (null o ""), sea estrictamente null
  const cleanPhoto = (() => {
    // Si el usuario actual tiene imagen explícita
    const uPhoto = user?.imagen_url !== undefined ? user.imagen_url : user?.avatar_url;
    if (uPhoto && typeof uPhoto === "string" && uPhoto.trim() && !uPhoto.includes("unsplash.com")) {
      return uPhoto.trim();
    }
    // Si el usuario tiene definida la propiedad pero es null/vacía (fue eliminada), respetar
    if (user && ("imagen_url" in user || "avatar_url" in user)) {
      return null;
    }
    const bPhoto = barber?.imagen_url || barber?.avatar_url;
    if (bPhoto && typeof bPhoto === "string" && bPhoto.trim() && !bPhoto.includes("unsplash.com")) {
      return bPhoto.trim();
    }
    return null;
  })();

  return {
    ...barber,
    documento: user?.documento || barber.documento || "",
    nombre: user?.nombre || barber.nombre,
    apellido: user?.apellido || barber.apellido,
    correo: user?.correo || barber.correo,
    telefono: user?.telefono || barber.telefono,
    especialidad: barber?.especialidad || "Corte Clásico & Fade",
    imagen_url: cleanPhoto,
    avatar_url: cleanPhoto,
    rol: "Barbero Profesional"
  };
}

/**
 * Actualiza la fotografía del barbero actual y sincroniza en:
 * - Backend /api/auth/profile
 * - Backend /api/barbers/:id
 * - localStorage (barber_current_user, barber_users_db, barber_barbers_db)
 * - dataSyncService (BARBERS y USERS)
 * - Eventos de ventana (barber_profile_updated y auth_user_updated)
 */
export async function updateCurrentBarberPhoto(newPhotoUrl) {
  const cleanPhoto = (newPhotoUrl && typeof newPhotoUrl === "string" && !newPhotoUrl.includes("unsplash.com") && newPhotoUrl.trim())
    ? newPhotoUrl.trim()
    : null;

  const currentProfile = getCurrentBarberProfile();
  const currentUser = getCurrentUser();

  // 1. Backend / Fallback authService
  const authRes = await updateUserProfile({
    nombre: currentProfile?.nombre || currentUser?.nombre || "",
    apellido: currentProfile?.apellido || currentUser?.apellido || "",
    documento: currentProfile?.documento || currentUser?.documento || null,
    telefono: currentProfile?.telefono || currentUser?.telefono || null,
    imagen_url: cleanPhoto,
    avatar_url: cleanPhoto
  });

  // 2. Backend Barber API
  const barberId = currentProfile?.id_barbero || currentUser?.id_barbero || 1;
  try {
    await updateBarberApi(barberId, {
      nombre: currentProfile?.nombre || currentUser?.nombre || "",
      apellido: currentProfile?.apellido || currentUser?.apellido || "",
      documento: currentProfile?.documento || currentUser?.documento || null,
      correo: currentProfile?.correo || currentUser?.correo || "",
      telefono: currentProfile?.telefono || currentUser?.telefono || null,
      especialidad: currentProfile?.especialidad || "Corte Clásico & Fade",
      imagen_url: cleanPhoto,
      estado: 1
    });
  } catch (err) {
    console.warn("[barberStorageService] Error actualizando barbero vía API:", err.message);
  }

  // 3. Sincronizar en localStorage barber_current_user
  try {
    const rawUser = localStorage.getItem("barber_current_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      u.imagen_url = cleanPhoto;
      u.avatar_url = cleanPhoto;
      localStorage.setItem("barber_current_user", JSON.stringify(u));
    }
  } catch (_) {}

  // 4. Sincronizar en localStorage barber_users_db
  try {
    const rawUsers = localStorage.getItem("barber_users_db");
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const updatedUsers = users.map((u) => {
        if (
          (currentProfile?.id_usuario && Number(u.id_usuario) === Number(currentProfile.id_usuario)) ||
          (currentUser?.id_usuario && Number(u.id_usuario) === Number(currentUser.id_usuario)) ||
          (u.correo && currentProfile?.correo && u.correo.toLowerCase() === currentProfile.correo.toLowerCase())
        ) {
          return { ...u, imagen_url: cleanPhoto, avatar_url: cleanPhoto };
        }
        return u;
      });
      localStorage.setItem("barber_users_db", JSON.stringify(updatedUsers));
    }
  } catch (_) {}

  // 5. Sincronizar en localStorage barber_barbers_db
  try {
    const rawBarbers = localStorage.getItem("barber_barbers_db");
    if (rawBarbers) {
      const barbers = JSON.parse(rawBarbers);
      const updatedBarbers = barbers.map((b) => {
        if (
          Number(b.id_barbero) === Number(barberId) ||
          (currentProfile?.id_usuario && Number(b.id_usuario) === Number(currentProfile.id_usuario)) ||
          (b.correo && currentProfile?.correo && b.correo.toLowerCase() === currentProfile.correo.toLowerCase())
        ) {
          return { ...b, imagen_url: cleanPhoto, avatar_url: cleanPhoto };
        }
        return b;
      });
      localStorage.setItem("barber_barbers_db", JSON.stringify(updatedBarbers));
    }
  } catch (_) {}

  // 6. Notificar a través de dataSyncService
  notifyDataChange(SYNC_ENTITIES.BARBERS, {
    id_barbero: barberId,
    id_usuario: currentProfile?.id_usuario || currentUser?.id_usuario,
    imagen_url: cleanPhoto
  });
  notifyDataChange(SYNC_ENTITIES.USERS, {
    id_usuario: currentProfile?.id_usuario || currentUser?.id_usuario,
    imagen_url: cleanPhoto,
    avatar_url: cleanPhoto
  });

  // 7. Eventos de ventana para actualización reactiva inmediata
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("barber_profile_updated", {
        detail: { id_barbero: barberId, imagen_url: cleanPhoto }
      })
    );
    window.dispatchEvent(
      new CustomEvent("auth_user_updated", {
        detail: { ...currentUser, imagen_url: cleanPhoto, avatar_url: cleanPhoto }
      })
    );
  }

  return { success: true, imagen_url: cleanPhoto, authRes };
}

/**
 * Actualiza los datos personales del barbero y sincroniza en todos los módulos.
 */
export async function updateCurrentBarberProfileData(data) {
  const currentProfile = getCurrentBarberProfile();
  const currentUser = getCurrentUser();

  const authRes = await updateUserProfile({
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    documento: data.documento ? data.documento.trim() : null,
    telefono: data.telefono ? data.telefono.trim() : null,
    imagen_url: currentProfile?.imagen_url || null,
    avatar_url: currentProfile?.avatar_url || null
  });

  const barberId = currentProfile?.id_barbero || currentUser?.id_barbero || 1;
  try {
    await updateBarberApi(barberId, {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      documento: data.documento ? data.documento.trim() : null,
      correo: currentProfile?.correo || currentUser?.correo || "",
      telefono: data.telefono ? data.telefono.trim() : null,
      especialidad: data.especialidad ? data.especialidad.trim() : currentProfile?.especialidad || "Corte Clásico & Fade",
      imagen_url: currentProfile?.imagen_url || null,
      estado: 1
    });
  } catch (err) {
    console.warn("[barberStorageService] Error actualizando barbero vía API:", err.message);
  }

  // Sincronizar en localStorage barber_barbers_db
  try {
    const rawBarbers = localStorage.getItem("barber_barbers_db");
    if (rawBarbers) {
      const barbers = JSON.parse(rawBarbers);
      const updatedBarbers = barbers.map((b) => {
        if (
          Number(b.id_barbero) === Number(barberId) ||
          (currentProfile?.id_usuario && Number(b.id_usuario) === Number(currentProfile.id_usuario)) ||
          (b.correo && currentProfile?.correo && b.correo.toLowerCase() === currentProfile.correo.toLowerCase())
        ) {
          return {
            ...b,
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            telefono: data.telefono ? data.telefono.trim() : b.telefono,
            documento: data.documento ? data.documento.trim() : b.documento,
            especialidad: data.especialidad ? data.especialidad.trim() : b.especialidad
          };
        }
        return b;
      });
      localStorage.setItem("barber_barbers_db", JSON.stringify(updatedBarbers));
    }
  } catch (_) {}

  notifyDataChange(SYNC_ENTITIES.BARBERS, { id_barbero: barberId, ...data });
  notifyDataChange(SYNC_ENTITIES.USERS, { id_usuario: currentProfile?.id_usuario || currentUser?.id_usuario, ...data });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("barber_profile_updated", { detail: { id_barbero: barberId, ...data } }));
  }

  return { success: true, authRes };
}

// ==========================================
// 2. CITAS DEL BARBERO
// ==========================================

export function getBarberAppointments() {
  const barber = getCurrentBarberProfile();
  let appointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_BARBER_APPOINTMENTS);

  // Asegurar que existan citas del barbero si el array fue inicializado sin ellas
  const hasBarberAppointments = appointments.some((a) => Number(a.id_barbero) === Number(barber.id_barbero));
  if (!hasBarberAppointments) {
    appointments = [...appointments, ...INITIAL_BARBER_APPOINTMENTS];
    save(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  const clients = getOrInit(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const services = getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  const packages = getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);

  // Filtrar exclusivamente citas de este barbero
  return appointments
    .filter((a) => Number(a.id_barbero) === Number(barber.id_barbero))
    .map((apt) => {
      // 1. Si la cita ya contiene los datos reales guardados en bookAppointment, priorizarlos
      let clientName = (apt.cliente_nombre || "").trim();
      let clientPhone = apt.cliente_telefono || "";
      let clientEmail = apt.cliente_correo || "";
      let clientFidelity = apt.cliente_fidelidad || "";

      // 2. Buscar en base de datos local de clientes (barber_clients_db)
      const client = clients.find(
        (c) =>
          (apt.id_cliente && Number(c.id_cliente) === Number(apt.id_cliente)) ||
          (apt.id_usuario && Number(c.id_usuario) === Number(apt.id_usuario)) ||
          (apt.cliente_correo && c.correo && c.correo.toLowerCase() === apt.cliente_correo.toLowerCase())
      );

      if (client) {
        if (!clientName || clientName === "Cliente") clientName = `${client.nombre} ${client.apellido || ""}`.trim();
        if (!clientPhone) clientPhone = client.telefono || "";
        if (!clientEmail) clientEmail = client.correo || "";
        if (!clientFidelity) clientFidelity = client.nivel_fidelidad || "Nuevo";
      }

      // 3. Fallback a usuarios registrados (barber_users_db)
      if (!clientName || clientName === "Cliente") {
        try {
          const rawUsers = localStorage.getItem("barber_users_db");
          const users = rawUsers ? JSON.parse(rawUsers) : [];
          const matchedUser = users.find(
            (u) =>
              (apt.id_usuario && Number(u.id_usuario) === Number(apt.id_usuario)) ||
              (apt.cliente_correo && u.correo && u.correo.toLowerCase() === apt.cliente_correo.toLowerCase())
          );
          if (matchedUser) {
            clientName = `${matchedUser.nombre} ${matchedUser.apellido || ""}`.trim();
            if (!clientPhone) clientPhone = matchedUser.telefono || "";
            if (!clientEmail) clientEmail = matchedUser.correo || "";
          }
        } catch {
          // fallback silencioso
        }
      }

      if (!clientName) clientName = "Cliente Registrado";
      if (!clientPhone) clientPhone = "No especificado";
      if (!clientFidelity) clientFidelity = "Nuevo";

      const service = apt.id_servicio
        ? services.find((s) => Number(s.id_servicio) === Number(apt.id_servicio))
        : null;

      const pkg = apt.id_paquete
        ? packages.find((p) => Number(p.id_paquete) === Number(apt.id_paquete))
        : null;

      const safeHora = typeof apt.hora === "string" ? apt.hora : "08:00";
      const safeFecha = apt.fecha || TODAY;

      return {
        ...apt,
        cliente_nombre: clientName,
        cliente_telefono: clientPhone,
        cliente_correo: clientEmail,
        cliente_fidelidad: clientFidelity,
        servicio_nombre: service ? service.nombre : apt.nombre_item || apt.servicio_nombre || "Servicio General",
        servicio_precio: service ? service.precio : (apt.precio || 0),
        servicio_duracion: service ? service.duracion_minutos : (apt.duracion_minutos || 30),
        paquete_nombre: pkg ? pkg.nombre : (apt.paquete_nombre || null),
        es_paquete: Boolean(pkg || apt.id_paquete),
        estado: apt.estado || "Programada",
        hora: safeHora,
        fecha: safeFecha
      };
    })
    .sort((a, b) => {
      const horaA = typeof a.hora === "string" ? (a.hora.length === 5 ? a.hora + ":00" : a.hora) : "00:00:00";
      const horaB = typeof b.hora === "string" ? (b.hora.length === 5 ? b.hora + ":00" : b.hora) : "00:00:00";
      const fechaA = a.fecha || "1970-01-01";
      const fechaB = b.fecha || "1970-01-01";
      const dateA = new Date(`${fechaA}T${horaA}`);
      const dateB = new Date(`${fechaB}T${horaB}`);
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      return timeB - timeA;
    });
}

/**
 * Marca una cita como Completada/Atendida en la base de datos local
 * y acredita los puntos de fidelidad (+50 pts) al cliente atendido.
 */
export function completeBarberAppointment(id_cita) {
  const barber = getCurrentBarberProfile();
  const appointments = getOrInit(STORAGE_KEYS.APPOINTMENTS, INITIAL_BARBER_APPOINTMENTS);

  const index = appointments.findIndex(
    (a) => Number(a.id_cita) === Number(id_cita) && Number(a.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Cita no encontrada o no pertenece a tu perfil." };
  }

  const apt = appointments[index];
  const wasAlreadyCompleted = apt.estado === "Completada";

  // 1. Actualizar estado de la cita
  appointments[index] = {
    ...apt,
    estado: "Completada",
    fecha_completada: apt.fecha_completada || new Date().toISOString()
  };

  save(STORAGE_KEYS.APPOINTMENTS, appointments);
  notifyDataChange(SYNC_ENTITIES.APPOINTMENTS);

  let pointsAwarded = 0;
  let newPoints = 0;
  let newTier = "Nuevo";

  // 2. ACREDITACIÓN DE PUNTOS: Solo se aumentan cuando el barbero da por finalizada y completada la cita
  if (!wasAlreadyCompleted) {
    const POINTS_PER_COMPLETED_SERVICE = 50;
    pointsAwarded = POINTS_PER_COMPLETED_SERVICE;

    try {
      const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      const clients = rawClients ? JSON.parse(rawClients) : [];

      const cleanClientEmail = (apt.cliente_correo || "").trim().toLowerCase();
      const cleanClientName = (apt.cliente_nombre || "").trim().toLowerCase();

      const clientIndex = clients.findIndex((c) =>
        (apt.id_cliente && Number(c.id_cliente) === Number(apt.id_cliente)) ||
        (apt.id_usuario && Number(c.id_usuario) === Number(apt.id_usuario)) ||
        (cleanClientEmail && c.correo && c.correo.toLowerCase() === cleanClientEmail) ||
        (cleanClientName && `${c.nombre || ""} ${c.apellido || ""}`.trim().toLowerCase() === cleanClientName)
      );

      if (clientIndex >= 0) {
        const currentPts = Number(clients[clientIndex].puntos_fidelidad ?? 0);
        newPoints = currentPts + pointsAwarded;

        // Progresión de nivel de fidelidad según puntos acumulados:
        // < 150 pts: Nuevo
        // 150 - 349 pts: Bronce (3 visitas)
        // 350 - 749 pts: Plata (7 visitas)
        // >= 750 pts: Oro (15 visitas)
        if (newPoints >= 750) newTier = "Oro";
        else if (newPoints >= 350) newTier = "Plata";
        else if (newPoints >= 150) newTier = "Bronce";
        else newTier = "Nuevo";

        clients[clientIndex] = {
          ...clients[clientIndex],
          puntos_fidelidad: newPoints,
          nivel_fidelidad: newTier
        };

        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
        notifyDataChange(SYNC_ENTITIES.CLIENTS);

        // Sincronizar usuario en sesión activa si coincide con el cliente atendido
        try {
          const rawCurr = localStorage.getItem("barber_current_user") || sessionStorage.getItem("barber_current_user");
          if (rawCurr) {
            const currUser = JSON.parse(rawCurr);
            const isMatch =
              (currUser.id_usuario && Number(currUser.id_usuario) === Number(clients[clientIndex].id_usuario)) ||
              (currUser.correo && currUser.correo.toLowerCase() === clients[clientIndex].correo?.toLowerCase());

            if (isMatch) {
              currUser.puntos_fidelidad = newPoints;
              currUser.nivel_fidelidad = newTier;
              localStorage.setItem("barber_current_user", JSON.stringify(currUser));
              sessionStorage.setItem("barber_current_user", JSON.stringify(currUser));
            }
          }
        } catch {}

        // Sincronizar en barber_users_db
        try {
          const rawUsers = localStorage.getItem("barber_users_db");
          if (rawUsers) {
            const users = JSON.parse(rawUsers);
            const uIdx = users.findIndex(
              (u) =>
                (clients[clientIndex].id_usuario && Number(u.id_usuario) === Number(clients[clientIndex].id_usuario)) ||
                (u.correo && u.correo.toLowerCase() === clients[clientIndex].correo?.toLowerCase())
            );
            if (uIdx >= 0) {
              users[uIdx].puntos_fidelidad = newPoints;
              users[uIdx].nivel_fidelidad = newTier;
              localStorage.setItem("barber_users_db", JSON.stringify(users));
            }
          }
        } catch {}

        // Despachar notificación para el cliente
        try {
          createNotification({
            type: "promotion",
            title: "¡Puntos ganados en tu servicio!",
            description: `Tu barbero finalizó la cita #${id_cita}. ¡Has recibido +${pointsAwarded} pts! Saldo acumulado: ${newPoints} pts.`,
            targetRole: 4,
            targetUser: clients[clientIndex].id_usuario,
            route: "/portal/perfil"
          });
        } catch {}
      }
    } catch (err) {
      console.warn("[completeBarberAppointment] Error acreditando puntos:", err);
    }
  }

  return {
    success: true,
    appointment: appointments[index],
    pointsAwarded,
    newPoints,
    newTier
  };
}

// ==========================================
// 3. AGENDA DEL DÍA Y SLOTS HORARIOS
// ==========================================

export function getBarberAgendaForDate(targetDate = TODAY) {
  const appointments = getBarberAppointments().filter((a) => a.fecha === targetDate);

  // Rango de horas estándar de operación: 08:00 a 18:00
  const standardHours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
  ];

  const slots = standardHours.map((hour) => {
    // Buscar cita cuya hora coincida (ej: "10:00" o "10:30" entra en el bloque)
    const matchingAppt = appointments.find((apt) => {
      if (!apt || !apt.hora) return false;
      const aptHour = String(apt.hora).substring(0, 2);
      const slotHour = hour.substring(0, 2);
      return aptHour === slotHour;
    });

    if (matchingAppt) {
      return {
        hora: matchingAppt.hora || hour,
        slotBase: hour,
        estadoSlot: "Ocupado",
        cita: matchingAppt
      };
    }

    return {
      hora: hour,
      slotBase: hour,
      estadoSlot: "Libre",
      cita: null
    };
  });

  // Cálculo de ocupación de la jornada diaria
  const activeApts = appointments.filter(
    (a) => a && (a.estado === "Programada" || a.estado === "Reprogramada" || a.estado === "Completada")
  );
  const totalDurationMinutes = activeApts.reduce((acc, a) => acc + (a.servicio_duracion || 30), 0);
  const totalShiftMinutes = 10 * 60; // 08:00 a 18:00 = 600 min (10h)
  const occupancyPercentage = Math.min(100, Math.round((totalDurationMinutes / totalShiftMinutes) * 100));
  const occupiedHours = (totalDurationMinutes / 60).toFixed(1);
  const freeHours = Math.max(0, (totalShiftMinutes - totalDurationMinutes) / 60).toFixed(1);

  return {
    fecha: targetDate,
    slots,
    totalCitas: appointments.length,
    citasProgramadas: appointments.filter((a) => a && (a.estado === "Programada" || a.estado === "Reprogramada")).length,
    occupancyPercentage,
    occupiedHours,
    freeHours,
    totalDurationMinutes
  };
}

// ==========================================
// 4. HORARIO SEMANAL DEL BARBERO
// ==========================================

export function getBarberWeeklySchedule(customSchedules = null) {
  const barber = getCurrentBarberProfile();
  const allSchedules = customSchedules || getOrInit(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);

  // Filtrar exclusivamente turnos activos de este barbero
  const barberSchedules = (Array.isArray(allSchedules) ? allSchedules : []).filter(
    (s) => Number(s.id_barbero) === Number(barber?.id_barbero) && (s.estado === undefined || Number(s.estado) === 1)
  );

  const daysOfWeek = [
    { key: "Lunes", label: "Lunes" },
    { key: "Martes", label: "Martes" },
    { key: "Miercoles", label: "Miércoles" },
    { key: "Jueves", label: "Jueves" },
    { key: "Viernes", label: "Viernes" },
    { key: "Sabado", label: "Sábado" },
    { key: "Domingo", label: "Domingo" }
  ];

  const norm = (str) =>
    String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const weeklySchedule = daysOfWeek.map((day) => {
    // Buscar si existe un registro de turno para este día (soporta dia_semana o arreglo dias_semana)
    const matchingSchedule = barberSchedules.find((s) => {
      if (s.dia_semana && norm(s.dia_semana) === norm(day.key)) {
        return true;
      }
      if (Array.isArray(s.dias_semana) && s.dias_semana.some((d) => norm(d) === norm(day.key))) {
        return true;
      }
      return false;
    });

    if (matchingSchedule) {
      return {
        dia: day.label,
        key: day.key,
        tipo: "Turno Asignado",
        horaInicio: matchingSchedule.hora_inicio ? String(matchingSchedule.hora_inicio).substring(0, 5) : "09:00",
        horaFin: matchingSchedule.hora_fin ? String(matchingSchedule.hora_fin).substring(0, 5) : "18:00",
        descanso: false
      };
    }

    return {
      dia: day.label,
      key: day.key,
      tipo: "Descanso",
      horaInicio: null,
      horaFin: null,
      descanso: true
    };
  });

  const firstScheduleWithVigencia = barberSchedules.find((s) => s.fecha_inicio_vigencia);
  const vigenciaInicio = firstScheduleWithVigencia?.fecha_inicio_vigencia || "01/01/2026";
  const vigenciaFin = firstScheduleWithVigencia?.fecha_fin_vigencia || "31/12/2026";
  const diasLaborales = weeklySchedule.filter((d) => !d.descanso);

  return {
    barberoNombre: barber ? `${barber.nombre || ""} ${barber.apellido || ""}`.trim() : "Barbero",
    vigenciaInicio,
    vigenciaFin,
    dias: weeklySchedule,
    diasLaborales,
    totalDiasLaborales: diasLaborales.length,
    estadoHorario: barberSchedules.length > 0 ? "Activo" : "Sin Turnos Asignados"
  };
}

/**
 * Consulta los horarios reales en el backend y sincroniza el almacenamiento local.
 */
export async function fetchBarberWeeklySchedule() {
  const barber = getCurrentBarberProfile();
  try {
    const res = await getSchedulesApi(barber?.id_barbero);
    const schedulesList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
    if (schedulesList) {
      save(STORAGE_KEYS.SCHEDULES, schedulesList);
      return getBarberWeeklySchedule(schedulesList);
    }
  } catch (err) {
    console.warn("[BarberStorage] Error al consultar horarios desde API:", err.message);
  }
  return getBarberWeeklySchedule();
}

// ==========================================
// 5. PAQUETES DE SERVICIOS (SOLO LECTURA)
// ==========================================

export function getBarberPackages(customPackages = null) {
  const rawPackages = customPackages || getOrInit(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  const packages = Array.isArray(rawPackages) ? rawPackages : [];
  const services = getOrInit(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);

  const packageImages = {
    1: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
    2: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
    3: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
  };

  return (packages || [])
    .filter((pkg) => pkg && (pkg.estado === 1 || pkg.estado === undefined))
    .map((pkg) => {
      const serviciosIncluidos = (pkg.servicios_ids || []).map((sId) =>
        services.find((s) => s && s.id_servicio === sId)
      ).filter(Boolean);

      const precioBase = serviciosIncluidos.length > 0
        ? serviciosIncluidos.reduce((acc, s) => acc + (s.precio || 0), 0)
        : (pkg.precio || 0);
      const descuento = pkg.descuento_porcentaje || 0;
      const precioFinal = Math.round(precioBase * (1 - descuento / 100));
      const duracionTotal = serviciosIncluidos.reduce((acc, s) => acc + (s.duracion_minutos || 0), 0) || 45;

      return {
        ...pkg,
        nombre: pkg.nombre || "Paquete Especial",
        descripcion: pkg.descripcion || "Paquete de servicios para clientes de la barbería.",
        servicios: serviciosIncluidos,
        precioBase: pkg.precioBase || precioBase,
        descuento_porcentaje: descuento,
        precioFinal: pkg.precioFinal || precioFinal,
        duracion_minutos: duracionTotal,
        imagen_url: pkg.imagen_url || packageImages[pkg.id_paquete] || packageImages[1]
      };
    });
}

/**
 * Consulta los paquetes reales en el backend y sincroniza el almacenamiento local.
 */
export async function fetchBarberPackages() {
  try {
    const res = await getPackagesApi();
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
    if (list) {
      save(STORAGE_KEYS.PACKAGES, list);
      return getBarberPackages(list);
    }
  } catch (err) {
    console.warn("[BarberStorage] Error al consultar paquetes desde API:", err.message);
  }
  return getBarberPackages();
}

/**
 * Sincroniza las citas reales desde la API para el barbero autenticado.
 */
export async function fetchBarberAppointments() {
  const barber = getCurrentBarberProfile();
  try {
    const res = await getAppointmentsApi({ barbero: barber?.id_barbero });
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
    if (list) {
      save(STORAGE_KEYS.APPOINTMENTS, list);
      return getBarberAppointments();
    }
  } catch (err) {
    console.warn("[BarberStorage] Error consultando citas reales desde API:", err.message);
  }
  return getBarberAppointments();
}

/**
 * Sincroniza las novedades de horario reales desde la API para el barbero autenticado.
 */
export async function fetchBarberNovelties() {
  const barber = getCurrentBarberProfile();
  try {
    const res = await getNoveltiesApi({ barber: barber?.id_barbero });
    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null);
    if (list) {
      save(STORAGE_KEYS.NOVELTIES, list);
      return getBarberNovelties();
    }
  } catch (err) {
    console.warn("[BarberStorage] Error consultando novedades reales desde API:", err.message);
  }
  return getBarberNovelties();
}

// ==========================================
// 6. NOVEDADES DE HORARIO (SOLICITUDES)
// ==========================================

export function getBarberNovelties() {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  // Filtrar exclusivamente novedades de este barbero
  return novelties
    .filter((n) => Number(n.id_barbero) === Number(barber.id_barbero))
    .sort((a, b) => (b.id_novedad || 0) - (a.id_novedad || 0));
}

export function createBarberNovelty(noveltyData) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const nextId = Math.max(...novelties.map((n) => n.id_novedad || 0), 0) + 1;
  const newNovelty = {
    id_novedad: nextId,
    id_barbero: barber.id_barbero,
    tipo: noveltyData.tipo || "Permiso",
    fecha: noveltyData.fecha || TODAY,
    cita_relacionada: noveltyData.cita_relacionada ? noveltyData.cita_relacionada.trim() : "Ninguna",
    motivo: noveltyData.motivo ? noveltyData.motivo.trim() : "",
    descripcion: noveltyData.descripcion ? noveltyData.descripcion.trim() : "",
    estado: "Pendiente",
    fecha_registro: new Date().toISOString().replace("T", " ").substring(0, 19),
    respuesta_admin: null
  };

  const updated = [newNovelty, ...novelties];
  save(STORAGE_KEYS.NOVELTIES, updated);
  createNoveltyApi({
    id_barbero: Number(barber.id_barbero || 1),
    tipo: newNovelty.tipo,
    fecha: newNovelty.fecha,
    descripcion: newNovelty.descripcion || ""
  }).catch((e) => console.warn("[BarberStorage] Error enviando novedad a API:", e));

  try {
    createNotification({
      type: "schedule",
      title: "Nueva novedad de horario solicitada",
      description: `El barbero ${barber.nombre} ${barber.apellido || ""} solicitó ${newNovelty.tipo} para el ${newNovelty.fecha}.`,
      targetRole: [1, 2],
      route: "/admin/horarios"
    });
  } catch (err) {
    console.warn("[BarberStorage] Error al despachar notificación de novedad:", err);
  }

  return { success: true, novelty: newNovelty };
}

export function updateBarberNovelty(id_novedad, updatedData) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const index = novelties.findIndex(
    (n) => n.id_novedad === Number(id_novedad) && Number(n.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Solicitud de novedad no encontrada." };
  }

  if (novelties[index].estado !== "Pendiente") {
    return {
      success: false,
      error: "Solo se pueden editar solicitudes que se encuentren en estado Pendiente."
    };
  }

  novelties[index] = {
    ...novelties[index],
    tipo: updatedData.tipo || novelties[index].tipo,
    fecha: updatedData.fecha || novelties[index].fecha,
    cita_relacionada: updatedData.cita_relacionada !== undefined ? updatedData.cita_relacionada : novelties[index].cita_relacionada,
    motivo: updatedData.motivo ? updatedData.motivo.trim() : novelties[index].motivo,
    descripcion: updatedData.descripcion ? updatedData.descripcion.trim() : novelties[index].descripcion
  };

  save(STORAGE_KEYS.NOVELTIES, novelties);
  return { success: true, novelty: novelties[index] };
}

export function cancelBarberNovelty(id_novedad) {
  const barber = getCurrentBarberProfile();
  const novelties = getOrInit(STORAGE_KEYS.NOVELTIES, INITIAL_NOVELTIES);

  const index = novelties.findIndex(
    (n) => n.id_novedad === Number(id_novedad) && Number(n.id_barbero) === Number(barber.id_barbero)
  );

  if (index === -1) {
    return { success: false, error: "Solicitud no encontrada." };
  }

  if (novelties[index].estado !== "Pendiente") {
    return {
      success: false,
      error: "Solo puedes cancelar solicitudes que se encuentren en estado Pendiente."
    };
  }

  novelties[index].estado = "Cancelada";
  save(STORAGE_KEYS.NOVELTIES, novelties);

  return { success: true, novelty: novelties[index] };
}

// ==========================================
// 7. REPORTES DEL BARBERO
// ==========================================

export function getBarberReports() {
  const appointments = getBarberAppointments();

  const citasProgramadas = appointments.filter(
    (a) => a.estado === "Programada" || a.estado === "Reprogramada"
  );

  const citasCompletadas = appointments.filter(
    (a) => a.estado === "Completada"
  );

  const citasCanceladas = appointments.filter(
    (a) => a.estado === "Cancelada"
  );

  return {
    totalProgramadas: citasProgramadas.length,
    totalCompletadas: citasCompletadas.length,
    totalCanceladas: citasCanceladas.length,
    citasProgramadas,
    citasCompletadas
  };
}
