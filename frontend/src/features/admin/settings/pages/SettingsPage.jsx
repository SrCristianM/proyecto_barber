import { useState, useEffect } from "react";
import {
  Store,
  Bell,
  Monitor,
  Moon,
  Sun,
  Globe,
  Clock,
  Phone,
  Mail,
  MapPin,
  Save,
  ChevronRight,
  Info
} from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
  { key: "business", label: "Información del Negocio", icon: Store },
  { key: "notifications", label: "Notificaciones", icon: Bell },
  { key: "system", label: "Sistema", icon: Monitor }
];

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const STORAGE_KEY = "barber_settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const DEFAULT_BUSINESS = {
  nombre: "BarberShop Pro",
  telefono: "+57 300 123 4567",
  correo: "contacto@barbershoppro.com",
  direccion: "Calle 50 #12-34, Bogotá",
  horario_apertura: "08:00",
  horario_cierre: "20:00",
  zona_horaria: "America/Bogota"
};

const DEFAULT_NOTIFICATIONS = {
  cita_nueva: true,
  cita_cancelada: true,
  recordatorio_email: false,
  recordatorio_sms: false,
  stock_bajo: true,
  reporte_diario: false
};

const DEFAULT_SYSTEM = {
  idioma: "es",
  modo_oscuro: false,
  compacto: false,
  animaciones: true,
  sesion_timeout: "60"
};

export default function SettingsPage({ isDark, setIsDark }) {
  const [activeSection, setActiveSection] = useState("business");
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const saved = loadSettings();

  const [business, setBusiness] = useState(saved?.business ?? DEFAULT_BUSINESS);
  const [notifications, setNotifications] = useState(saved?.notifications ?? DEFAULT_NOTIFICATIONS);
  const [system, setSystem] = useState(saved?.system ?? DEFAULT_SYSTEM);

  // Detectar cambios sin guardar
  const markDirty = () => setHasUnsaved(true);

  const updateBusiness = (v) => { setBusiness(v); markDirty(); };
  const updateNotifications = (v) => { setNotifications(v); markDirty(); };
  const updateSystem = (v) => {
    setSystem(v);
    markDirty();
    // Sincronizar dark mode con el sistema real
    if (v.modo_oscuro !== system.modo_oscuro) {
      setIsDark?.(v.modo_oscuro);
    }
  };

  // Mantener sincronizado el estado con isDark
  useEffect(() => {
    if (typeof isDark === "boolean") {
      setSystem((prev) => (prev.modo_oscuro !== isDark ? { ...prev, modo_oscuro: isDark } : prev));
    }
  }, [isDark]);

  const handleSave = () => {
    const payload = { business, notifications, system };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setHasUnsaved(false);
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Personaliza el sistema según tus necesidades</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsaved && (
            <span className="text-xs text-warning font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
              Cambios sin guardar
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Sidebar de navegación */}
        <div className="w-56 shrink-0">
          <nav className="bg-card border border-border rounded-xl overflow-hidden">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors group border-b border-border last:border-0 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="text-sm font-medium flex-1">{section.label}</span>
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${isActive ? "text-primary rotate-90" : "text-muted-foreground/50"}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6">

          {/* Información del Negocio */}
          {activeSection === "business" && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Información del Negocio</h2>
              <p className="text-xs text-muted-foreground mb-5">Datos de contacto y horario de atención</p>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Store className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                    Nombre del Negocio
                  </label>
                  <input
                    type="text"
                    value={business.nombre}
                    onChange={(e) => updateBusiness({ ...business, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Phone className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={business.telefono}
                      onChange={(e) => updateBusiness({ ...business, telefono: e.target.value })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Mail className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={business.correo}
                      onChange={(e) => updateBusiness({ ...business, correo: e.target.value })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={business.direccion}
                    onChange={(e) => updateBusiness({ ...business, direccion: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Clock className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                      Apertura
                    </label>
                    <input
                      type="time"
                      value={business.horario_apertura}
                      onChange={(e) => updateBusiness({ ...business, horario_apertura: e.target.value })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Clock className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                      Cierre
                    </label>
                    <input
                      type="time"
                      value={business.horario_cierre}
                      onChange={(e) => updateBusiness({ ...business, horario_cierre: e.target.value })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <Globe className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                      Zona Horaria
                    </label>
                    <select
                      value={business.zona_horaria}
                      onChange={(e) => updateBusiness({ ...business, zona_horaria: e.target.value })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    >
                      <option value="America/Bogota">Bogotá (UTC-5)</option>
                      <option value="America/New_York">New York (UTC-5)</option>
                      <option value="America/Mexico_City">México (UTC-6)</option>
                      <option value="America/Lima">Lima (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notificaciones */}
          {activeSection === "notifications" && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Notificaciones</h2>
              <p className="text-xs text-muted-foreground mb-5">Configura cuándo y cómo recibir alertas</p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Citas</p>
                <SettingRow label="Nueva cita agendada" description="Notificar cuando un cliente agende una nueva cita">
                  <Toggle checked={notifications.cita_nueva} onChange={(v) => updateNotifications({ ...notifications, cita_nueva: v })} />
                </SettingRow>
                <SettingRow label="Cita cancelada" description="Notificar cuando una cita sea cancelada o reprogramada">
                  <Toggle checked={notifications.cita_cancelada} onChange={(v) => updateNotifications({ ...notifications, cita_cancelada: v })} />
                </SettingRow>
                <SettingRow
                  label="Recordatorio por email"
                  description={
                    <span className="flex items-center gap-1">
                      Enviar recordatorios automáticos 24h antes
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                        <Info className="h-3 w-3" /> Requiere backend
                      </span>
                    </span>
                  }
                >
                  <Toggle checked={notifications.recordatorio_email} onChange={(v) => updateNotifications({ ...notifications, recordatorio_email: v })} />
                </SettingRow>
                <SettingRow
                  label="Recordatorio por SMS"
                  description={
                    <span className="flex items-center gap-1">
                      Enviar SMS de recordatorio al cliente
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                        <Info className="h-3 w-3" /> Requiere backend
                      </span>
                    </span>
                  }
                >
                  <Toggle checked={notifications.recordatorio_sms} onChange={(v) => updateNotifications({ ...notifications, recordatorio_sms: v })} />
                </SettingRow>

                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-5 mb-2">Inventario y Reportes</p>
                <SettingRow label="Alerta de stock bajo" description="Notificar cuando un producto tenga menos de 5 unidades">
                  <Toggle checked={notifications.stock_bajo} onChange={(v) => updateNotifications({ ...notifications, stock_bajo: v })} />
                </SettingRow>
                <SettingRow label="Reporte diario" description="Recibir un resumen de ventas al final del día">
                  <Toggle checked={notifications.reporte_diario} onChange={(v) => updateNotifications({ ...notifications, reporte_diario: v })} />
                </SettingRow>
              </div>
            </div>
          )}

          {/* Sistema */}
          {activeSection === "system" && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">Sistema</h2>
              <p className="text-xs text-muted-foreground mb-5">Preferencias de interfaz y sesión</p>

              <SettingRow label="Modo Oscuro" description="Activar el tema oscuro en toda la interfaz">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Toggle
                    checked={system.modo_oscuro}
                    onChange={(v) => updateSystem({ ...system, modo_oscuro: v })}
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </SettingRow>

              <SettingRow label="Vista Compacta" description="Reducir el espaciado para ver más información en pantalla">
                <Toggle checked={system.compacto} onChange={(v) => updateSystem({ ...system, compacto: v })} />
              </SettingRow>

              <SettingRow label="Animaciones" description="Habilitar transiciones y animaciones de la interfaz">
                <Toggle checked={system.animaciones} onChange={(v) => updateSystem({ ...system, animaciones: v })} />
              </SettingRow>

              <SettingRow label="Idioma del sistema">
                <select
                  value={system.idioma}
                  onChange={(e) => updateSystem({ ...system, idioma: e.target.value })}
                  className="px-3 py-1.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </SettingRow>

              <SettingRow label="Tiempo de sesión" description="Cerrar sesión automáticamente tras inactividad">
                <select
                  value={system.sesion_timeout}
                  onChange={(e) => updateSystem({ ...system, sesion_timeout: e.target.value })}
                  className="px-3 py-1.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="0">Sin límite</option>
                </select>
              </SettingRow>

              {/* Info de versión */}
              <div className="mt-6 p-4 bg-muted/40 rounded-xl border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Información del Sistema</p>
                <div className="space-y-1.5">
                  {[
                    ["Versión", "1.0.0"],
                    ["Build", "2026.08.24"],
                    ["Base de datos", "barberia_db v1.0"],
                    ["Entorno", "Desarrollo"]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
