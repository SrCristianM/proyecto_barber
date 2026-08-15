export default function AppointmentsCalendarView({ timeSlots, barbers, getAppointmentForSlot }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="text-sm font-medium text-muted-foreground">Hora</div>
            {barbers.map((barber) => (
              <div key={barber} className="text-center">
                <p className="font-semibold text-foreground">{barber.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">{barber.split(" ")[1]}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-5 gap-2">
                <div className="flex items-center text-sm text-muted-foreground py-2">{time}</div>
                {barbers.map((barber) => {
                  const appointment = getAppointmentForSlot(barber, time);
                  return (
                    <div
                      key={barber}
                      className={`min-h-[80px] rounded-lg border-2 transition-all ${
                        appointment
                          ? appointment.status === "Confirmada"
                            ? "bg-primary/10 border-primary cursor-pointer hover:bg-primary/20"
                            : appointment.status === "En Proceso"
                            ? "bg-success/10 border-success cursor-pointer hover:bg-success/20"
                            : "bg-muted border-border cursor-pointer hover:bg-muted/80"
                          : "bg-background border-border hover:border-primary cursor-pointer"
                      }`}
                    >
                      {appointment && (
                        <div className="p-2">
                          <p className="text-sm font-medium text-foreground">{appointment.client}</p>
                          <p className="text-xs text-muted-foreground">{appointment.service}</p>
                          <p className="text-xs text-muted-foreground">{appointment.duration} min</p>
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
        <h3 className="font-semibold text-foreground mb-3">Leyenda</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 border-2 border-primary rounded" />
            <span className="text-sm text-foreground">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-success/10 border-2 border-success rounded" />
            <span className="text-sm text-foreground">En Proceso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted border-2 border-border rounded" />
            <span className="text-sm text-foreground">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-background border-2 border-border rounded" />
            <span className="text-sm text-foreground">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
