
function normalizeTimeTo24(timeStr) {
  if (!timeStr) return "09:00:00";
  const raw = String(timeStr).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!match) return "09:00:00";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const s = match[3] || "00";
  const modifier = match[4] ? match[4].toLowerCase() : null;

  if (modifier) {
    const isPm = modifier.includes("p");
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  }
  return `${h.toString().padStart(2, "0")}:${m}:${s}`;
}

function formatNotificationTime(timeStr) {
  if (!timeStr) return "";
  const raw = String(timeStr).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!match) return raw;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const modifier = match[4] ? match[4].toLowerCase() : null;

  if (modifier) {
    const isPm = modifier.includes("p");
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  }

  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12.toString().padStart(2, "0")}:${m} ${period}`;
}

function formatNotificationDate(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim().substring(0, 10);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return str;
  const [_, y, m, d] = match;
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${d} ${monthName} ${y}`;
}


/**
 * @file notifications.service.js
 * Servicio centralizado de notificaciones generado puramente mediante lógica de negocio
 * analizando entidades existentes (citas, novedades, inventario) sin alterar ni agregar tablas en MySQL.
 */

import { AppointmentsRepository } from "../models/appointments.model.js";
import { SchedulesRepository } from "../models/schedules.model.js";
import { ProductsRepository } from "../models/products.model.js";
import { BarbersRepository } from "../models/barbers.model.js";
import { ClientsRepository } from "../models/clients.model.js";
import { ROLES } from "../config/constants.js";

// Almacén operativo en memoria para estados de lectura y descarte por usuario
const readNotificationIdsByUser = new Map();
const dismissedNotificationIdsByUser = new Map();
const customNotifications = [];

export class NotificationsService {
  /**
   * Obtiene y genera las notificaciones correspondientes para el usuario autenticado.
   */
  static async getNotificationsForUser(user) {
    if (!user) return [];

    const userId = Number(user.id_usuario);
    const roleId = Number(user.id_rol);

    const userReadSet = readNotificationIdsByUser.get(userId) || new Set();
    const userDismissedSet = dismissedNotificationIdsByUser.get(userId) || new Set();

    const notifications = [];

    try {
      // 1. Administrador (1) y Recepcionista (2)
      if (roleId === ROLES.ADMIN || roleId === ROLES.RECEPCIONISTA) {
        // A. Citas recientes y estados
        const allAppointments = await AppointmentsRepository.findAll();
        const recentAppointments = (allAppointments || []).slice(0, 30);

        for (const apt of recentAppointments) {
          const timeStr = normalizeTimeTo24(apt.hora);
          const aptTimestamp = apt.fecha_registro || (apt.fecha ? `${String(apt.fecha).substring(0, 10)}T${timeStr}` : new Date().toISOString());
          const displayTime = formatNotificationTime(apt.hora);
          const displayDate = formatNotificationDate(apt.fecha);

          if (apt.estado === "Cancelada") {
            notifications.push({
              id: `apt-canc-${apt.id_cita}`,
              type: "appointment",
              title: "Cita cancelada",
              description: `La cita de ${apt.cliente_nombre || "Cliente"} (${displayDate} a las ${displayTime}) fue cancelada.`,
              timestamp: aptTimestamp,
              route: "/admin/citas"
            });
          } else if (apt.estado === "Reprogramada") {
            notifications.push({
              id: `apt-reprog-${apt.id_cita}`,
              type: "appointment",
              title: "Cita reprogramada",
              description: `La cita de ${apt.cliente_nombre || "Cliente"} fue reprogramada para el ${displayDate} a las ${displayTime}.`,
              timestamp: aptTimestamp,
              route: "/admin/citas"
            });
          } else {
            notifications.push({
              id: `apt-new-${apt.id_cita}`,
              type: "appointment",
              title: "Cita en agenda",
              description: `Cita programada con ${apt.barbero_nombre || "Barbero"} para ${apt.cliente_nombre || "Cliente"} el ${displayDate} a las ${displayTime}.`,
              timestamp: aptTimestamp,
              route: "/admin/citas"
            });
          }
        }

        // B. Novedades de horario pendientes
        const allNovelties = await SchedulesRepository.findAllNovelties();
        const pendingNovelties = (allNovelties || []).filter((n) => n.estado === "Pendiente");

        for (const nov of pendingNovelties) {
          const novTimestamp = nov.fecha_registro || (nov.fecha ? `${nov.fecha}T08:00:00` : new Date().toISOString());
          notifications.push({
            id: `nov-pend-${nov.id_novedad}`,
            type: "schedule",
            title: "Nueva novedad de horario solicitada",
            description: `El barbero ${nov.barbero_nombre || "Barbero"} solicitó ${nov.tipo} para el ${formatNotificationDate(nov.fecha)}.`,
            timestamp: novTimestamp,
            route: "/admin/horarios"
          });
        }

        // C. Productos con stock crítico (<= 5)
        const lowStockProducts = await ProductsRepository.findAll({ lowStock: true });
        for (const prod of lowStockProducts || []) {
          notifications.push({
            id: `stock-crit-${prod.id_producto}`,
            type: "stock",
            title: "Alerta de Stock Crítico",
            description: `El producto "${prod.nombre}" cuenta con solo ${prod.stock} unidad(es) disponible(s).`,
            timestamp: new Date().toISOString(),
            route: "/admin/productos"
          });
        }
      }

      // 2. Barbero (3)
      if (roleId === ROLES.BARBERO) {
        // Encontrar barbero vinculado al usuario
        const allBarbers = await BarbersRepository.findAll();
        const currentBarber = (allBarbers || []).find((b) => Number(b.id_usuario) === userId);

        if (currentBarber) {
          const barberId = currentBarber.id_barbero;

          // Citas asignadas a este barbero
          const barberAppointments = await AppointmentsRepository.findAll({ barber: barberId });
          for (const apt of barberAppointments || []) {
            const timeStr = normalizeTimeTo24(apt.hora);
          const aptTimestamp = apt.fecha_registro || (apt.fecha ? `${String(apt.fecha).substring(0, 10)}T${timeStr}` : new Date().toISOString());
          const displayTime = formatNotificationTime(apt.hora);
          const displayDate = formatNotificationDate(apt.fecha);

            if (apt.estado === "Cancelada") {
              notifications.push({
                id: `barber-apt-canc-${apt.id_cita}`,
                type: "appointment",
                title: "Cita cancelada",
                description: `Tu cita con ${apt.cliente_nombre || "Cliente"} para el ${displayDate} a las ${displayTime} ha sido cancelada.`,
                timestamp: aptTimestamp,
                route: "/barbero/agenda"
              });
            } else {
              notifications.push({
                id: `barber-apt-${apt.id_cita}`,
                type: "appointment",
                title: "Cita en tu agenda",
                description: `Tienes cita programada con ${apt.cliente_nombre || "Cliente"} el ${displayDate} a las ${displayTime}.`,
                timestamp: aptTimestamp,
                route: "/barbero/agenda"
              });
            }
          }

          // Novedades de este barbero (Aprobadas o Rechazadas)
          const allNovelties = await SchedulesRepository.findAllNovelties({ barber: barberId });
          for (const nov of allNovelties || []) {
            const novTimestamp = nov.fecha_registro || (nov.fecha ? `${nov.fecha}T08:00:00` : new Date().toISOString());
            if (nov.estado === "Aprobado" || nov.estado === "Aprobada") {
              notifications.push({
                id: `barber-nov-aprob-${nov.id_novedad}`,
                type: "schedule",
                title: "Novedad Aprobada",
                description: `Tu solicitud de ${nov.tipo} para el día ${formatNotificationDate(nov.fecha)} fue aprobada por la administración.`,
                timestamp: novTimestamp,
                route: "/barbero/novedades"
              });
            } else if (nov.estado === "Rechazado" || nov.estado === "Rechazada") {
              notifications.push({
                id: `barber-nov-rech-${nov.id_novedad}`,
                type: "schedule",
                title: "Novedad Rechazada",
                description: `Tu solicitud de ${nov.tipo} para el día ${formatNotificationDate(nov.fecha)} fue rechazada por la administración.`,
                timestamp: novTimestamp,
                route: "/barbero/novedades"
              });
            }
          }
        }
      }

      // 3. Cliente (4)
      if (roleId === ROLES.CLIENTE) {
        const allClients = await ClientsRepository.findAll();
        const currentClient = (allClients || []).find((c) => Number(c.id_usuario) === userId);

        if (currentClient) {
          const clientId = currentClient.id_cliente;
          const clientAppointments = await AppointmentsRepository.findAll({ client: clientId });

          for (const apt of clientAppointments || []) {
            const timeStr = apt.hora ? (apt.hora.length === 5 ? `${apt.hora}:00` : apt.hora) : "09:00:00";
            // Timestamp con fecha y hora combinadas para evitar desfase de zona horaria UTC
            const aptTimestamp = apt.fecha_registro || (apt.fecha ? `${apt.fecha}T${timeStr}` : new Date().toISOString());
            const displayTime = formatNotificationTime(apt.hora || timeStr);
            const displayDate = formatNotificationDate(apt.fecha);

            if (apt.estado === "Cancelada") {
              notifications.push({
                id: `client-apt-canc-${apt.id_cita}`,
                type: "appointment",
                title: "Tu cita fue cancelada",
                description: `Tu turno para el ${displayDate} a las ${displayTime} ha sido cancelado.`,
                timestamp: aptTimestamp,
                route: "/portal/mis-citas"
              });
            } else if (apt.estado === "Reprogramada") {
              notifications.push({
                id: `client-apt-reprog-${apt.id_cita}`,
                type: "appointment",
                title: "Tu cita fue reprogramada",
                description: `Tu turno con ${apt.barbero_nombre || "tu barbero"} ha sido reprogramado para el ${displayDate} a las ${displayTime}.`,
                timestamp: aptTimestamp,
                route: "/portal/mis-citas"
              });
            } else {
              notifications.push({
                id: `client-apt-conf-${apt.id_cita}`,
                type: "appointment",
                title: "Cita agendada con éxito",
                description: `Tu turno con ${apt.barbero_nombre || "tu barbero"} está confirmado para el ${displayDate} a las ${displayTime}.`,
                timestamp: aptTimestamp,
                route: "/portal/mis-citas"
              });
            }
          }

          // Alerta si el barbero asignado tiene una novedad aprobada en la fecha de la cita
          try {
            const allNovelties = await SchedulesRepository.findAllNovelties();
            for (const apt of clientAppointments || []) {
              if (apt.estado !== "Cancelada" && apt.estado !== "Finalizada") {
                const affectedNov = (allNovelties || []).find(
                  (nov) => Number(nov.id_barbero) === Number(apt.id_barbero) &&
                           nov.fecha === apt.fecha &&
                           (nov.estado === "Aprobado" || nov.estado === "Aprobada")
                );
                if (affectedNov) {
                  notifications.push({
                    id: `client-nov-alert-${apt.id_cita}-${affectedNov.id_novedad}`,
                    type: "schedule",
                    title: "Alerta de Disponibilidad",
                    description: `Tu barbero reportó una ausencia por ${affectedNov.tipo} el ${formatNotificationDate(affectedNov.fecha)}. Te sugerimos reprogramar tu turno.`,
                    timestamp: affectedNov.fecha_registro || `${apt.fecha}T07:00:00`,
                    route: "/portal/mis-citas"
                  });
                }
              }
            }
          } catch (_) {}

          // Notificación de bienvenida si aún no tiene citas
          if (!clientAppointments || clientAppointments.length === 0) {
            notifications.push({
              id: `client-welcome-${userId}`,
              type: "system",
              title: "¡Bienvenido a Tu Turno Barber!",
              description: "Tu cuenta ha sido creada exitosamente. Explora nuestro catálogo y agenda tu primer turno.",
              timestamp: currentClient.fecha_registro || new Date().toISOString(),
              route: "/portal/agendar"
            });
          }
        }
      }

      // 4. Notificaciones dinámicas personalizadas emitidas en tiempo de ejecución
      for (const custom of customNotifications) {
        const matchesUser = !custom.id_usuario || Number(custom.id_usuario) === userId;
        const matchesRole = !custom.id_rol || Number(custom.id_rol) === roleId;
        if (matchesUser && matchesRole) {
          notifications.push({ ...custom });
        }
      }
    } catch (err) {
      console.error("[NotificationsService] Error generando notificaciones dinámicas:", err);
    }

    // Filtrar descartadas y mapear estado de lectura con timestamp ISO 8601 estandarizado
    return notifications
      .filter((n) => !userDismissedSet.has(String(n.id)))
      .map((n) => {
        let isoTimestamp = new Date().toISOString();
        if (n.timestamp) {
          if (n.timestamp instanceof Date && !isNaN(n.timestamp.getTime())) {
            isoTimestamp = n.timestamp.toISOString();
          } else {
            const str = String(n.timestamp).trim();
            if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(str)) {
              const d = new Date(str.replace(" ", "T"));
              if (!isNaN(d.getTime())) isoTimestamp = d.toISOString();
            } else {
              const d = new Date(str);
              if (!isNaN(d.getTime())) isoTimestamp = d.toISOString();
            }
          }
        }
        return {
          ...n,
          read: userReadSet.has(String(n.id)) || !!n.read,
          timestamp: isoTimestamp
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Marca una notificación como leída para un usuario específico.
   */
  static markAsRead(notificationId, userId) {
    const uId = Number(userId);
    if (!readNotificationIdsByUser.has(uId)) {
      readNotificationIdsByUser.set(uId, new Set());
    }
    readNotificationIdsByUser.get(uId).add(String(notificationId));

    const custom = customNotifications.find((c) => String(c.id) === String(notificationId));
    if (custom) {
      custom.read = true;
    }

    return { success: true, id: notificationId };
  }

  /**
   * Marca todas las notificaciones activas de un usuario como leídas.
   */
  static async markAllAsRead(user) {
    const notifications = await this.getNotificationsForUser(user);
    const uId = Number(user.id_usuario);
    if (!readNotificationIdsByUser.has(uId)) {
      readNotificationIdsByUser.set(uId, new Set());
    }
    const set = readNotificationIdsByUser.get(uId);
    for (const n of notifications) {
      set.add(String(n.id));
    }
    return { success: true, count: notifications.length };
  }

  /**
   * Descarta una notificación (la elimina de la vista del usuario).
   */
  static deleteNotification(notificationId, userId) {
    const uId = Number(userId);
    if (!dismissedNotificationIdsByUser.has(uId)) {
      dismissedNotificationIdsByUser.set(uId, new Set());
    }
    dismissedNotificationIdsByUser.get(uId).add(String(notificationId));
    return { success: true, id: notificationId };
  }

  /**
   * Limpia todas las notificaciones marcadas como leídas para un usuario.
   */
    /**
   * Limpia y vacía toda la bandeja de notificaciones para un usuario.
   */
  static async clearAll(user) {
    const notifications = await this.getNotificationsForUser(user);
    const uId = Number(user.id_usuario);
    if (!dismissedNotificationIdsByUser.has(uId)) {
      dismissedNotificationIdsByUser.set(uId, new Set());
    }
    const dismissed = dismissedNotificationIdsByUser.get(uId);
    for (const n of notifications) {
      dismissed.add(String(n.id));
    }
    return { success: true, count: notifications.length };
  }

static async clearRead(user) {
    const notifications = await this.getNotificationsForUser(user);
    const uId = Number(user.id_usuario);
    if (!dismissedNotificationIdsByUser.has(uId)) {
      dismissedNotificationIdsByUser.set(uId, new Set());
    }
    const dismissed = dismissedNotificationIdsByUser.get(uId);
    for (const n of notifications) {
      if (n.read) {
        dismissed.add(String(n.id));
      }
    }
    return { success: true };
  }

  /**
   * Permite despachar una notificación personalizada dirigida por rol o usuario.
   */
  static createCustomNotification(data) {
    const newNotif = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: data.type || "system",
      title: data.title || "Notificación",
      description: data.description || "",
      timestamp: new Date().toISOString(),
      route: data.route || null,
      id_usuario: data.id_usuario ? Number(data.id_usuario) : null,
      id_rol: data.id_rol ? Number(data.id_rol) : null,
      read: false
    };
    customNotifications.unshift(newNotif);
    if (customNotifications.length > 200) {
      customNotifications.pop();
    }
    return newNotif;
  }
}
