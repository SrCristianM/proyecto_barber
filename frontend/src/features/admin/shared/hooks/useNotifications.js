import { useState, useCallback } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    title: "Nueva cita agendada",
    description: "Juan Pérez agendó un Corte Clásico para hoy a las 10:00 con Carlos Rodríguez",
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // hace 10 min
    read: false,
    route: "/dashboard/appointments"
  },
  {
    id: 2,
    type: "schedule",
    title: "Horario actualizado",
    description: "Carlos Rodríguez modificó su horario de atención del Miércoles (09:00 - 18:00)",
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // hace 25 min
    read: false,
    route: "/dashboard/schedules"
  },
  {
    id: 3,
    type: "client",
    title: "Nuevo cliente registrado",
    description: "Ana Torres se registró como nueva clienta desde la app web",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // hace 1 hora
    read: false,
    route: "/dashboard/clients"
  },
  {
    id: 4,
    type: "sale",
    title: "Venta registrada #006",
    description: "Venta #006 por $45.000 (Corte Clásico + Pomada Mate) registrada en mostrador",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    read: true,
    route: "/dashboard/sales"
  },
  {
    id: 5,
    type: "stock",
    title: "Alerta de Stock bajo — Gel Fijador",
    description: "Quedan solo 3 unidades de Gel Fijador Premium en inventario. Se recomienda reordenar.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // hace 3 horas
    read: true,
    route: "/dashboard/products"
  },
  {
    id: 6,
    type: "appointment",
    title: "Cita completada exitosamente",
    description: "Cita de Pedro López finalizada. Servicio: Barba & Afeitado con Navaja.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // hace 1 día
    read: true,
    route: "/dashboard/appointments"
  },
  {
    id: 7,
    type: "sale",
    title: "Venta registrada #005",
    description: "Venta #005 por $75.000 facturada a María García.",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000), // hace 1 día
    read: true,
    route: "/dashboard/sales"
  },
  {
    id: 8,
    type: "schedule",
    title: "Solicitud de permiso aprobada",
    description: "Permiso solicitado por Miguel Ángel para el próximo Viernes ha sido Aprobado.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // hace 2 días
    read: true,
    route: "/dashboard/schedules"
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
