import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markAsRead as serviceMarkAsRead,
  markAllAsRead as serviceMarkAllAsRead,
  deleteNotification as serviceDeleteNotification,
  clearReadNotifications as serviceClearReadNotifications,
  subscribeNotifications
} from "../../../../shared/services/notificationService.js";
import { getCurrentUser } from "../../../auth/services/authService.js";

/** Devuelve texto legible para el tiempo relativo */
export function timeAgo(date) {
  if (!date) return "Reciente";
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (isNaN(seconds) || seconds < 60) return "Hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? "s" : ""}`;
}

/** Colores e iconos por tipo de notificación */
export const NOTIFICATION_TYPE_CONFIG = {
  appointment: { color: "text-primary", bg: "bg-primary/10", label: "Citas" },
  schedule:    { color: "text-amber-500", bg: "bg-amber-500/10", label: "Horarios" },
  client:      { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Clientes" },
  sale:        { color: "text-primary", bg: "bg-primary/10", label: "Ventas" },
  stock:       { color: "text-destructive", bg: "bg-destructive/10", label: "Inventario" },
  system:      { color: "text-blue-500", bg: "bg-blue-500/10", label: "Sistema" }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const user = getCurrentUser();
      const list = await getNotifications(user);
      setNotifications(list);
    } catch (err) {
      console.warn("[useNotifications] Error cargando notificaciones:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeNotifications(() => {
      loadNotifications();
    });
    return () => unsubscribe();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    serviceMarkAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    serviceMarkAllAsRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const deleteNotification = useCallback((id) => {
    serviceDeleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearReadNotifications = useCallback(() => {
    serviceClearReadNotifications(notifications);
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    refreshNotifications: loadNotifications
  };
}
