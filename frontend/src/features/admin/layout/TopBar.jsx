import { useState, useEffect } from "react";
import { Bell, User, Sun, Moon, LogOut, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useNotifications } from "../shared/hooks/useNotifications";
import NotificationPanel from "../shared/components/NotificationPanel";
import AllNotificationsModal from "../shared/components/AllNotificationsModal";
import CommandPaletteModal from "../shared/components/CommandPaletteModal";
import { getCurrentUser, logoutUser } from "../../auth/services/authService";
import { ROLES } from "../../../shared/types/database";

const TopBar = ({ isDark, setIsDark }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // Atajo global Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleName = (id_rol) => {
    const r = ROLES.find((role) => role.id_rol === Number(id_rol));
    return r ? r.nombre_rol : "Usuario";
  };

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
  } = useNotifications();

  const handleOpenAllNotifications = () => {
    setShowNotifications(false);
    setShowAllNotificationsModal(true);
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 gap-4">
      {/* Disparador de Command Palette Global (Ctrl + K) */}
      <div className="flex-1 max-w-md">
        <button
          type="button"
          onClick={() => setShowCommandPalette(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-secondary/60 hover:bg-secondary border border-border/80 hover:border-primary/50 rounded-xl transition-all text-xs text-muted-foreground group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Buscar clientes, productos o acciones...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-background border border-border rounded text-muted-foreground shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </button>
      </div>

      {/* Modal de Command Palette */}
      <CommandPaletteModal open={showCommandPalette} onOpenChange={setShowCommandPalette} />

      <div className="flex items-center gap-4 shrink-0">
        {/* Campanita con panel de notificaciones */}
        <div className="relative">
          <motion.button
            id="notification-bell"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications((v) => !v)}
            className={`p-2 hover:bg-accent rounded-xl text-foreground relative transition-colors cursor-pointer ${showNotifications ? "bg-accent" : ""
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
                onViewAll={handleOpenAllNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Modal de Centro de Notificaciones Completo */}
        <AnimatePresence>
          {showAllNotificationsModal && (
            <AllNotificationsModal
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onMarkAllAsRead={markAllAsRead}
              onDeleteNotification={deleteNotification}
              onClearReadNotifications={clearReadNotifications}
              onClose={() => setShowAllNotificationsModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Toggle dark mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-accent rounded-xl text-foreground transition-colors cursor-pointer"
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

        {/* Avatar usuario y Perfil */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-xs">
            <User className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-foreground">
              {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : "Administrador"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {currentUser ? getRoleName(currentUser.id_rol) : "Administrador"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              logoutUser();
              navigate("/login");
            }}
            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-colors cursor-pointer ml-1"
            title="Cerrar sesión"
          >
            <LogOut className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;