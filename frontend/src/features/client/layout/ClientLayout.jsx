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
  ChevronRight,
  Music2
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import BarberPole from "../components/BarberPole";
import ClientRouteProgressBar from "../components/ClientRouteProgressBar";
import ClientSnipEffect from "../components/ClientSnipEffect";
import SalonLiveRadar from "../components/SalonLiveRadar";
import ClientMobileDock from "../components/ClientMobileDock";
import { SalonAudioProvider, useSalonAudio } from "../context/SalonAudioContext";
import { logoutUser, getCurrentUser } from "../../auth/services/authService";
import { getCurrentClientProfile, getClientAppointments } from "../services/clientStorageService";

export default function ClientLayout({ isDark, setIsDark, onLogout }) {
  return (
    <SalonAudioProvider>
      <ClientLayoutContent isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />
    </SalonAudioProvider>
  );
}

function ClientLayoutContent({ isDark, setIsDark, onLogout }) {
  const { isPlaying, togglePlayback, pauseAudio } = useSalonAudio();
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
    pauseAudio();
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
      {/* BARRA DE PROGRESO DE RUTA DORADA */}
      <ClientRouteProgressBar />

      {/* EFECTO SNIP CLICK RIPPLE GLOBAL */}
      <ClientSnipEffect />

      {/* HEADER PRINCIPAL CLIENTE (ESTRUCTURA DE DOS NIVELES ESPACIOSA) */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md transition-all shadow-xs">
        {/* FILA 1: MARCA, IDENTIDAD Y ACCIONES DE USUARIO */}
        <div className="border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-18">
              {/* Logo y Marca */}
              <NavLink to="/portal" className="flex items-center gap-3 group">
                <BarberPole className="w-5 h-10 hidden sm:inline-flex" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8C466] to-[#DDAE41] flex items-center justify-center text-black shadow-md shadow-[#DDAE41]/25 transition-transform group-hover:scale-105 shrink-0">
                  <BarberScissorsIcon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-black tracking-wider text-foreground">
                    TU TURNO <span className="text-[#DFB755] dark:text-[#E8C466]">BARBER</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
                    Portal Cliente
                    <span className={`px-2 py-0.2 rounded-full text-[9px] border font-bold ${getTierColor(loyaltyTier)}`}>
                      {loyaltyTier}
                    </span>
                  </span>
                </div>
              </NavLink>

              {/* RADAR DE SALÓN COMPACTO EN HEADER */}
              <div className="hidden md:flex items-center">
                <SalonLiveRadar compact={true} />
              </div>

              {/* Controles de la derecha (CTA Rápido, Tema, Notificaciones, Perfil, Logout) */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Botón CTA Rápido Destacado */}
                <NavLink
                  to="/portal/agendar"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-sm shadow-[#DDAE41]/25 transition-all cursor-pointer mr-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar Cita</span>
                </NavLink>

                {/* Mini reproductor de música del salón en vivo */}
                <button
                  type="button"
                  onClick={togglePlayback}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isPlaying
                      ? "bg-[#DFB755]/20 border-[#DFB755]/50 text-[#DFB755] shadow-xs"
                      : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                  title={
                    isPlaying
                      ? "Música del salón sonando en vivo • Clic para pausar"
                      : "Escuchar música en vivo del salón (Lo-Fi & Jazz)"
                  }
                >
                  <Music2 className={`w-4 h-4 ${isPlaying ? "animate-pulse text-[#DFB755]" : ""}`} />
                  {isPlaying && (
                    <span className="hidden sm:flex items-end gap-0.5 h-3 px-0.5">
                      <span className="w-0.5 h-2 rounded-full bg-[#DFB755] animate-pulse" />
                      <span className="w-0.5 h-3 rounded-full bg-[#DFB755] animate-bounce" />
                      <span className="w-0.5 h-1.5 rounded-full bg-[#DFB755] animate-pulse" />
                    </span>
                  )}
                </button>

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
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DFB755] ring-2 ring-background" />
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
                                className="mt-2 text-[11px] font-bold text-[#DFB755] hover:underline flex items-center gap-1 cursor-pointer"
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
                    <div className="w-8 h-8 rounded-xl bg-[#DFB755]/20 border border-[#DFB755]/40 flex items-center justify-center text-xs font-bold text-[#DFB755] dark:text-[#E8C466]">
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
        </div>

        {/* FILA 2: BARRA DEDICADA DE MÓDULOS CON ANIMACIÓN DE DESLIZAMIENTO ACTIVA */}
        <div className="hidden lg:block bg-background/85 backdrop-blur-md border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 xl:gap-2.5 py-2 overflow-x-auto no-scrollbar">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center gap-2 shrink-0 select-none ${
                        isActive
                          ? "text-black font-extrabold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="clientActiveNavTab"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] shadow-md shadow-[#DDAE41]/25 z-0"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span
                              className={`ml-1 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                                isActive
                                  ? "bg-black text-[#E8C466]"
                                  : "bg-destructive text-destructive-foreground"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
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
                  <div className="w-10 h-10 rounded-xl bg-[#DFB755]/20 border border-[#DFB755]/40 flex items-center justify-center text-sm font-bold text-[#DFB755]">
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
                          isActive
                            ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black font-bold shadow-sm"
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

      {/* CONTENIDO PRINCIPAL CON TRANSICIONES SUAVES ENTRE MÓDULOS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
            transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER CLIENTE */}
      <footer className="border-t border-border/80 bg-card/40 py-8 mt-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BarberScissorsIcon className="w-4 h-4 text-[#DFB755]" strokeWidth={2} />
            <span className="font-bold text-foreground">Tu Turno Barber</span>
            <span>— Portal Exclusivo para Clientes</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <NavLink to="/portal/servicios" className="hover:text-[#DFB755] transition-colors">Servicios</NavLink>
            <NavLink to="/portal/paquetes" className="hover:text-[#DFB755] transition-colors">Paquetes</NavLink>
            <NavLink to="/portal/productos" className="hover:text-[#DFB755] transition-colors">Productos</NavLink>
            <NavLink to="/portal/agendar" className="hover:text-[#DFB755] transition-colors font-semibold">Agendar Cita</NavLink>
            <NavLink to="/portal/perfil" className="hover:text-[#DFB755] transition-colors">Mi Perfil</NavLink>
          </div>

          <div>
            <span>© {new Date().getFullYear()} Tu Turno Barber. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* BARRA DE NAVEGACIÓN INFERIOR FLOTANTE GLASSMORPHISM PARA CELULARES */}
      <ClientMobileDock upcomingCount={upcomingCount} />
    </div>
  );
}

