import { Scissors, Sparkles, Clock } from "lucide-react";

export default function ServicesStats({ services = [] }) {
  const total = services.length;
  const activos = services.filter((s) => s.estado === 1).length;
  const avgDuration = total > 0
    ? Math.round(services.reduce((acc, s) => acc + Number(s.duracion_minutos || 0), 0) / total)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Servicios</span>
          <Scissors className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Servicios Activos</span>
          <Sparkles className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Duración Promedio</span>
          <Clock className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{avgDuration} <span className="text-lg font-normal text-muted-foreground">min</span></h3>
      </div>
    </div>
  );
}
