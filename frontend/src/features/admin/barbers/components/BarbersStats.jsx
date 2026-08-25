import { Users, UserCheck, Award } from "lucide-react";

export default function BarbersStats({ barbers = [] }) {
  const total = barbers.length;
  const activos = barbers.filter((b) => b.estado === 1).length;
  const specialtiesCount = new Set(barbers.map((b) => b.especialidad).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Barberos</span>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Barberos Activos</span>
          <UserCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Especialidades</span>
          <Award className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{specialtiesCount}</h3>
      </div>
    </div>
  );
}
