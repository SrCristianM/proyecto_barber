import { useEffect, useRef } from "react";
import { Check, CheckCheck, X, Calendar, Users, Clock, DollarSign, Package } from "lucide-react";
import { motion } from "motion/react";
import { timeAgo, NOTIFICATION_TYPE_CONFIG } from "../hooks/useNotifications";

const TYPE_ICONS = {
  appointment: Calendar,
  schedule:    Clock,
  client:      Users,
  sale:        DollarSign,
  stock:       Package
};

export default function NotificationPanel({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onClose }) {
  const panelRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
      style={{ maxHeight: "480px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Todas
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <CheckCheck className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const cfg = NOTIFICATION_TYPE_CONFIG[notif.type] || NOTIFICATION_TYPE_CONFIG.appointment;
            const Icon = TYPE_ICONS[notif.type] || Calendar;

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer ${
                  notif.read ? "bg-card hover:bg-accent/40" : "bg-primary/5 hover:bg-primary/10"
                }`}
                onClick={() => !notif.read && onMarkAsRead(notif.id)}
              >
                {/* Icono de tipo */}
                <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-snug ${notif.read ? "text-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {notif.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(notif.timestamp)}</p>
                </div>

                {/* Botón marcar como leída */}
                {!notif.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMarkAsRead(notif.id); }}
                    className="p-1 hover:bg-accent rounded-lg transition-colors shrink-0 mt-0.5"
                    title="Marcar como leída"
                  >
                    <Check className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-center">
        <button className="text-xs text-primary hover:underline font-medium transition-colors cursor-pointer">
          Ver todas las notificaciones
        </button>
      </div>
    </motion.div>
  );
}
