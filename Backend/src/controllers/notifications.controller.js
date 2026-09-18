/**
 * @file notifications.controller.js
 * Controlador HTTP para el módulo de notificaciones.
 */

import { NotificationsService } from "../services/notifications.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export class NotificationsController {
  static async getAll(req, res, next) {
    try {
      const notifications = await NotificationsService.getNotificationsForUser(req.user);
      return ApiResponse.success(res, notifications, "Notificaciones obtenidas correctamente");
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const result = NotificationsService.markAsRead(req.params.id, req.user.id_usuario);
      return ApiResponse.success(res, result, "Notificación marcada como leída");
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationsService.markAllAsRead(req.user);
      return ApiResponse.success(res, result, "Todas las notificaciones marcadas como leídas");
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      const result = NotificationsService.deleteNotification(req.params.id, req.user.id_usuario);
      return ApiResponse.success(res, result, "Notificación descartada correctamente");
    } catch (error) {
      next(error);
    }
  }

  static async clearRead(req, res, next) {
    try {
      const result = await NotificationsService.clearRead(req.user);
      return ApiResponse.success(res, result, "Notificaciones leídas eliminadas correctamente");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const created = NotificationsService.createCustomNotification(req.body);
      return ApiResponse.created(res, created, "Notificación creada exitosamente");
    } catch (error) {
      next(error);
    }
  }
}
