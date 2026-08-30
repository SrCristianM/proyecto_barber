import { Edit, Trash2, User, Phone, Mail, Scissors } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function BarberCard({ barber, onEdit, onDelete }) {
  const isActive = barber.estado === 1;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-bar-${barber.id_barbero}`}
        data-highlight-id={`bar-${barber.id_barbero}`}
        className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3.5">
              {barber.imagen_url ? (
                <img
                  src={barber.imagen_url}
                  alt={`${barber.nombre} ${barber.apellido}`}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-primary/30 shadow-xs"
                />
              ) : (
                <div className="w-13 h-13 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shadow-xs">
                  <User className="h-6 w-6" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  {barber.nombre} {barber.apellido}
                </h3>
                <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                  <Scissors className="h-3 w-3" />
                  {barber.especialidad || "Master Barber"}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${isActive ? "badge-glow-success" : "bg-muted text-muted-foreground border-border"
                }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="space-y-2 py-3 my-2 border-y border-border/60 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Correo
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{barber.correo}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Teléfono
              </span>
              <span className="font-medium text-foreground">{barber.telefono || "N/A"}</span>
            </div>
          </div>

          {/* Ocupación de Agenda Hoy */}
          <div className="bg-secondary/40 rounded-xl p-2.5 mb-2 border border-border/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium">Ocupación Hoy:</span>
              <span className="font-bold text-foreground">
                {barber.id_barbero === 1 ? "85% (6/7 turnos)" : barber.id_barbero === 2 ? "60% (4/7 turnos)" : "30% (2/7 turnos)"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full rounded-full ${barber.id_barbero === 1
                    ? "w-[85%] loyalty-progress-gold"
                    : barber.id_barbero === 2
                      ? "w-[60%] loyalty-progress-silver"
                      : "w-[30%] loyalty-progress-new"
                  }`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => onEdit && onEdit(barber)}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(barber)}
            className="p-2.5 border border-border rounded-xl hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
            title="Eliminar barbero"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
