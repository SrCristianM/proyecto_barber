import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Scissors,
  Calendar,
  Clock,
  ShoppingBag,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Home,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import { logoutUser, getCurrentUser } from "../../auth/services/authService";
import { getCurrentClientProfile, getClientAppointments } from "../services/clientStorageService";

export default function ClientLayout({ isDark, setIsDark, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clientProfile, setClientProfile] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const profile = getCurrentClientProfile();
    setClientProfile(profile);

    const appointments = getClientAppointments();
    const upcoming = appointments.filter((a) => a.estado === "Programada" || a.estado === "Reprogramada");
    setUpcomingCount(upcoming.length);
  }, [location.pathname]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/portal", label: "Inicio", icon: Home, end: true },
    { to: "/portal/agendar", label: "Agendar Cita", icon: Calendar, highlight: true },
    { to: "/portal/mis-citas", label: "Mis Citas", icon: Clock, badge: upcomingCount > 0 ? upcomingCount : null },
    { to: "/portal/servicios", label: "Servicios", icon: Scissors },
    { to: "/portal/paquetes", label: "Paquetes", icon: ClientStarIcon },
    { to: "/portal/productos", label: "Productos", icon: ShoppingBag },
    { to: "/portal/mis-compras", label: "Mis Compras", icon: Receipt },
    { to: "/portal/perfil", label: "Mi Perfil", icon: User }
  ];

  const user = getCurrentUser();
  const displayName = clientProfile?.nombre || user?.nombre || "Cliente";
  const userInitials = `${displayName.charAt(0)}${(clientProfile?.apellido || user?.apellido || "").charAt(0)}`.toUpperCase() || "CL";
  const loyaltyTier = clientProfile?.nivel_fidelidad || "Nuevo";

  const getTierColor = (tier) => {
    switch (tier) {
      case "Oro":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "Plata":
        return "bg-slate-300/15 text-slate-300 border-slate-400/30";
      case "Bronce":
        return "bg-amber-700/15 text-amber-600 border-amber-700/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* HEADER PRINCIPAL CLIENTE */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo y Marca */}
            <NavLink to="/portal" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#997728] flex items-center justify-center text-black shadow-md shadow-[#C9A24A]/20 transition-transform group-hover:scale-105">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-wider text-foreground">
                  TU TURNO <span className="text-[#C9A24A]">BARBER</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-1">
                  Portal Cliente
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] border font-bold ${getTierColor(loyaltyTier)}`}>
                    {loyaltyTier}
                  </span>
                </span>
              </div>
            </NavLink>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                        item.highlight
                          ? isActive
                            ? "bg-[#C9A24A] text-black shadow-md shadow-[#C9A24A]/30 font-bold"
                            : "bg-[#C9A24A]/15 text-[#C9A24A] border border-[#C9A24A]/40 hover:bg-[#C9A24A]/25"
                          : isActive
                          ? "bg-accent text-accent-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Controles de la derecha (Tema, Notificaciones, Perfil, Logout) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Selector de Tema */}
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Notificaciones"
                >
                  <Bell className="w-4 h-4" />
                  {upcomingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A24A] ring-2 ring-background" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-card border border-border shadow-xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Notificaciones</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{upcomingCount} activa(s)</span>
                      </div>
                      {upcomingCount > 0 ? (
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              Tienes {upcomingCount} cita(s) programada(s)
                            </p>
                            <p className="text-muted-foreground text-[11px] mt-1">
                              Revisa los detalles en tu sección de Mis Citas para estar al tanto de tu turno.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false);
                                navigate("/portal/mis-citas");
                              }}
                              className="mt-2 text-[11px] font-bold text-[#C9A24A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Ver mis citas <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No tienes notificaciones pendientes por el momento.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Usuario Avatar y Dropdown Rápido */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                <div
                  onClick={() => navigate("/portal/perfil")}
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-accent/60 transition-colors"
                  title="Ver Mi Perfil"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#C9A24A]/20 border border-[#C9A24A]/40 flex items-center justify-center text-xs font-bold text-[#C9A24A]">
                    {userInitials}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">Cliente {loyaltyTier}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Botón menú móvil */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border bg-background px-4 pt-3 pb-6 space-y-3 overflow-hidden shadow-2xl"
            >
              <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A24A]/20 border border-[#C9A24A]/40 flex items-center justify-center text-sm font-bold text-[#C9A24A]">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Nivel: {loyaltyTier}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          item.highlight
                            ? isActive
                              ? "bg-[#C9A24A] text-black font-bold"
                              : "bg-[#C9A24A]/10 text-[#C9A24A] border border-[#C9A24A]/30"
                            : isActive
                            ? "bg-accent text-accent-foreground font-bold"
                            : "text-muted-foreground hover:bg-muted/40"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-destructive text-destructive-foreground">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* FOOTER CLIENTE */}
      <footer className="border-t border-border/80 bg-card/40 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#C9A24A]" />
            <span className="font-bold text-foreground">Tu Turno Barber</span>
            <span>— Portal Exclusivo para Clientes</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <NavLink to="/portal/servicios" className="hover:text-[#C9A24A] transition-colors">Servicios</NavLink>
            <NavLink to="/portal/paquetes" className="hover:text-[#C9A24A] transition-colors">Paquetes</NavLink>
            <NavLink to="/portal/productos" className="hover:text-[#C9A24A] transition-colors">Productos</NavLink>
            <NavLink to="/portal/agendar" className="hover:text-[#C9A24A] transition-colors font-semibold">Agendar Cita</NavLink>
            <NavLink to="/portal/perfil" className="hover:text-[#C9A24A] transition-colors">Mi Perfil</NavLink>
          </div>

          <div>
            <span>© {new Date().getFullYear()} Tu Turno Barber. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
