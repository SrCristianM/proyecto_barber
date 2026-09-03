import { Plus, Clock, User, Sparkles, AlertCircle } from "lucide-react";

export default function AppointmentsCalendarView({
  timeSlots,
  barbers,
  selectedDate,
  getAppointmentForSlot,
  getClientName,
  getServiceInfo,
  onSlotClick,
  onAppointmentClick
}) {
  const getStatusClass = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-primary/15 border-primary text-primary shadow-xs hover:bg-primary/25";
      case "Completada":
        return "bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-xs hover:bg-emerald-500/25";
      case "Cancelada":
        return "bg-rose-500/15 border-rose-500 text-rose-500 opacity-75 line-through hover:opacity-100";
      case "Reprogramada":
        return "bg-amber-500/15 border-amber-500 text-amber-500 shadow-xs hover:bg-amber-500/25";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header de barberos */}
          <div
            className="grid gap-3 mb-4 pb-3 border-b border-border/80"
            style={{ gridTemplateColumns: `85px repeat(${barbers.length}, 1fr)` }}
          >
            <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
              Hora
            </div>
            {barbers.map((barber) => (
              <div
                key={barber.id_barbero}
                className="text-center p-2.5 rounded-xl bg-secondary/30 border border-border/50 transition-all"
              >
                <div className="w-9 h-9 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-primary">
                    {barber.nombre.charAt(0)}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground leading-tight truncate">{barber.nombre}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                  Disponible
                </span>
              </div>
            ))}
          </div>

          {/* Filas de slots */}
          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid gap-3 items-start"
                style={{ gridTemplateColumns: `85px repeat(${barbers.length}, 1fr)` }}
              >
                {/* Hora */}
                <div className="flex items-center h-18 pl-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-border/50 text-xs font-mono font-bold text-foreground">
                    <Clock className="h-3 w-3 text-primary" />
                    <span>{time}</span>
                  </div>
                </div>

                {barbers.map((barber) => {
                  const appointment = getAppointmentForSlot(barber.id_barbero, time);
                  const svcInfo = appointment ? getServiceInfo(appointment.id_servicio) : null;

                  return appointment ? (
                    /* Slot ocupado — clickable para editar */
                    <div
                      key={barber.id_barbero}
                      onClick={() => onAppointmentClick?.(appointment)}
                      className={`h-18 rounded-xl border-2 cursor-pointer transition-all p-2.5 flex flex-col justify-between ${getStatusClass(
                        appointment.estado
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold leading-tight truncate">
                          {getClientName ? getClientName(appointment.id_cliente) : `#${appointment.id_cliente}`}
                        </p>
                        {svcInfo && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background/80 font-bold border border-current shrink-0">
                            ⏱️ {svcInfo.duracion_minutos || 30}m
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] opacity-90 mt-1">
                        <span className="truncate max-w-[110px]">
                          {svcInfo?.nombre || "Servicio"}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.2 rounded-sm bg-background/60">
                          {appointment.estado}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Slot vacío — clickable para crear */
                    <button
                      key={barber.id_barbero}
                      onClick={() => onSlotClick?.(barber, time)}
                      className="h-18 rounded-xl border-2 border-dashed border-border/80 bg-background hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-center cursor-pointer shadow-2xs"
                      title={`Agendar cita a las ${time} con ${barber.nombre}`}
                    >
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] text-primary font-bold">Libre</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { label: "Programada", cls: "bg-primary/20 border-primary text-primary" },
            { label: "Completada", cls: "bg-emerald-500/20 border-emerald-500 text-emerald-500" },
            { label: "Reprogramada", cls: "bg-amber-500/20 border-amber-500 text-amber-500" },
            { label: "Cancelada", cls: "bg-rose-500/20 border-rose-500 text-rose-500" },
            { label: "Disponible", cls: "bg-background border-border border-dashed text-muted-foreground" }
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 border-2 rounded-md ${cls}`} />
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Haz clic en cualquier celda para agendar o gestionar</span>
        </div>
      </div>
    </div>
  );
}

