export default function AppointmentsListView({ appointments, getClientName, getBarberName, getServiceInfo }) {
  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-primary/10 text-primary";
      case "Completada":
        return "bg-success/10 text-success";
      case "Cancelada":
        return "bg-destructive/10 text-destructive";
      case "Reprogramada":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-3">
        {appointments.map((appointment) => {
          const clientName = getClientName ? getClientName(appointment.id_cliente) : `Cliente #${appointment.id_cliente}`;
          const barberName = getBarberName ? getBarberName(appointment.id_barbero) : `Barbero #${appointment.id_barbero}`;
          const serviceInfo = getServiceInfo ? getServiceInfo(appointment.id_servicio) : { nombre: "Servicio", precio: appointment.precio };
          const timeParts = appointment.hora.split(":");

          return (
            <div
              key={appointment.id_cita}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="text-center font-mono">
                  <p className="text-2xl font-bold text-foreground">{timeParts[0]}</p>
                  <p className="text-xs text-muted-foreground">:{timeParts[1]}</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="font-semibold text-foreground">{clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceInfo.nombre} — {barberName} (${Number(appointment.precio).toLocaleString()})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusBadgeClass(appointment.estado)}`}>
                  {appointment.estado}
                </span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm">
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
