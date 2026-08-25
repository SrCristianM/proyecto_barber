import { Clock, CalendarCheck, Users } from "lucide-react";

export default function SchedulesStats({ schedules = [] }) {
  const total = schedules.length;
  const activos = schedules.filter((s) => s.estado === 1).length;
  const barbersWithSchedule = new Set(schedules.map((s) => s.id_barbero)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Horarios</span>
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Horarios Activos</span>
          <CalendarCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Barberos Asignados</span>
          <Users className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{barbersWithSchedule}</h3>
      </div>
    </div>
  );
}
