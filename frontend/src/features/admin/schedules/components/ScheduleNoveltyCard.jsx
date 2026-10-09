import { Calendar, Check, X, Edit, Trash2 } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function ScheduleNoveltyCard({
  novelty,
  barberName,
  typeBadges = {},
  statusBadges = {},
  onChangeStatus,
  openEditModal,
  openDeleteModal
}) {
  const initialLetter = barberName ? barberName.charAt(0).toUpperCase() : "B";
  const regDate = novelty.fecha_registro ? String(novelty.fecha_registro).substring(0, 10) : novelty.fecha;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-nov-${novelty.id_novedad}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                {initialLetter}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm leading-snug">
                  {barberName}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Reg: {regDate}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${
                statusBadges[novelty.estado] || "bg-muted text-muted-foreground"
              }`}
            >
              {novelty.estado}
            </span>
          </div>

          {/* Tipo y Fecha */}
          <div className="flex items-center justify-between gap-2 py-2 border-y border-border/60 text-xs mb-3">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                typeBadges[novelty.tipo] || "bg-muted text-foreground"
              }`}
            >
              {novelty.tipo}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{novelty.fecha}</span>
            </div>
          </div>

          {/* Motivo */}
          <p className="text-xs text-foreground leading-relaxed line-clamp-3 mb-2">
            {novelty.descripcion || "Sin descripción proporcionada."}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1 pt-3 border-t border-border/60 mt-2">
          {novelty.estado === "Pendiente" && (
            <>
              <button
                type="button"
                onClick={() => onChangeStatus(novelty.id_novedad, "Aprobado")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                title="Aprobar novedad"
              >
                <Check className="h-3.5 w-3.5" />
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => onChangeStatus(novelty.id_novedad, "Rechazado")}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors cursor-pointer"
                title="Rechazar novedad"
              >
                <X className="h-3.5 w-3.5" />
                Rechazar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => openEditModal(novelty)}
            className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
            title="Editar novedad"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(novelty)}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
            title="Eliminar novedad"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
