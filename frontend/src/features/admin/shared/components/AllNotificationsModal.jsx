import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  X,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Package,
  ExternalLink,
  Filter,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { timeAgo, NOTIFICATION_TYPE_CONFIG } from "../hooks/useNotifications";

const TYPE_ICONS = {
  appointment: Calendar,
  schedule: Clock,
  client: Users,
  sale: DollarSign,
  stock: Package
};

export default function AllNotificationsModal({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAsUnread,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearReadNotifications,
  onClose
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' | 'unread' | 'appointment' | 'schedule' | 'client' | 'sale' | 'stock'

  // Categorías con conteos
  const categoryCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      appointment: notifications.filter((n) => n.type === "appointment").length,
      schedule: notifications.filter((n) => n.type === "schedule").length,
      client: notifications.filter((n) => n.type === "client").length,
      sale: notifications.filter((n) => n.type === "sale").length,
      stock: notifications.filter((n) => n.type === "stock").length
    };
    return counts;
  }, [notifications]);

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Filtro de categoría
      if (selectedCategory === "unread" && notif.read) return false;
      if (selectedCategory !== "all" && selectedCategory !== "unread" && notif.type !== selectedCategory) {
        return false;
      }

      // Filtro de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesDesc = notif.description.toLowerCase().includes(query);
        const matchesType = (NOTIFICATION_TYPE_CONFIG[notif.type]?.label || "").toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesType;
      }

      return true;
    });
  }, [notifications, selectedCategory, searchTerm]);

  // Agrupación por tiempo
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    filteredNotifications.forEach((notif) => {
      const notifDate = new Date(notif.timestamp);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const handleNavigateToModule = (route) => {
    if (route) {
      onClose();
      navigate(route);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Centro de Notificaciones</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Historial completo de alertas, citas y actividades del negocio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 border border-primary/20 rounded-xl transition-colors cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas leídas
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Categories Toolbar */}
        <div className="p-4 sm:px-6 border-b border-border bg-secondary/20 space-y-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, barbero, servicio, producto o concepto..."
              className="w-full pl-10 pr-10 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-xs sm:text-sm"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtros por Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              Todas ({categoryCounts.all})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("unread")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "unread"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              No leídas ({categoryCounts.unread})
            </button>

            <div className="h-4 w-[1px] bg-border mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setSelectedCategory("appointment")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "appointment"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Citas ({categoryCounts.appointment})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "schedule"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Horarios ({categoryCounts.schedule})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("client")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "client"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Clientes ({categoryCounts.client})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("sale")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "sale"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Ventas ({categoryCounts.sale})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("stock")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "stock"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Inventario ({categoryCounts.stock})
            </button>
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground mb-3">
                <Inbox className="h-8 w-8 opacity-40" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No hay notificaciones</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No se encontraron notificaciones que coincidan con los filtros seleccionados.
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 px-3.5 py-2 text-xs bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sección: Hoy */}
              {groupedNotifications.today.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Hoy
                    </span>
                    <div className="h-[1px] flex-1 bg-border/60" />
                  </div>
                  <div className="space-y-2.5">
                    {groupedNotifications.today.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notif={notif}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAsUnread={onMarkAsUnread}
                        onDelete={onDeleteNotification}
                        onNavigate={handleNavigateToModule}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sección: Ayer */}
              {groupedNotifications.yesterday.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Ayer
                    </span>
                    <div className="h-[1px] flex-1 bg-border/60" />
                  </div>
                  <div className="space-y-2.5">
                    {groupedNotifications.yesterday.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notif={notif}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAsUnread={onMarkAsUnread}
                        onDelete={onDeleteNotification}
                        onNavigate={handleNavigateToModule}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sección: Anteriores */}
              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Anteriores
                    </span>
                    <div className="h-[1px] flex-1 bg-border/60" />
                  </div>
                  <div className="space-y-2.5">
                    {groupedNotifications.earlier.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notif={notif}
                        onMarkAsRead={onMarkAsRead}
                        onMarkAsUnread={onMarkAsUnread}
                        onDelete={onDeleteNotification}
                        onNavigate={handleNavigateToModule}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-border bg-secondary/30 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{filteredNotifications.length}</span> de{" "}
            <span className="font-semibold text-foreground">{notifications.length}</span> notificaciones
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => n.read) && (
              <button
                type="button"
                onClick={onClearReadNotifications}
                className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
              >
                Limpiar leídas
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationItem({ notif, onMarkAsRead, onMarkAsUnread, onDelete, onNavigate }) {
  const cfg = NOTIFICATION_TYPE_CONFIG[notif.type] || NOTIFICATION_TYPE_CONFIG.appointment;
  const Icon = TYPE_ICONS[notif.type] || Calendar;

  return (
    <div
      className={`group p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
        notif.read
          ? "bg-card border-border/80 hover:border-border hover:shadow-xs"
          : "bg-primary/5 border-primary/20 hover:border-primary/40 shadow-xs"
      }`}
    >
      {/* Icono temático */}
      <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-primary/10`}>
        <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
      </div>

      {/* Cuerpo de la Notificación */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-semibold leading-snug ${notif.read ? "text-foreground" : "text-foreground font-bold"}`}>
              {notif.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">
              {timeAgo(notif.timestamp)}
            </span>
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-primary inline-block" title="No leída" />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {notif.description}
        </p>

        {/* Acciones de la notificación */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/40">
          <div>
            {notif.route && (
              <button
                type="button"
                onClick={() => onNavigate(notif.route)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <span>Ver detalles en {cfg.label}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {notif.read ? (
              <button
                type="button"
                onClick={() => onMarkAsUnread(notif.id)}
                className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                title="Marcar como no leída"
              >
                Marcar no leída
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMarkAsRead(notif.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                title="Marcar como leída"
              >
                <Check className="h-3 w-3" />
                <span>Leída</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(notif.id)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Eliminar notificación"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
