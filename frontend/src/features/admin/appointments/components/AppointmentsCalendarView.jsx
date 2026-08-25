import { Plus } from "lucide-react";

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
      case "Programada":   return "bg-primary/10 border-primary text-primary";
      case "Completada":   return "bg-success/10 border-success text-success";
      case "Cancelada":    return "bg-destructive/10 border-destructive text-destructive";
      case "Reprogramada": return "bg-warning/10 border-warning text-warning";
      default:             return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header de barberos */}
          <div
            className="grid gap-2 mb-3"
            style={{ gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)` }}
          >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hora</div>
            {barbers.map((barber) => (
              <div key={barber.id_barbero} className="text-center px-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-xs font-bold text-primary">
                    {barber.nombre.charAt(0)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{barber.nombre.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{barber.nombre.split(" ")[1] || ""}</p>
              </div>
            ))}
          </div>

          {/* Filas de slots */}
          <div className="space-y-1.5">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid gap-2 items-start"
                style={{ gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)` }}
              >
                {/* Hora */}
                <div className="flex items-center h-16">
                  <span className="text-xs text-muted-foreground font-mono">{time}</span>
                </div>

                {barbers.map((barber) => {
                  const appointment = getAppointmentForSlot(barber.id_barbero, time);

                  return appointment ? (
                    /* Slot ocupado — clickable para editar */
                    <div
                      key={barber.id_barbero}
                      onClick={() => onAppointmentClick?.(appointment)}
                      className={`h-16 rounded-lg border-2 cursor-pointer hover:opacity-80 transition-opacity p-2 ${getStatusClass(appointment.estado)}`}
                    >
                      <p className="text-xs font-semibold leading-tight truncate">
                        {getClientName ? getClientName(appointment.id_cliente) : `#${appointment.id_cliente}`}
                      </p>
                      <p className="text-[10px] opacity-80 truncate">
                        {getServiceInfo ? getServiceInfo(appointment.id_servicio)?.nombre : "Servicio"}
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-wide block mt-0.5">
                        {appointment.estado}
                      </span>
                    </div>
                  ) : (
                    /* Slot vacío — clickable para crear */
                    <button
                      key={barber.id_barbero}
                      onClick={() => onSlotClick?.(barber, time)}
                      className="h-16 rounded-lg border-2 border-dashed border-border bg-background hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-center"
                      title={`Agendar cita a las ${time} con ${barber.nombre}`}
                    >
                      <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[9px] text-primary font-medium">Agendar</span>
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
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-5 flex-wrap">
        {[
          { label: "Programada", cls: "bg-primary/20 border-primary" },
          { label: "Completada", cls: "bg-success/20 border-success" },
          { label: "Reprogramada", cls: "bg-warning/20 border-warning" },
          { label: "Cancelada", cls: "bg-destructive/20 border-destructive" },
          { label: "Disponible", cls: "bg-background border-border border-dashed" }
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 border-2 rounded ${cls}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
