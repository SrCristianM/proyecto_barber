import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { Scissors, Settings, Menu } from "lucide-react";
import { menuItems } from "./menuItems";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const isSettingsActive = location.pathname === "/dashboard/settings";

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} z-40`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="font-bold text-sidebar-foreground">Tu Turno</span>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "text-sidebar-foreground dark:text-white font-semibold shadow-xs"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70"
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        className="sidebar-active-pill -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 transition-colors ${isActive ? "text-[#D4AF37]" : ""}`}>
                        {item.icon}
                      </span>
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="relative">
            <Link
              to="/dashboard/settings"
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isSettingsActive
                  ? "text-sidebar-foreground dark:text-white font-semibold shadow-xs"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/70"
              }`}
              title={!sidebarOpen ? "Configuración" : undefined}
            >
              {isSettingsActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="sidebar-active-pill -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3 min-w-0">
                <Settings className={`h-5 w-5 shrink-0 transition-colors ${isSettingsActive ? "text-[#D4AF37]" : ""}`} />
                {sidebarOpen && <span className="truncate">Configuración</span>}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;