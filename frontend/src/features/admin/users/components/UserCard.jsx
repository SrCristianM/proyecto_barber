import { User, Eye, Power, Edit, Trash2, Mail, Shield, Calendar } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";
import { availableRoles } from "../hooks/useUsers";

export default function UserCard({ user, onDetail, onToggleStatus, onEdit, onDelete }) {
  const isActive = user.estado === 1;
  const role = availableRoles.find((r) => r.id_rol === user.id_rol);
  const roleName = role ? role.nombre_rol : "Usuario";

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-usr-${user.id_usuario}`}
        data-highlight-id={`usr-${user.id_usuario}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  {user.nombre} {user.apellido}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg">
                  <Shield className="h-3 w-3" />
                  {roleName}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${isActive ? "badge-glow-success" : "badge-glow-destructive"
                }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Datos de Contacto y Registro */}
          <div className="space-y-2 py-3 border-y border-border/60 text-xs my-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Correo
              </span>
              <span className="font-medium text-foreground truncate max-w-[160px]">{user.correo}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Registro
              </span>
              <span className="font-medium text-foreground">{user.fecha_registro || "—"}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(user)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(user)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(user)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:text-foreground"
              }`}
            title={isActive ? "Desactivar" : "Activar"}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(user)}
            className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
