import { useState } from "react";
import { Bell, Search, User, Sun, Moon } from "lucide-react";
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
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Campanita con panel de notificaciones */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => setShowNotifications((v) => !v)}
            className={`p-2 hover:bg-accent rounded-lg text-foreground relative transition-colors ${
              showNotifications ? "bg-accent" : ""
            }`}
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* Toggle dark mode */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-accent rounded-lg text-foreground transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Avatar usuario */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
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