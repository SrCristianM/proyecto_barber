import { useState, useCallback } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "schedule",
    title: "Sistema listo para operar",
    description: "Tu Turno Barber ha sido inicializado limpiamente. Las alertas operativas y notificaciones en tiempo real aparecerán aquí.",
    timestamp: new Date(),
    read: false,
    route: "/dashboard"
  }
];

/** Devuelve texto legible para el tiempo relativo */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Hace un momento";
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
  schedule:    { color: "text-amber-500",  bg: "bg-amber-500/10",  label: "Horarios" },
  client:      { color: "text-emerald-500",  bg: "bg-emerald-500/10",  label: "Clientes" },
  sale:        { color: "text-primary",  bg: "bg-primary/10",  label: "Ventas" },
  stock:       { color: "text-destructive", bg: "bg-destructive/10", label: "Inventario" }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearReadNotifications = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
  };
}
