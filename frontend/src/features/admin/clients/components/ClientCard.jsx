import { User, Eye, Power, Edit, Trash2, Mail, Phone, MapPin, Crown, Sparkles, Award } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

const LOYALTY_CONFIG = {
  Oro: {
    badge: "bg-primary/10 text-primary border-primary/40 shadow-xs",
    icon: Crown,
    progressWidth: "w-full",
    progressClass: "loyalty-progress-gold",
    points: "100%"
  },
  Plata: {
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    icon: Award,
    progressWidth: "w-2/3",
    progressClass: "loyalty-progress-silver",
    points: "65%"
  },
  Bronce: {
    badge: "bg-amber-700/10 text-amber-600 border-amber-700/30",
    icon: Award,
    progressWidth: "w-1/3",
    progressClass: "loyalty-progress-bronze",
    points: "30%"
  },
  Nuevo: {
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: Sparkles,
    progressWidth: "w-1/6",
    progressClass: "loyalty-progress-new",
    points: "10%"
  }
};

export default function ClientCard({ client, onDetail, onToggleStatus, onEdit, onDelete }) {
  const loyalty = LOYALTY_CONFIG[client.nivel_fidelidad] || LOYALTY_CONFIG.Nuevo;
  const LoyaltyIcon = loyalty.icon;
  const isActive = client.estado === 1;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-cli-${client.id_cliente}`}
        data-highlight-id={`cli-${client.id_cliente}`}
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
                  {client.nombre} {client.apellido}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 text-[11px] font-bold rounded-full border ${loyalty.badge}`}
                >
                  <LoyaltyIcon className="h-3 w-3" />
                  Nivel {client.nivel_fidelidad || "Nuevo"}
                </span>
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

          {/* Barra de Fidelidad */}
          <div className="bg-secondary/40 rounded-xl p-2.5 my-3 border border-border/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium">Progreso Fidelidad:</span>
              <span className="font-bold text-foreground font-mono">{loyalty.points}</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/40">
              <div className={`h-full rounded-full ${loyalty.progressWidth} ${loyalty.progressClass}`} />
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="space-y-2 py-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Correo
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{client.correo}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Teléfono
              </span>
              <span className="font-medium text-foreground">{client.telefono || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Dirección
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{client.direccion || "—"}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(client)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(client)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(client)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:text-foreground"
            }`}
            title={isActive ? "Desactivar" : "Activar"}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(client)}
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
