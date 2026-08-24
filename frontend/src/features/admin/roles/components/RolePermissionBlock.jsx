import { Shield } from "lucide-react";
import { formatPermissionItems, PERMISSION_ACTIONS } from "../constants/permissions";

export default function RolePermissionBlock({
  roleName,
  permisos = [],
  alcancePorPermiso = {},
  editable = false,
  onTogglePermission,
  fixedHeight = false
}) {
  const items = formatPermissionItems(permisos, alcancePorPermiso);
  const summary = items.length > 0 ? items.join(", ") : "sin permisos asignados";

  return (
    <div
      className={`w-full bg-background border border-border rounded-lg flex flex-col overflow-hidden ${
        fixedHeight
          ? "h-[var(--role-card-height)] min-h-[var(--role-card-height)] max-h-[var(--role-card-height)]"
          : ""
      }`}
    >
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
        <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-primary" />
        </span>
        <h3 className="text-base font-semibold text-foreground truncate">{roleName}</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold">{roleName}:</span> {summary}
        </p>

        <div className="flex flex-wrap gap-2 min-h-[1.75rem]">
          {items.length > 0 ? (
            items.map((item) => (
              <span
                key={item}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              Sin permisos
            </span>
          )}
        </div>

        {editable && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            {PERMISSION_ACTIONS.map((action) => {
              const checked = permisos.includes(action.key);
              return (
                <label
                  key={action.key}
                  className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTogglePermission?.(action.key)}
                    className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
                  />
                  {action.label}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
