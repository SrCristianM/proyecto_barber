import { Shield, CheckCircle2 } from "lucide-react";
import { getHumanPermissionLabel, PERMISSION_ACTIONS } from "../constants/permissions";

export default function RolePermissionBlock({
  roleName,
  permisos = [],
  alcancePorPermiso = {},
  editable = false,
  onTogglePermission,
  fixedHeight = false
}) {
  return (
    <div
      className={`w-full bg-card border border-border/80 rounded-2xl flex flex-col overflow-hidden shadow-2xs ${
        fixedHeight
          ? "h-[var(--role-card-height)] min-h-[var(--role-card-height)] max-h-[var(--role-card-height)]"
          : ""
      }`}
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
            <Shield className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-bold text-foreground truncate">{roleName}</h3>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          {permisos.length} {permisos.length === 1 ? "permiso" : "permisos"}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {permisos.length > 0 ? (
            permisos.map((key) => {
              const label = getHumanPermissionLabel(key);
              const alcance = alcancePorPermiso[key];
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xl bg-muted/60 border border-border text-foreground font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{label}</span>
                  {alcance && (
                    <span className="text-[10px] text-amber-500 font-bold ml-1">
                      ({alcance})
                    </span>
                  )}
                </span>
              );
            })
          ) : (
            <span className="px-3 py-1.5 text-xs rounded-xl bg-muted text-muted-foreground font-medium">
              Sin permisos asignados
            </span>
          )}
        </div>

        {editable && (
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border">
            {PERMISSION_ACTIONS.map((action) => {
              const checked = permisos.includes(action.key);
              return (
                <label
                  key={action.key}
                  className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTogglePermission?.(action.key)}
                    className="w-4 h-4 text-primary border-input rounded focus:ring-primary accent-[#C9A24A]"
                  />
                  <span>{action.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
