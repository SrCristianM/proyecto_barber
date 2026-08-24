export default function AppointmentsCalendarView({
  timeSlots,
  barbers,
  getAppointmentForSlot,
  getClientName,
  getServiceInfo
}) {
  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-primary/10 border-primary text-primary";
      case "Completada":
        return "bg-success/10 border-success text-success";
      case "Cancelada":
        return "bg-destructive/10 border-destructive text-destructive";
      case "Reprogramada":
        return "bg-warning/10 border-warning text-warning";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="text-sm font-medium text-muted-foreground">Hora</div>
            {barbers.map((barber) => (
              <div key={barber.id_barbero} className="text-center">
                <p className="font-semibold text-foreground">{barber.nombre.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">{barber.nombre.split(" ")[1] || ""}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-5 gap-2">
                <div className="flex items-center text-sm text-muted-foreground py-2 font-mono">{time}</div>
                {barbers.map((barber) => {
                  const appointment = getAppointmentForSlot(barber.id_barbero, time);
                  const clientName = appointment && getClientName ? getClientName(appointment.id_cliente) : "";
                  const serviceInfo = appointment && getServiceInfo ? getServiceInfo(appointment.id_servicio) : null;

                  return (
                    <div
                      key={barber.id_barbero}
                      className={`min-h-[80px] rounded-lg border-2 transition-all ${
                        appointment
                          ? `${getStatusBadgeClass(appointment.estado)} cursor-pointer hover:opacity-90`
                          : "bg-background border-border hover:border-primary cursor-pointer"
                      }`}
                    >
                      {appointment && (
                        <div className="p-2">
                          <p className="text-sm font-medium text-foreground">{clientName}</p>
                          <p className="text-xs text-muted-foreground">{serviceInfo?.nombre || "Servicio"}</p>
                          <p className="text-xs text-muted-foreground">{serviceInfo?.duracion_minutos || 30} min</p>
                          <span className="text-[10px] font-semibold uppercase tracking-wider block mt-1">
                            {appointment.estado}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-background rounded-lg border border-border">
        <h3 className="font-semibold text-foreground mb-3">Leyenda de Estados (BD)</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded" />
            <span className="text-sm text-foreground">Programada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/20 border-2 border-success rounded" />
            <span className="text-sm text-foreground">Completada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning/20 border-2 border-warning rounded" />
            <span className="text-sm text-foreground">Reprogramada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive/20 border-2 border-destructive rounded" />
            <span className="text-sm text-foreground">Cancelada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-background border-2 border-border rounded" />
            <span className="text-sm text-foreground">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
