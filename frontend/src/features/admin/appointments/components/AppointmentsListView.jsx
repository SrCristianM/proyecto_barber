import { useState } from "react";
import { Edit, Calendar, Clock, User, Scissors, DollarSign } from "lucide-react";
import ViewModeToggle from "../../shared/components/ViewModeToggle";
import TiltCard from "../../shared/components/TiltCard";

const STATUS_CONFIG = {
  Programada: "badge-glow-primary",
  Completada: "badge-glow-success",
  Cancelada: "badge-glow-destructive",
  Reprogramada: "badge-glow-warning",
  "En Curso": "badge-glow-primary pulse-gold-glow"
};

export default function AppointmentsListView({ appointments, getClientName, getBarberName, getServiceInfo, onEdit }) {
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-5 shadow-xs space-y-4">
      {/* Barra superior con selector de vista */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium">
          Mostrando {appointments.length} cita{appointments.length === 1 ? "" : "s"} agendada{appointments.length === 1 ? "" : "s"}
        </p>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {appointments.length === 0 ? (
        <p className="text-center text-xs sm:text-sm text-muted-foreground py-10">No hay citas registradas</p>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] md:min-w-0 md:w-full xl:min-w-[800px] text-xs sm:text-sm text-left">
            <thead className="border-b border-border bg-muted/30 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Hora</th>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Cliente</th>
                <th className="hidden xl:table-cell py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Barbero</th>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Servicio</th>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Precio</th>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5">Estado</th>
                <th className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((appointment) => {
                const clientName = getClientName ? getClientName(appointment.id_cliente, appointment) : `Cliente #${appointment.id_cliente}`;
                const barberName = getBarberName ? getBarberName(appointment.id_barbero) : `Barbero #${appointment.id_barbero}`;
                const serviceInfo = getServiceInfo ? getServiceInfo(appointment.id_servicio) : { nombre: "Servicio", precio: appointment.precio };
                const statusClass = STATUS_CONFIG[appointment.estado] || "bg-muted text-muted-foreground";

                return (
                  <tr
                    key={appointment.id_cita}
                    id={`row-app-${appointment.id_cita}`}
                    data-highlight-id={`app-${appointment.id_cita}`}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                        <span>{appointment.hora}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 font-semibold text-foreground">
                      {clientName}
                    </td>
                    <td className="hidden xl:table-cell py-2.5 px-2 md:px-3 lg:px-4 sm:py-3.5 text-muted-foreground">
                      {barberName}
                    </td>
                    <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-foreground font-medium">
                      {serviceInfo.nombre}
                    </td>
                    <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 font-mono font-bold text-foreground">
                      ${Number(appointment.precio || serviceInfo.precio || 0).toLocaleString("es-CO")}
                    </td>
                    <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-semibold border ${statusClass}`}>
                        {appointment.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-right">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(appointment)}
                          className="p-1 sm:p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                          title="Editar cita"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => {
            const clientName = getClientName ? getClientName(appointment.id_cliente, appointment) : `Cliente #${appointment.id_cliente}`;
            const barberName = getBarberName ? getBarberName(appointment.id_barbero) : `Barbero #${appointment.id_barbero}`;
            const serviceInfo = getServiceInfo ? getServiceInfo(appointment.id_servicio) : { nombre: "Servicio", precio: appointment.precio };
            const statusClass = STATUS_CONFIG[appointment.estado] || "bg-muted text-muted-foreground";

            return (
              <TiltCard key={appointment.id_cita} maxTilt={5} scale={1.015}>
                <div
                  id={`card-app-${appointment.id_cita}`}
                  data-highlight-id={`app-${appointment.id_cita}`}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-foreground text-base leading-none">
                            {appointment.hora}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Cita #{appointment.id_cita}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${statusClass}`}>
                        {appointment.estado}
                      </span>
                    </div>

                    {/* Datos */}
                    <div className="space-y-2 py-3 border-y border-border/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                          Cliente
                        </span>
                        <span className="font-bold text-foreground truncate max-w-[150px]">{clientName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Scissors className="h-3.5 w-3.5 text-primary" />
                          Barbero
                        </span>
                        <span className="text-foreground truncate max-w-[150px]">{barberName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Servicio</span>
                        <span className="font-medium text-foreground truncate max-w-[150px]">{serviceInfo.nombre}</span>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center justify-between py-2 border-b border-border/60 text-xs">
                      <span className="text-muted-foreground">Precio Acordado</span>
                      <span className="font-mono font-bold text-primary text-sm">
                        ${Number(appointment.precio || serviceInfo.precio || 0).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {onEdit && (
                    <div className="pt-3 mt-2">
                      <button
                        onClick={() => onEdit(appointment)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar Cita
                      </button>
                    </div>
                  )}
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
