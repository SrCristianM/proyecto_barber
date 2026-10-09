import { Shield, Eye, Edit, Power, Trash2, Calendar, Key } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";
import { SYSTEM_MODULES } from "../constants/permissions";

export default function RoleCard({
  role,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete,
  canEdit = true,
  canToggle = true,
  canDelete = true
}) {
  const isProtected = role.id_rol === 1;
  const count = (role.permisos || []).length;
  const totalPossible = SYSTEM_MODULES.reduce((acc, m) => acc + m.acciones.length, 0) || 57;
  const pct = Math.min(100, Math.round((count / totalPossible) * 100));
  const isFull = pct >= 90;
  const isMid = pct >= 50;
  const isActive = role.estado === 1;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-rol-${role.id_rol}`}
        data-highlight-id={`rol-${role.id_rol}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  {role.nombre_rol}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                  <Calendar className="h-3 w-3 text-primary" />
                  {role.fecha_creacion?.split(" ")[0] || "—"}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isActive ? "badge-glow-success" : "badge-glow-destructive"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Descripción */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {role.descripcion || "Sin descripción proporcionada."}
          </p>

          {/* Nivel de Permisos */}
          <div className="p-3 bg-secondary/50 rounded-xl border border-border/60 space-y-2 mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-primary" />
                {count} permisos asignados
              </span>
              <span className="text-[11px] text-muted-foreground font-mono font-bold">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden border border-border/50">
              <div
                style={{ width: `${pct}%` }}
                className={`h-full rounded-full transition-all ${
                  isFull
                    ? "loyalty-progress-gold"
                    : isMid
                    ? "loyalty-progress-silver"
                    : "loyalty-progress-bronze"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(role)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(role)}
              className="flex items-center justify-center p-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer shrink-0"
              title="Editar Rol"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {canToggle && !isProtected && (
            <button
              type="button"
              onClick={() => onToggleStatus && onToggleStatus(role)}
              className={`p-2 rounded-xl transition-colors font-semibold cursor-pointer shrink-0 ${
                isActive
                  ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                  : "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
              }`}
              title={isActive ? "Desactivar Rol" : "Activar Rol"}
            >
              <Power className="h-4 w-4" />
            </button>
          )}

          {canDelete && !isProtected && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(role)}
              className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors font-semibold cursor-pointer shrink-0"
              title="Eliminar Rol"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
