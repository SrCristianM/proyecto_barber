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
          if (apt.estado === "Cancelada") {
            notifications.push({
              id: `apt-canc-${apt.id_cita}`,
              type: "appointment",
              title: "Cita cancelada",
              description: `La cita de ${apt.cliente_nombre || "Cliente"} (${apt.fecha} ${apt.hora ? apt.hora.substring(0, 5) : ""}) fue cancelada.`,
              timestamp: apt.fecha_registro || apt.fecha,
              route: "/admin/citas"
            });
          } else if (apt.estado === "Reprogramada") {
            notifications.push({
              id: `apt-reprog-${apt.id_cita}`,
              type: "appointment",
              title: "Cita reprogramada",
              description: `La cita de ${apt.cliente_nombre || "Cliente"} fue reprogramada para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
              timestamp: apt.fecha_registro || apt.fecha,
              route: "/admin/citas"
            });
          } else {
            notifications.push({
              id: `apt-new-${apt.id_cita}`,
              type: "appointment",
              title: "Cita en agenda",
              description: `Cita programada con ${apt.barbero_nombre || "Barbero"} para ${apt.cliente_nombre || "Cliente"} el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
              timestamp: apt.fecha_registro || apt.fecha,
              route: "/admin/citas"
            });
          }
        }

        // B. Novedades de horario pendientes
        const allNovelties = await SchedulesRepository.findAllNovelties();
        const pendingNovelties = (allNovelties || []).filter((n) => n.estado === "Pendiente");

        for (const nov of pendingNovelties) {
          notifications.push({
            id: `nov-pend-${nov.id_novedad}`,
            type: "schedule",
            title: "Nueva novedad de horario solicitada",
            description: `El barbero ${nov.barbero_nombre || "Barbero"} solicitó ${nov.tipo} para el ${nov.fecha}.`,
            timestamp: nov.fecha_registro || nov.fecha,
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
            if (apt.estado === "Cancelada") {
              notifications.push({
                id: `barber-apt-canc-${apt.id_cita}`,
                type: "appointment",
                title: "Cita cancelada",
                description: `Tu cita con ${apt.cliente_nombre || "Cliente"} para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""} ha sido cancelada.`,
                timestamp: apt.fecha_registro || apt.fecha,
                route: "/barbero/agenda"
              });
            } else {
              notifications.push({
                id: `barber-apt-${apt.id_cita}`,
                type: "appointment",
                title: "Cita en tu agenda",
                description: `Tienes cita programada con ${apt.cliente_nombre || "Cliente"} el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
                timestamp: apt.fecha_registro || apt.fecha,
                route: "/barbero/agenda"
              });
            }
          }

          // Novedades de este barbero (Aprobadas o Rechazadas)
          const allNovelties = await SchedulesRepository.findAllNovelties({ barber: barberId });
          for (const nov of allNovelties || []) {
            if (nov.estado === "Aprobado" || nov.estado === "Aprobada") {
              notifications.push({
                id: `barber-nov-aprob-${nov.id_novedad}`,
                type: "schedule",
                title: "Novedad Aprobada",
                description: `Tu solicitud de ${nov.tipo} para el día ${nov.fecha} fue aprobada por la administración.`,
                timestamp: nov.fecha_registro || nov.fecha,
                route: "/barbero/novedades"
              });
            } else if (nov.estado === "Rechazado" || nov.estado === "Rechazada") {
              notifications.push({
                id: `barber-nov-rech-${nov.id_novedad}`,
                type: "schedule",
                title: "Novedad Rechazada",
                description: `Tu solicitud de ${nov.tipo} para el día ${nov.fecha} fue rechazada por la administración.`,
                timestamp: nov.fecha_registro || nov.fecha,
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
            if (apt.estado === "Cancelada") {
              notifications.push({
                id: `client-apt-canc-${apt.id_cita}`,
                type: "appointment",
                title: "Tu cita fue cancelada",
                description: `Tu turno para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""} ha sido cancelado.`,
                timestamp: apt.fecha_registro || apt.fecha,
                route: "/portal/mis-citas"
              });
            } else if (apt.estado === "Reprogramada") {
              notifications.push({
                id: `client-apt-reprog-${apt.id_cita}`,
                type: "appointment",
                title: "Tu cita fue reprogramada",
                description: `Tu turno con ${apt.barbero_nombre || "tu barbero"} ha sido reprogramado para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
                timestamp: apt.fecha_registro || apt.fecha,
                route: "/portal/mis-citas"
              });
            } else {
              notifications.push({
                id: `client-apt-conf-${apt.id_cita}`,
                type: "appointment",
                title: "Cita agendada con éxito",
                description: `Tu turno con ${apt.barbero_nombre || "tu barbero"} está confirmado para el ${apt.fecha} a las ${apt.hora ? apt.hora.substring(0, 5) : ""}.`,
                timestamp: apt.fecha_registro || apt.fecha,
                route: "/portal/mis-citas"
              });
            }
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

    // Filtrar descartadas y mapear estado de lectura
    return notifications
      .filter((n) => !userDismissedSet.has(String(n.id)))
      .map((n) => ({
        ...n,
        read: userReadSet.has(String(n.id)) || !!n.read,
        timestamp: n.timestamp ? new Date(n.timestamp) : new Date()
      }))
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
