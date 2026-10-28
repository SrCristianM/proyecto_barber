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
    const sales = getJson("barber_sales_db", []);
    const stationItems = getJson("barber_station_items_db", []);

    // 1. Administrador (1) y Recepcionista (2)
    if (roleId === 1 || roleId === 2) {
      // Citas
      for (const apt of appointments.slice(0, 30)) {
        const clientName = apt.cliente_nombre || "Cliente";
        const barberName = apt.barberoNombre || apt.barbero_nombre || "Barbero";
        const horaStr = apt.hora ? apt.hora.substring(0, 5) : "";

        if (apt.estado === "Cancelada") {
          notifications.push({
            id: `apt-canc-${apt.id_cita}`,
            type: "appointment",
            title: "Cita cancelada",
            description: `La cita de ${clientName} para el ${apt.fecha} fue cancelada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/dashboard/appointments",
            targetRole: [1, 2]
          });
        } else if (apt.estado === "Reprogramada") {
          notifications.push({
            id: `apt-reprog-${apt.id_cita}`,
            type: "appointment",
            title: "Cita reprogramada",
            description: `Cita de ${clientName} con ${barberName} reprogramada para el ${apt.fecha} a las ${horaStr}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/dashboard/appointments",
            targetRole: [1, 2]
          });
        } else if (apt.estado === "Completada") {
          notifications.push({
            id: `apt-comp-${apt.id_cita}`,
            type: "appointment",
            title: "Servicio completado",
            description: `Cita finalizada con éxito: ${clientName} con ${barberName}.`,
            timestamp: apt.fecha_completada || apt.fecha_registro || apt.fecha,
            route: "/dashboard/appointments",
            targetRole: [1, 2]
          });
        } else {
          notifications.push({
            id: `apt-prog-${apt.id_cita}`,
            type: "appointment",
            title: "Cita agendada",
            description: `Cita programada con ${barberName} para ${clientName} el ${apt.fecha} a las ${horaStr}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/dashboard/appointments",
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
            description: `El barbero ${nov.barbero_nombre || "Barbero"} solicitó ${nov.tipo} para el ${nov.fecha}.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/dashboard/schedules",
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
            route: "/dashboard/products",
            targetRole: [1, 2]
          });
        }
      }

      // Insumos de puesto en alerta (ROJO o AMARILLO)
      for (const item of stationItems) {
        if (item.estado_semaforo === "ROJO") {
          notifications.push({
            id: `station-rojo-${item.id_estacion_insumo || item.id_estacion_item || item.id}`,
            type: "stock",
            title: "Insumo Agotado en Puesto",
            description: `Puesto de ${item.barbero_nombre || "Barbero"}: "${item.insumo_nombre || "Insumo"}" se encuentra agotado (0 unidades).`,
            timestamp: item.fecha_actualizacion || new Date().toISOString(),
            route: "/dashboard/abastecimiento",
            targetRole: [1, 2]
          });
        } else if (item.estado_semaforo === "AMARILLO") {
          notifications.push({
            id: `station-amarillo-${item.id_estacion_insumo || item.id_estacion_item || item.id}`,
            type: "stock",
            title: "Insumo por Acabarse en Puesto",
            description: `Puesto de ${item.barbero_nombre || "Barbero"}: "${item.insumo_nombre || "Insumo"}" requiere reposición preventiva.`,
            timestamp: item.fecha_actualizacion || new Date().toISOString(),
            route: "/dashboard/abastecimiento",
            targetRole: [1, 2]
          });
        }
      }

      // Ventas recientes
      for (const sale of sales.slice(0, 10)) {
        notifications.push({
          id: `sale-reg-${sale.id_venta}`,
          type: "sale",
          title: "Venta registrada",
          description: `Venta #${sale.id_venta} por $${Number(sale.total || 0).toLocaleString("es-CO")} para ${sale.cliente_nombre || "Cliente"}.`,
          timestamp: sale.fecha || new Date().toISOString(),
          route: "/dashboard/sales",
          targetRole: [1, 2]
        });
      }
    }

    // 2. Barbero (3)
    let myBarberId = null;
    if (roleId === 3) {
      const barbers = getJson("barber_barbers_db", []);
      const myBarber = barbers.find(
        (b) =>
          Number(b.id_usuario) === userId ||
          (user.id_barbero && Number(b.id_barbero) === Number(user.id_barbero)) ||
          (user.correo && b.correo?.toLowerCase() === user.correo?.toLowerCase())
      ) || { id_barbero: 1 };
      myBarberId = Number(myBarber.id_barbero);

      // Citas asignadas a este barbero
      const myAppointments = appointments.filter((a) => Number(a.id_barbero) === myBarberId);
      for (const apt of myAppointments.slice(0, 30)) {
        const clientName = apt.cliente_nombre || "Cliente";
        const horaStr = apt.hora ? apt.hora.substring(0, 5) : "";

        if (apt.estado === "Cancelada") {
          notifications.push({
            id: `barber-apt-canc-${apt.id_cita}`,
            type: "appointment",
            title: "Cita cancelada",
            description: `Tu cita con ${clientName} para el ${apt.fecha} ha sido cancelada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/barbero/agenda",
            targetUserId: userId
          });
        } else if (apt.estado === "Reprogramada") {
          notifications.push({
            id: `barber-apt-reprog-${apt.id_cita}`,
            type: "appointment",
            title: "Cita reprogramada",
            description: `Tu cita con ${clientName} ha sido reprogramada para el ${apt.fecha} a las ${horaStr}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/barbero/agenda",
            targetUserId: userId
          });
        } else if (apt.estado === "Completada") {
          notifications.push({
            id: `barber-apt-comp-${apt.id_cita}`,
            type: "appointment",
            title: "Servicio completado",
            description: `Servicio con ${clientName} finalizado exitosamente.`,
            timestamp: apt.fecha_completada || apt.fecha_registro || apt.fecha,
            route: "/barbero/agenda",
            targetUserId: userId
          });
        } else {
          notifications.push({
            id: `barber-apt-${apt.id_cita}`,
            type: "appointment",
            title: "Cita en tu agenda",
            description: `Tienes cita con ${clientName} el ${apt.fecha} a las ${horaStr}.`,
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
            description: `Tu solicitud de ${nov.tipo} para el ${nov.fecha} fue aprobada por administración.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/barbero/novedades",
            targetUserId: userId
          });
        } else if (nov.estado === "Rechazado" || nov.estado === "Rechazada") {
          notifications.push({
            id: `barber-nov-rech-${nov.id_novedad}`,
            type: "schedule",
            title: "Novedad Rechazada",
            description: `Tu solicitud de ${nov.tipo} para el ${nov.fecha} fue rechazada por administración.`,
            timestamp: nov.fecha_registro || nov.fecha,
            route: "/barbero/novedades",
            targetUserId: userId
          });
        }
      }

      // Insumos entregados al puesto de este barbero
      for (const item of stationItems) {
        if (Number(item.id_barbero) === myBarberId && item.estado_semaforo === "VERDE" && item.reabastecido_reciente) {
          notifications.push({
            id: `barber-station-ok-${item.id_estacion_insumo || item.id}`,
            type: "stock",
            title: "Insumos entregados a tu puesto",
            description: `El insumo "${item.insumo_nombre || "Insumo"}" fue reabastecido por bodega.`,
            timestamp: item.fecha_actualizacion || new Date().toISOString(),
            route: "/barbero/estacion",
            targetUserId: userId
          });
        }
      }
    }

    // 3. Cliente (4)
    if (roleId === 4) {
      const clients = getJson("barber_clients_db", []);
      const myClient = clients.find(
        (c) =>
          Number(c.id_usuario) === userId ||
          (user.id_cliente && Number(c.id_cliente) === Number(user.id_cliente)) ||
          (user.correo && c.correo?.toLowerCase() === user.correo?.toLowerCase())
      );
      const myClientId = myClient ? Number(myClient.id_cliente) : (user.id_cliente ? Number(user.id_cliente) : null);

      const myAppointments = appointments.filter(
        (a) =>
          Number(a.id_usuario) === userId ||
          (myClientId && Number(a.id_cliente) === myClientId) ||
          (user.correo && a.cliente_correo?.toLowerCase() === user.correo?.toLowerCase())
      );

      for (const apt of myAppointments.slice(0, 30)) {
        const horaStr = apt.hora ? apt.hora.substring(0, 5) : "";
        const barberName = apt.barberoNombre || apt.barbero_nombre || "tu barbero";

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
            description: `Tu turno con ${barberName} ha sido reprogramado para el ${apt.fecha} a las ${horaStr}.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        } else if (apt.estado === "Completada") {
          notifications.push({
            id: `client-apt-comp-${apt.id_cita}`,
            type: "appointment",
            title: "¡Servicio completado!",
            description: `Tu visita para ${apt.nombre_item || apt.servicio_nombre || "tu servicio"} ha concluido. ¡Esperamos verte pronto!`,
            timestamp: apt.fecha_completada || apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        } else {
          notifications.push({
            id: `client-apt-conf-${apt.id_cita}`,
            type: "appointment",
            title: "¡Cita agendada con éxito!",
            description: `Tu cita con ${barberName} para el ${apt.fecha} a las ${horaStr} está confirmada.`,
            timestamp: apt.fecha_registro || apt.fecha,
            route: "/portal/mis-citas",
            targetUserId: userId
          });
        }
      }

      // Alerta si el barbero asignado tiene una novedad aprobada en la fecha de la cita
      for (const apt of myAppointments) {
        if (apt.estado !== "Cancelada" && apt.estado !== "Completada") {
          const affectedNov = novelties.find(
            (n) =>
              Number(n.id_barbero) === Number(apt.id_barbero) &&
              n.fecha === apt.fecha &&
              (n.estado === "Aprobado" || n.estado === "Aprobada")
          );
          if (affectedNov) {
            notifications.push({
              id: `client-nov-alert-${apt.id_cita}-${affectedNov.id_novedad}`,
              type: "schedule",
              title: "Alerta de Disponibilidad",
              description: `Tu barbero reportó una novedad por ${affectedNov.tipo} el ${apt.fecha}. Te sugerimos reprogramar tu turno.`,
              timestamp: affectedNov.fecha_registro || `${apt.fecha}T07:00:00`,
              route: "/portal/mis-citas",
              targetUserId: userId
            });
          }
        }
      }

      // Compras realizadas por el cliente
      const myPurchases = sales.filter(
        (s) =>
          Number(s.id_usuario) === userId ||
          (myClientId && Number(s.id_cliente) === myClientId) ||
          (user.correo && s.cliente_correo?.toLowerCase() === user.correo?.toLowerCase())
      );
      for (const sale of myPurchases.slice(0, 10)) {
        notifications.push({
          id: `client-sale-${sale.id_venta}`,
          type: "sale",
          title: "Compra registrada",
          description: `Tu compra #${sale.id_venta} por $${Number(sale.total || 0).toLocaleString("es-CO")} fue procesada con éxito.`,
          timestamp: sale.fecha || new Date().toISOString(),
          route: "/portal/mis-compras",
          targetUserId: userId
        });
      }

      // Notificación de bienvenida si aún no tiene citas
      if (myAppointments.length === 0) {
        notifications.push({
          id: `client-welcome-${userId}`,
          type: "system",
          title: "¡Bienvenido a Tu Turno Barber!",
          description: "Tu cuenta ha sido creada exitosamente. Explora nuestro catálogo y agenda tu primer turno.",
          timestamp: user.fecha_registro || new Date().toISOString(),
          route: "/portal/agendar",
          targetUserId: userId
        });
      }
    }
  } catch (err) {
    console.warn("[notificationService] Error generando notificaciones dinámicas:", err);
  }

  // Combinar con las notificaciones creadas explícitamente en barber_notifications_db
  const explicit = getJson(STORAGE_KEY_NOTIFICATIONS, []);
  for (const exp of explicit) {
    const targetUid = exp.targetUserId || exp.targetUser;
    const matchesUser = !targetUid || Number(targetUid) === userId;
    const matchesBarber = !exp.targetBarberId || (myBarberId && Number(exp.targetBarberId) === myBarberId);
    const matchesRole = !exp.targetRole || (Array.isArray(exp.targetRole) ? exp.targetRole.includes(roleId) : Number(exp.targetRole) === roleId);

    if (matchesUser && matchesBarber && matchesRole) {
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
  window.addEventListener("barber_data_sync", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener("barber_notification_update", handleUpdate);
    window.removeEventListener("barber_data_sync", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
