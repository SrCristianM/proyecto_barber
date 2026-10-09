import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Menu, X } from "lucide-react";
import { menuSections } from "./menuItems";
import { usePermissions } from "../../auth/hooks/usePermissions";

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const location = useLocation();
  const { isRecepcionista, canAccess } = usePermissions();

  const isSettingsActive = location.pathname === "/dashboard/settings";

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

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
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 group overflow-hidden"
              >
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
                title={isMobile ? "Cerrar menú" : "Ocultar módulos"}
                aria-label={isMobile ? "Cerrar menú" : "Ocultar módulos"}
              >
                {isMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

        {/* Navigation con Secciones y Separadores Estilizados */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="space-y-3 px-2">
            {menuSections.map((section, sIdx) => {
              // Filtrado de permisos RBAC por cada sección
              const visibleItems = section.items.filter((item) => canAccess(item.path));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.id || sIdx} className="space-y-1">
                  {/* Encabezado de Sección o Línea Divisoria Estilizada y Animada */}
                  {section.title && (
                    <AnimatePresence mode="wait">
                      {sidebarOpen ? (
                        <motion.div
                          key={`sep-open-${section.id || sIdx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="pt-3 pb-1.5 px-3 group/separator cursor-default select-none"
                        >
                          <div className="flex items-center gap-2">
                            {/* Nodo indicador con glow dorado */}
                            <div className="relative flex items-center justify-center shrink-0">
                              <motion.span
                                whileHover={{ scale: 1.4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="h-1.5 w-1.5 rounded-full bg-gradient-to-tr from-[#C9A24A] via-[#E8C466] to-[#F5D77F] shadow-[0_0_8px_rgba(212,175,55,0.7)] group-hover/separator:shadow-[0_0_12px_rgba(212,175,55,1)] transition-all duration-300"
                              />
                            </div>

                            {/* Título de la sección en tipografía refinada */}
                            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60 group-hover/separator:text-sidebar-foreground transition-colors duration-300 whitespace-nowrap">
                              {section.title}
                            </span>

                            {/* Línea animada con degradado dorado elegante */}
                            <motion.div
                              initial={{ scaleX: 0, originX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                              className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/35 via-sidebar-border/60 to-transparent group-hover/separator:from-[#D4AF37]/75 group-hover/separator:via-sidebar-border transition-all duration-300"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`sep-collapsed-${section.id || sIdx}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="my-3 px-3 relative flex items-center justify-center group/collapsed-sep"
                          title={section.title}
                        >
                          <div className="w-full flex items-center justify-center relative">
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sidebar-border to-transparent group-hover/collapsed-sep:via-[#D4AF37]/60 transition-colors duration-300" />
                            <motion.div
                              whileHover={{ scale: 1.5, rotate: 90 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className="absolute h-1.5 w-1.5 rounded-[1px] rotate-45 bg-[#D4AF37]/75 shadow-[0_0_6px_rgba(212,175,55,0.6)] group-hover/collapsed-sep:bg-[#D4AF37] group-hover/collapsed-sep:shadow-[0_0_10px_rgba(212,175,55,1)] transition-all cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  <ul className="space-y-1">
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <li key={item.path} className="relative">
                          <Link
                            to={item.path}
                            onClick={handleLinkClick}
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
                </div>
              );
            })}
          </div>
        </nav>

        {/* Settings: Visible según permisos del rol */}
        {canAccess("/dashboard/settings") && (
          <div className="p-3 pt-2">
            <div className="mb-2 px-1 relative flex items-center justify-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
            </div>
            <div className="relative">
              <Link
                to="/dashboard/settings"
                onClick={handleLinkClick}
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