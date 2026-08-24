import { Users, UserCheck, Award } from "lucide-react";

export default function ClientsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Clientes</span>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.total || 0}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Clientes Activos</span>
          <UserCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.activos || 0}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Clientes Fidelizados (Oro/Plata)</span>
          <Award className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.fidelizados || 0}</h3>
      </div>
    </div>
  );
}
