import { Clock, Calendar, Eye, Edit, Power, Trash2, User } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function ScheduleCard({
  schedule,
  getBarberName,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete,
  canEdit = true,
  canToggle = true,
  canDelete = true
}) {
  const isActive = schedule.estado === 1;
  const barberName = getBarberName(schedule.id_barbero);

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-sch-${schedule.id_horario}`}
        data-highlight-id={`sch-${schedule.id_horario}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  {barberName}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  Horario #{schedule.id_horario}
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

          {/* Horario y Turno */}
          <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Jornada Laboral
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {schedule.hora_inicio} — {schedule.hora_fin}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Vigencia
              </span>
              <span className="text-foreground font-semibold">
                {schedule.fecha_inicio || schedule.fecha_fin ? (
                  `${schedule.fecha_inicio || "Inicio"} al ${schedule.fecha_fin || "Indefinido"}`
                ) : (
                  "Permanente"
                )}
              </span>
            </div>
          </div>

          {/* Días laborales */}
          <div className="mb-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Días de Turno
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(schedule.dias_semana || []).map((dia) => (
                <span
                  key={dia}
                  className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-lg font-semibold border border-primary/20"
                >
                  {dia.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/60 mt-3">
          <button
            type="button"
            onClick={() => onDetail && onDetail(schedule)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(schedule)}
              className="flex items-center justify-center p-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer shrink-0"
              title="Editar Horario"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {canToggle && (
            <button
              type="button"
              onClick={() => onToggleStatus && onToggleStatus(schedule)}
              className={`p-2 rounded-xl transition-colors font-semibold cursor-pointer shrink-0 ${
                isActive
                  ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                  : "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
              }`}
              title={isActive ? "Desactivar Horario" : "Activar Horario"}
            >
              <Power className="h-4 w-4" />
            </button>
          )}

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(schedule)}
              className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors font-semibold cursor-pointer shrink-0"
              title="Eliminar Horario"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
