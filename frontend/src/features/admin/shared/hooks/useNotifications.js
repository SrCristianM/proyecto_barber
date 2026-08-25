import { useState, useCallback } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    title: "Nueva cita agendada",
    description: "Juan Pérez agendó un Corte Clásico para hoy a las 10:00",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // hace 5 min
    read: false
  },
  {
    id: 2,
    type: "schedule",
    title: "Horario actualizado",
    description: "Carlos Rodríguez modificó su horario del Miércoles",
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // hace 20 min
    read: false
  },
  {
    id: 3,
    type: "client",
    title: "Nuevo cliente registrado",
    description: "Ana Torres se registró como nueva clienta",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // hace 1 hora
    read: false
  },
  {
    id: 4,
    type: "sale",
    title: "Venta registrada",
    description: "Venta #006 por $45.000 registrada por Admin",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    read: true
  },
  {
    id: 5,
    type: "stock",
    title: "Stock bajo — Gel Fijador",
    description: "Quedan 3 unidades de Gel Fijador Premium",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // hace 3 horas
    read: true
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
  appointment: { color: "text-primary", bg: "bg-primary/10", label: "Cita" },
  schedule:    { color: "text-warning",  bg: "bg-warning/10",  label: "Horario" },
  client:      { color: "text-success",  bg: "bg-success/10",  label: "Cliente" },
  sale:        { color: "text-primary",  bg: "bg-primary/10",  label: "Venta" },
  stock:       { color: "text-destructive", bg: "bg-destructive/10", label: "Stock" }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
