import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { Scissors, Settings, Menu } from "lucide-react";
import { menuItems } from "./menuItems";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import { usePermissions } from "../../auth/hooks/usePermissions";

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const location = useLocation();
  const { isRecepcionista, canAccess } = usePermissions();

  const isSettingsActive = location.pathname === "/dashboard/settings";

  // Filtrado de menú dinámico según la matriz de permisos RBAC en tiempo real
  const visibleMenuItems = menuItems.filter((item) => canAccess(item.path));

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isMobile
          ? sidebarOpen
            ? "w-64 translate-x-0 z-50 shadow-2xl"
            : "w-64 -translate-x-full z-50 pointer-events-none"
          : sidebarOpen
          ? "w-64 translate-x-0 z-40"
          : "w-20 translate-x-0 z-40"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo y Botón de colapso */}
        <div className={`h-16 flex items-center ${sidebarOpen ? "justify-between px-4" : "justify-center px-2"} border-b border-sidebar-border transition-all duration-300`}>
          {sidebarOpen ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
                <div className="relative overflow-hidden rounded-xl border border-[#C9A24A]/35 bg-black/70 p-0.5 shadow-sm shrink-0 group-hover:border-[#E8C466]/70 transition-all duration-300">
                  <img
                    src="/logo.png"
                    alt="Tu Turno Barber"
                    className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-sidebar-foreground text-sm tracking-wide block">
                    Tu Turno
                  </span>
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">
                    {isRecepcionista ? "Recepción" : "Admin"}
                  </span>
                </div>
              </Link>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground transition-colors cursor-pointer shrink-0"
                title="Ocultar módulos"
                aria-label="Ocultar módulos"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 hover:bg-sidebar-accent rounded-xl text-sidebar-foreground hover:text-primary transition-all cursor-pointer flex items-center justify-center"
              title="Mostrar módulos"
              aria-label="Mostrar módulos"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {visibleMenuItems.map((item) => {
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

        {/* Settings: Visible según permisos del rol */}
        {canAccess("/dashboard/settings") && (
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
        )}
      </div>
    </aside>
  );
};

export default Sidebar;