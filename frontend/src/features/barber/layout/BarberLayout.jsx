import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Scissors,
  Calendar,
  Clock,
  AlertCircle,
  Package,
  BarChart3,
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
  Music2,
  Sparkles
} from "lucide-react";
import SpotifyIcon from "../../../shared/ui/SpotifyIcon";
import ClientRouteProgressBar from "../../client/components/ClientRouteProgressBar";
import ClientSnipEffect from "../../client/components/ClientSnipEffect";
import SalonLiveRadar from "../../client/components/SalonLiveRadar";
import BarberMobileDock from "../components/BarberMobileDock";
import { SalonAudioProvider, useSalonAudio } from "../../client/context/SalonAudioContext";
import { logoutUser } from "../../auth/services/authService";
import {
  getCurrentBarberProfile,
  getBarberAppointments,
  getBarberNovelties
} from "../services/barberStorageService";

export default function BarberLayout({ isDark, setIsDark, onLogout }) {
  return (
    <SalonAudioProvider>
      <BarberLayoutContent isDark={isDark} setIsDark={setIsDark} onLogout={onLogout} />
    </SalonAudioProvider>
  );
}

function BarberLayoutContent({ isDark, setIsDark, onLogout }) {
  const {
    isAudioActive,
    soundSource,
    activePlaylistTitle,
    togglePlayback,
    pauseAudio
  } = useSalonAudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [barberProfile, setBarberProfile] = useState(null);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [pendingNoveltiesCount, setPendingNoveltiesCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const profile = getCurrentBarberProfile();
    setBarberProfile(profile);

    const appointments = getBarberAppointments();
    const todayApts = appointments.filter(
      (a) => a.fecha === todayStr && (a.estado === "Programada" || a.estado === "Reprogramada")
    );
    setTodayAppointmentsCount(todayApts.length);

    const novelties = getBarberNovelties();
    const pendingNovs = novelties.filter((n) => n.estado === "Pendiente");
    setPendingNoveltiesCount(pendingNovs.length);
  }, [location.pathname, todayStr]);

  // Cerrar menú móvil y notificaciones al cambiar de ruta
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
    { to: "/barbero", label: "Inicio", icon: Home, end: true },
    { to: "/barbero/agenda", label: "Mi Agenda", icon: Calendar },
    { to: "/barbero/horarios", label: "Mis Horarios", icon: Clock },
    {
      to: "/barbero/novedades",
      label: "Novedades",
      icon: AlertCircle,
      badge: pendingNoveltiesCount > 0 ? pendingNoveltiesCount : null,
      badgeColor: "bg-amber-500 text-black"
    },
    { to: "/barbero/paquetes", label: "Paquetes", icon: Package },
    {
      to: "/barbero/citas",
      label: "Mis Citas",
      icon: Scissors,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : null,
      badgeColor: "bg-destructive text-white"
    },
    { to: "/barbero/reportes", label: "Reportes", icon: BarChart3 }
  ];

  const displayName = barberProfile ? `${barberProfile.nombre} ${barberProfile.apellido || ""}`.trim() : "Barbero";
  const userInitials = barberProfile
    ? `${(barberProfile.nombre || "B").charAt(0)}${(barberProfile.apellido || "").charAt(0)}`.toUpperCase()
    : "BR";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* BARRA DE PROGRESO DE RUTA DORADA */}
      <ClientRouteProgressBar />

      {/* EFECTO SNIP CLICK RIPPLE GLOBAL */}
      <ClientSnipEffect />

      {/* HEADER PRINCIPAL BARBERO (IDENTIDAD VISUAL DEL CLIENTE COMPARTIDA) */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md transition-all shadow-xs">
        {/* FILA 1: MARCA, BADGE DE ROL, RADAR Y ACCIONES */}
        <div className="border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-18">
              {/* Logo y Marca con distintivo de Barbero */}
              <NavLink to="/barbero" className="flex items-center gap-3 group">
                <div className="relative overflow-hidden rounded-xl border border-[#C9A24A]/35 bg-black/70 p-0.5 shadow-md shadow-[#DDAE41]/15 transition-transform group-hover:scale-105 shrink-0">
                  <img
                    src="/logo.png"
                    alt="Tu Turno Barber"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-wider text-foreground">
                      TU TURNO <span className="text-[#DFB755] dark:text-[#E8C466]">BARBER</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
                      <Sparkles className="w-2.5 h-2.5" /> Barbero
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
                    Portal Profesional
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-emerald-500 font-bold">En Línea</span>
                  </span>
                </div>
              </NavLink>

              {/* RADAR DE SALÓN COMPACTO EN HEADER */}
              <div className="hidden md:flex items-center">
                <SalonLiveRadar compact={true} />
              </div>

              {/* Controles de la derecha (Música, Tema, Notificaciones, Perfil, Logout) */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Botón CTA Rápido: Ver Agenda de Hoy */}
                <NavLink
                  to="/barbero/agenda"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-sm shadow-[#DDAE41]/25 transition-all cursor-pointer mr-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver Mi Agenda</span>
                </NavLink>

                {/* Mini reproductor de música del salón en vivo & Spotify */}
                <button
                  type="button"
                  onClick={togglePlayback}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAudioActive
                      ? soundSource === "spotify"
                        ? "bg-[#1DB954]/20 border-[#1DB954]/50 text-[#1DB954] shadow-xs"
                        : "bg-[#DFB755]/20 border-[#DFB755]/50 text-[#DFB755] shadow-xs"
                      : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                  title={
                    isAudioActive
                      ? soundSource === "spotify"
                        ? `Spotify en vivo: ${activePlaylistTitle} • Clic para pausar`
                        : "Música del salón sonando en vivo • Clic para pausar"
                      : "Escuchar música del salón"
                  }
                >
                  {soundSource === "spotify" ? (
                    <SpotifyIcon
                      className={`w-4 h-4 ${isAudioActive ? "animate-pulse text-[#1DB954]" : ""}`}
                    />
                  ) : (
                    <Music2
                      className={`w-4 h-4 ${isAudioActive ? "animate-pulse text-[#DFB755]" : ""}`}
                    />
                  )}
                  {isAudioActive && (
                    <span className="flex items-end gap-0.5 h-3 px-0.5">
                      <span className={`w-0.5 h-2 rounded-full animate-pulse ${soundSource === "spotify" ? "bg-[#1DB954]" : "bg-[#DFB755]"}`} />
                      <span className={`w-0.5 h-3 rounded-full animate-bounce ${soundSource === "spotify" ? "bg-[#1DB954]" : "bg-[#DFB755]"}`} />
                      <span className={`w-0.5 h-1.5 rounded-full animate-pulse ${soundSource === "spotify" ? "bg-[#1DB954]" : "bg-[#DFB755]"}`} />
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

                {/* Notificaciones del Barbero */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Notificaciones de agenda y novedades"
                  >
                    <Bell className="w-4 h-4" />
                    {(todayAppointmentsCount > 0 || pendingNoveltiesCount > 0) && (
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
                        className="absolute right-0 mt-2 w-84 rounded-2xl bg-card border border-border shadow-xl p-4 z-50"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Notificaciones Barbero
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {todayAppointmentsCount + pendingNoveltiesCount} novedad(es)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {todayAppointmentsCount > 0 && (
                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#DFB755]" />
                                Tienes {todayAppointmentsCount} cita(s) hoy
                              </p>
                              <p className="text-muted-foreground text-[11px] mt-1">
                                Consulta tu agenda del día para conocer horarios y especificaciones de clientes.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate("/barbero/agenda");
                                }}
                                className="mt-2 text-[11px] font-bold text-[#DFB755] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Ver agenda de hoy <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {pendingNoveltiesCount > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                {pendingNoveltiesCount} solicitud(es) de novedad en revisión
                              </p>
                              <p className="text-muted-foreground text-[11px] mt-1">
                                La administración está revisando tus solicitudes de cancelación o turno.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNotifications(false);
                                  navigate("/barbero/novedades");
                                }}
                                className="mt-2 text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Ver mis novedades <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {todayAppointmentsCount === 0 && pendingNoveltiesCount === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No tienes alertas pendientes por el momento.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Avatar y Perfil del Barbero */}
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                  <div
                    onClick={() => navigate("/barbero/perfil")}
                    className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-accent/60 transition-colors"
                    title="Ver Perfil de Barbero"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#DFB755]/20 border border-[#DFB755]/40 flex items-center justify-center text-xs font-bold text-[#DFB755] dark:text-[#E8C466]">
                      {userInitials}
                    </div>
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                        Barbero <span className="text-[#DFB755] font-bold">•</span> Carlos
                      </span>
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

                {/* Botón Menú Móvil */}
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

        {/* FILA 2: BARRA DEDICADA DE MÓDULOS DEL BARBERO */}
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
                            layoutId="barberActiveNavTab"
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
                                isActive ? "bg-black text-[#E8C466]" : item.badgeColor || "bg-destructive text-white"
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
                    <p className="text-xs text-[#DFB755] font-semibold">Rol: Barbero Profesional</p>
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
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-destructive text-white">
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

      {/* CONTENIDO PRINCIPAL CON TRANSICIONES SUAVES */}
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

      {/* FOOTER DEL BARBERO */}
      <footer className="border-t border-border/80 bg-card/40 py-8 mt-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="relative overflow-hidden rounded-lg border border-[#C9A24A]/35 bg-black/70 p-0.5 shrink-0">
              <img
                src="/logo.png"
                alt="Tu Turno Barber"
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-foreground">Tu Turno Barber</span>
            <span>— Portal Exclusivo para Barberos</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <NavLink to="/barbero" className="hover:text-[#DFB755] transition-colors">Inicio</NavLink>
            <NavLink to="/barbero/agenda" className="hover:text-[#DFB755] transition-colors">Mi Agenda</NavLink>
            <NavLink to="/barbero/horarios" className="hover:text-[#DFB755] transition-colors">Mis Horarios</NavLink>
            <NavLink to="/barbero/novedades" className="hover:text-[#DFB755] transition-colors">Novedades</NavLink>
            <NavLink to="/barbero/citas" className="hover:text-[#DFB755] transition-colors font-semibold">Mis Citas</NavLink>
            <NavLink to="/barbero/reportes" className="hover:text-[#DFB755] transition-colors">Reportes</NavLink>
          </div>

          <div>
            <span>© {new Date().getFullYear()} Tu Turno Barber. Módulo de Operación Profesional.</span>
          </div>
        </div>
      </footer>

      {/* BARRA DE NAVEGACIÓN INFERIOR FLOTANTE GLASSMORPHISM PARA CELULARES */}
      <BarberMobileDock
        pendingNoveltiesCount={pendingNoveltiesCount}
        todayAppointmentsCount={todayAppointmentsCount}
      />
    </div>
  );
}
