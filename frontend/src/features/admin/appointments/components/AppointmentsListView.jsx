import { Edit } from "lucide-react";

const STATUS_CONFIG = {
  Programada: "badge-glow-primary",
  Completada: "badge-glow-success",
  Cancelada: "badge-glow-destructive",
  Reprogramada: "badge-glow-warning",
  "En Curso": "badge-glow-primary pulse-gold-glow"
};

export default function AppointmentsListView({ appointments, getClientName, getBarberName, getServiceInfo, onEdit }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="space-y-2.5">
        {appointments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No hay citas registradas</p>
        ) : (
          appointments.map((appointment) => {
            const clientName = getClientName ? getClientName(appointment.id_cliente) : `Cliente #${appointment.id_cliente}`;
            const barberName = getBarberName ? getBarberName(appointment.id_barbero) : `Barbero #${appointment.id_barbero}`;
            const serviceInfo = getServiceInfo ? getServiceInfo(appointment.id_servicio) : { nombre: "Servicio", precio: appointment.precio };
            const [hours, minutes] = appointment.hora.split(":");
            const statusClass = STATUS_CONFIG[appointment.estado] || "bg-muted text-muted-foreground";

            return (
              <div
                key={appointment.id_cita}
                id={`row-app-${appointment.id_cita}`}
                data-highlight-id={`app-${appointment.id_cita}`}
                className="flex items-center justify-between p-3.5 bg-background rounded-xl border border-border hover:shadow-sm transition-shadow"
              >
                {/* Hora */}
                <div className="text-center font-mono w-14 shrink-0">
                  <p className="text-xl font-bold text-foreground leading-none">{hours}</p>
                  <p className="text-xs text-muted-foreground">:{minutes}</p>
                </div>

                <div className="h-10 w-px bg-border mx-3 shrink-0" />

                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {serviceInfo.nombre} · {barberName} · ${Number(appointment.precio || serviceInfo.precio).toLocaleString()}
                  </p>
                </div>

                {/* Estado y acciones */}
                <div className="flex items-center gap-2.5 ml-3 shrink-0">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClass}`}>
                    {appointment.estado}
                  </span>
                  <button
                    onClick={() => onEdit?.(appointment)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all text-xs font-medium"
                    title="Editar cita"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
