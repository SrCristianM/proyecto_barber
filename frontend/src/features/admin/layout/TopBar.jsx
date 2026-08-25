import { useState } from "react";
import { Bell, Search, User, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNotifications } from "../shared/hooks/useNotifications";
import NotificationPanel from "../shared/components/NotificationPanel";

const TopBar = ({ isDark, setIsDark }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Buscador */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Campanita con panel de notificaciones */}
        <div className="relative">
          <motion.button
            id="notification-bell"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications((v) => !v)}
            className={`p-2 hover:bg-accent rounded-lg text-foreground relative transition-colors cursor-pointer ${
              showNotifications ? "bg-accent" : ""
            }`}
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex items-center justify-center min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-0.5 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Toggle dark mode */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-accent rounded-lg text-foreground transition-colors cursor-pointer"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <motion.div
            key={isDark ? "dark" : "light"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {isDark ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-foreground" />}
          </motion.div>
        </motion.button>

        {/* Avatar usuario */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-xs">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;