/**
 * @file notificationService.js
 * Servicio reactivo centralizado de notificaciones para el Frontend.
 * Conecta con el Backend (/api/notifications) y gestiona persistencia y reactividad en tiempo real
 * para Administrador, Recepcionista, Barbero y Cliente.
 */

import { apiRequest } from "../api/apiClient.js";
import { getCurrentUser } from "../../features/auth/services/authService.js";

const STORAGE_KEY_NOTIFICATIONS = "barber_notifications_db";
const STORAGE_KEY_READ = "barber_read_notifications_ids";
const STORAGE_KEY_DISMISSED = "barber_dismissed_notifications_ids";

// Helper para leer localStorage con seguridad
function getJson(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`[notificationService] Error guardando ${key}:`, err);
  }
}

/**
 * Dispara evento global para actualizar todas las campanitas montadas en la app
 */
export function dispatchNotificationUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("barber_notification_update"));
  }
}

/**
 * Genera notificaciones locales a partir de datos reales de citas, novedades y productos
 * garantizando disponibilidad inmediata incluso si el backend está sincronizando.
 */
function generateDynamicLocalNotifications(user) {
  if (!user) return [];

  const roleId = Number(user.id_rol);
  const userId = Number(user.id_usuario);
  const notifications = [];

  try {
    const appointments = getJson("barber_appointments_db", []);
    const novelties = getJson("barber_novelties_db", []);
    const products = getJson("barber_products_db", []);

    // 1. Administrador (1) y Recepcionista (2)
    if (roleId === 1 || roleId === 2) {
      // Citas
      for (const apt of appointments.slice(0, 25)) {
        if (apt.estado === "Cancelada") {
          notifications.push({
            id: `apt-canc-${apt.id_cita}`,
            type: "appointment",
            title: "Cita cancelada",
            description: `La cita de ${apt.cliente_nombre || "Cliente"} para el ${apt.fecha} fue cancelada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/admin/citas",
            targetRole: [1, 2]
          });
        } else {
          notifications.push({
            id: `apt-prog-${apt.id_cita}`,
            type: "appointment",
            title: "Cita agendada",
            description: `Cita con ${apt.barberoNombre || apt.barbero_nombre || "Barbero"} para ${apt.cliente_nombre || "Cliente"} el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/admin/citas",
            targetRole: [1, 2]
          });
        }
      }

      // Novedades de barberos pendientes
      for (const nov of novelties) {
        if (nov.estado === "Pendiente") {
          notifications.push({
            id: `nov-pend-${nov.id_novedad}`,
            type: "schedule",
            title: "Novedad de horario solicitada",
            description: `Solicitud de ${nov.tipo} para el ${nov.fecha}.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/admin/horarios",
            targetRole: [1, 2]
          });
        }
      }

      // Stock crítico (<= 5)
      for (const prod of products) {
        if (Number(prod.stock) <= 5 && prod.estado !== 0) {
          notifications.push({
            id: `stock-crit-${prod.id_producto}`,
            type: "stock",
            title: "Alerta de Stock Crítico",
            description: `El producto "${prod.nombre}" solo tiene ${prod.stock} unidad(es) disponible(s).`,
            timestamp: new Date().toISOString(),
            route: "/admin/productos",
            targetRole: [1, 2]
          });
        }
      }
    }

    // 2. Barbero (3)
    if (roleId === 3) {
      const barbers = getJson("barber_barbers_db", []);
      const myBarber = barbers.find((b) => Number(b.id_usuario) === userId) || { id_barbero: 1 };
      const myBarberId = Number(myBarber.id_barbero);

      // Citas asignadas a este barbero
      const myAppointments = appointments.filter((a) => Number(a.id_barbero) === myBarberId);
      for (const apt of myAppointments.slice(0, 25)) {
        if (apt.estado === "Cancelada") {
          notifications.push({
            id: `barber-apt-canc-${apt.id_cita}`,
            type: "appointment",
            title: "Cita cancelada",
            description: `Tu cita con ${apt.cliente_nombre || "Cliente"} para el ${apt.fecha} ha sido cancelada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/barbero/agenda",
            targetUserId: userId
          });
        } else {
          notifications.push({
            id: `barber-apt-${apt.id_cita}`,
            type: "appointment",
            title: "Cita en tu agenda",
            description: `Tienes cita con ${apt.cliente_nombre || "Cliente"} el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/barbero/agenda",
            targetUserId: userId
          });
        }
      }

      // Novedades de este barbero resueltas
      const myNovelties = novelties.filter((n) => Number(n.id_barbero) === myBarberId);
      for (const nov of myNovelties) {
        if (nov.estado === "Aprobado" || nov.estado === "Aprobada") {
          notifications.push({
            id: `barber-nov-aprob-${nov.id_novedad}`,
            type: "schedule",
            title: "Novedad Aprobada",
            description: `Tu solicitud de ${nov.tipo} para el ${nov.fecha} fue aprobada.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/barbero/novedades",
            targetUserId: userId
          });
        } else if (nov.estado === "Rechazado" || nov.estado === "Rechazada") {
          notifications.push({
            id: `barber-nov-rech-${nov.id_novedad}`,
            type: "schedule",
            title: "Novedad Rechazada",
            description: `Tu solicitud de ${nov.tipo} para el ${nov.fecha} fue rechazada.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/barbero/novedades",
            targetUserId: userId
          });
        }
      }
    }

    // 3. Cliente (4)
    if (roleId === 4) {
      const myAppointments = appointments.filter(
        (a) => Number(a.id_usuario) === userId || (user.id_cliente && Number(a.id_cliente) === Number(user.id_cliente))
      );
      for (const apt of myAppointments.slice(0, 25)) {
        if (apt.estado === "Cancelada") {
          notifications.push({
            id: `client-apt-canc-${apt.id_cita}`,
            type: "appointment",
            title: "Cita cancelada",
            description: `Tu turno para el ${apt.fecha} fue cancelado.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        } else if (apt.estado === "Reprogramada") {
          notifications.push({
            id: `client-apt-reprog-${apt.id_cita}`,
            type: "appointment",
            title: "Cita reprogramada",
            description: `Tu turno ha sido reprogramado para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        } else {
          notifications.push({
            id: `client-apt-conf-${apt.id_cita}`,
            type: "appointment",
            title: "¡Cita agendada con éxito!",
            description: `Tu cita con ${apt.barberoNombre || "tu barbero"} para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""} está confirmada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        }
      }
    }
  } catch (err) {
    console.warn("[notificationService] Error generando notificaciones dinámicas:", err);
  }

  // Combinar con las notificaciones creadas explícitamente en barber_notifications_db
  const explicit = getJson(STORAGE_KEY_NOTIFICATIONS, []);
  for (const exp of explicit) {
    const matchesUser = !exp.targetUserId || Number(exp.targetUserId) === userId;
    const matchesRole = !exp.targetRole || (Array.isArray(exp.targetRole) ? exp.targetRole.includes(roleId) : Number(exp.targetRole) === roleId);
    if (matchesUser && matchesRole) {
      notifications.unshift(exp);
    }
  }

  // Aplicar IDs leídos y descartados
  const readIds = new Set(getJson(STORAGE_KEY_READ, []).map(String));
  const dismissedIds = new Set(getJson(STORAGE_KEY_DISMISSED, []).map(String));

  return notifications
    .filter((n) => !dismissedIds.has(String(n.id)))
    .map((n) => ({
      ...n,
      read: readIds.has(String(n.id)) || !!n.read,
      timestamp: n.timestamp ? new Date(n.timestamp) : new Date()
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Obtiene todas las notificaciones para el usuario actual (sincronizando con Backend)
 */
export async function getNotifications(user = null) {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return [];

  // 1. Intentar obtener desde la API Backend
  try {
    const res = await apiRequest("/api/notifications");
    if (Array.isArray(res) && res.length > 0) {
      // Combinar con lecturas locales
      const readIds = new Set(getJson(STORAGE_KEY_READ, []).map(String));
      const dismissedIds = new Set(getJson(STORAGE_KEY_DISMISSED, []).map(String));

      return res
        .filter((n) => !dismissedIds.has(String(n.id)))
        .map((n) => ({
          ...n,
          read: n.read || readIds.has(String(n.id)),
          timestamp: n.timestamp ? new Date(n.timestamp) : new Date()
        }));
    }
  } catch (err) {
    // Si la API falla o está offline, continuar transparentemente al generador local resiliente
  }

  // 2. Generador dinámico local 100% resiliente
  return generateDynamicLocalNotifications(currentUser);
}

/**
 * Crea y despacha una notificación en todo el sistema
 */
export function createNotification(notifData) {
  const current = getJson(STORAGE_KEY_NOTIFICATIONS, []);
  const newNotif = {
    id: notifData.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notifData.type || "appointment",
    title: notifData.title || "Notificación del sistema",
    description: notifData.description || "",
    timestamp: new Date().toISOString(),
    route: notifData.route || null,
    targetRole: notifData.targetRole || null,
    targetUserId: notifData.targetUserId ? Number(notifData.targetUserId) : null,
    read: false
  };

  setJson(STORAGE_KEY_NOTIFICATIONS, [newNotif, ...current.slice(0, 100)]);
  dispatchNotificationUpdate();

  // Intentar sincronizar con Backend en background
  apiRequest("/api/notifications", {
    method: "POST",
    body: JSON.stringify({
      type: newNotif.type,
      title: newNotif.title,
      description: newNotif.description,
      route: newNotif.route,
      id_rol: Array.isArray(newNotif.targetRole) ? newNotif.targetRole[0] : newNotif.targetRole,
      id_usuario: newNotif.targetUserId
    })
  }).catch(() => {});

  return newNotif;
}

/**
 * Marca una notificación como leída
 */
export function markAsRead(id) {
  const readIds = getJson(STORAGE_KEY_READ, []);
  if (!readIds.includes(String(id))) {
    readIds.push(String(id));
    setJson(STORAGE_KEY_READ, readIds);
  }
  dispatchNotificationUpdate();

  apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
}

/**
 * Marca todas las notificaciones como leídas
 */
export function markAllAsRead(notifications = []) {
  const readIds = getJson(STORAGE_KEY_READ, []);
  const newReadIds = new Set(readIds.map(String));

  for (const n of notifications) {
    newReadIds.add(String(n.id));
  }

  setJson(STORAGE_KEY_READ, Array.from(newReadIds));
  dispatchNotificationUpdate();

  apiRequest("/api/notifications/read-all", { method: "PATCH" }).catch(() => {});
}

/**
 * Descarta / elimina una notificación
 */
export function deleteNotification(id) {
  const dismissedIds = getJson(STORAGE_KEY_DISMISSED, []);
  if (!dismissedIds.includes(String(id))) {
    dismissedIds.push(String(id));
    setJson(STORAGE_KEY_DISMISSED, dismissedIds);
  }
  dispatchNotificationUpdate();

  apiRequest(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
}

/**
 * Limpia todas las notificaciones que ya han sido leídas
 */
export function clearReadNotifications(notifications = []) {
  const dismissedIds = getJson(STORAGE_KEY_DISMISSED, []);
  const newDismissed = new Set(dismissedIds.map(String));

  for (const n of notifications) {
    if (n.read) {
      newDismissed.add(String(n.id));
    }
  }

  setJson(STORAGE_KEY_DISMISSED, Array.from(newDismissed));
  dispatchNotificationUpdate();

  apiRequest("/api/notifications/clear-read", { method: "DELETE" }).catch(() => {});
}

/**
 * Hook/Suscripción para escuchar cambios en tiempo real
 */
export function subscribeNotifications(callback) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => callback();
  window.addEventListener("barber_notification_update", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener("barber_notification_update", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
