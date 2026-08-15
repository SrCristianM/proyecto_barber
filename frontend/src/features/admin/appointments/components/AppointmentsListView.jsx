export default function AppointmentsListView({ appointments }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{appointment.time.split(":")[0]}</p>
                <p className="text-xs text-muted-foreground">{appointment.time.split(":")[1]}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-semibold text-foreground">{appointment.client}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.service} - {appointment.barber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  appointment.status === "Confirmada"
                    ? "bg-[#DAA520]/10 text-[#DAA520]"
                    : appointment.status === "En Proceso"
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {appointment.status}
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm">
                  Ver Detalle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
