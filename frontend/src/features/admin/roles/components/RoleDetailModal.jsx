import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Shield,
  Users,
  Calendar,
  Scissors,
  Package,
  Receipt,
  Clock,
  UserCheck,
  Truck,
  ShoppingCart,
  Edit3,
  X,
  CheckCircle2,
  Layers,
  Search,
  Lock,
  CalendarCheck,
  AlertCircle
} from "lucide-react";
import Modal from "../../shared/components/Modal";
import { groupPermissionsByModule, SYSTEM_MODULES } from "../constants/permissions";

const MODULE_ICONS = {
  usuarios: Users,
  roles: ShieldCheck,
  citas: Calendar,
  servicios: Scissors,
  productos: Package,
  ventas: Receipt,
  horarios: Clock,
  clientes: UserCheck,
  proveedores: Truck,
  compras: ShoppingCart,
  general: Shield
};

export default function RoleDetailModal({ role, onEdit, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!role) return null;

  const permisos = role.permisos || [];
  const alcancePorPermiso = role.alcancePorPermiso || {};

  // Total de acciones en el sistema
  const totalSystemActions = useMemo(
    () => SYSTEM_MODULES.reduce((acc, m) => acc + m.acciones.length, 0),
    []
  );

  // Agrupación de permisos por módulos
  const groupedModules = useMemo(
    () => groupPermissionsByModule(permisos),
    [permisos]
  );

  // Filtrar módulos y acciones según búsqueda
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return groupedModules;
    const term = searchTerm.toLowerCase().trim();

    return groupedModules
      .map((mod) => {
        const matchingActions = mod.acciones.filter(
          (a) =>
            a.label.toLowerCase().includes(term) ||
            a.key.toLowerCase().includes(term) ||
            mod.label.toLowerCase().includes(term)
        );
        if (matchingActions.length > 0) {
          return { ...mod, acciones: matchingActions };
        }
        return null;
      })
      .filter(Boolean);
  }, [groupedModules, searchTerm]);

  // Nivel de seguridad inferido
  const securityLevel = useMemo(() => {
    if (role.nombre_rol?.toLowerCase().includes("admin") || permisos.length >= 25) {
      return { label: "Control Total / Superadmin", color: "text-[#C9A24A] bg-[#C9A24A]/10 border-[#C9A24A]/30" };
    }
    if (permisos.length >= 10) {
      return { label: "Gestión Operativa Avanzada", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
    }
    return { label: "Acceso Operativo Restringido", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
  }, [role.nombre_rol, permisos.length]);

  return (
    <Modal title="Detalle del Rol de Usuario" onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="space-y-6">
        {/* =========================================================================
            BANNER PRINCIPAL DEL ROL (HERO CARD)
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-[#C9A24A]/10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A24A]/25 via-[#C9A24A]/10 to-transparent border border-[#C9A24A]/40 text-[#C9A24A] flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {role.nombre_rol}
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-bold font-mono rounded-lg bg-muted border border-border text-muted-foreground">
                    #ROL-{String(role.id_rol).padStart(3, "0")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {role.descripcion || "Sin descripción asignada para este rol de usuario."}
                </p>
                {role.fecha_creacion && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1 font-medium">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Creado el: {role.fecha_creacion}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 self-start sm:self-auto shrink-0">
              <span
                className={`px-3.5 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                  role.estado === 1
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${role.estado === 1 ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span>{role.estado === 1 ? "Activo" : "Inactivo"}</span>
              </span>
            </div>
          </div>

          {/* Decoración geométrica sutil */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#C9A24A]/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* =========================================================================
            PANEL DE MÉTRICAS RÁPIDAS DEL ROL (3 COLUMNAS)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Permisos Activos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{permisos.length}</span>
              <span className="text-xs text-muted-foreground">de {totalSystemActions} acciones</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Módulos Asignados</span>
              <Layers className="w-4 h-4 text-[#C9A24A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{groupedModules.length}</span>
              <span className="text-xs text-muted-foreground">de {SYSTEM_MODULES.length} módulos</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Nivel de Acceso</span>
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className={`inline-block px-2.5 py-1 text-xs font-extrabold rounded-lg border ${securityLevel.color}`}>
                {securityLevel.label}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DESGLOSE DE PERMISOS AGRUPADOS POR MÓDULO
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Privilegios y Permisos por Módulo
              </h3>
              <p className="text-xs text-muted-foreground">
                Capacidades operativas autorizadas para los usuarios con este rol.
              </p>
            </div>

            {/* Buscador de permisos en tiempo real */}
            {permisos.length > 4 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filtrar permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-muted/50 border border-border focus:border-[#C9A24A] focus:outline-none text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>
            )}
          </div>

          {/* Grilla de módulos con permisos */}
          {filteredModules.length > 0 ? (
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredModules.map((mod) => {
                const IconComponent = MODULE_ICONS[mod.id] || Shield;
                return (
                  <div
                    key={mod.id}
                    className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs hover:border-border transition-all"
                  >
                    {/* Cabecera del Módulo */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-foreground">
                            {mod.label}
                          </h4>
                          <span className="text-[10px] text-muted-foreground">
                            {mod.assignedCount} {mod.assignedCount === 1 ? "acción autorizada" : "acciones autorizadas"}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {mod.assignedCount} / {mod.totalInModule}
                      </span>
                    </div>

                    {/* Chips de Acciones Autorizadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {mod.acciones.map((acc) => {
                        const alcance = alcancePorPermiso[acc.key];
                        return (
                          <div
                            key={acc.key}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/80 hover:bg-muted/70 hover:border-[#C9A24A]/40 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="font-bold text-foreground truncate">
                                {acc.label}
                              </span>
                            </div>

                            {alcance && (
                              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                {alcance}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-muted/30 border border-dashed border-border text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {searchTerm
                  ? `No se encontraron permisos que coincidan con "${searchTerm}"`
                  : "Este rol no cuenta con permisos configurados actualmente."}
              </p>
              <p className="text-xs text-muted-foreground">
                Puedes hacer clic en "Editar Rol" para asignarle privilegios y accesos a los módulos.
              </p>
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTONES DE ACCIÓN INFERIORES
            ========================================================================= */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border hover:bg-accent text-foreground font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cerrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#C9A24A] hover:bg-[#d8b056] text-black font-black text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Rol</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
