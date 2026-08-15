import { Users, Calendar, Star } from "lucide-react";

export default function ClientsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Clientes</span>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Clientes Nuevos (mes)</span>
          <Calendar className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.newThisMonth}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Satisfacción Promedio</span>
          <Star className="h-5 w-5 text-warning fill-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{stats.avgRating}</h3>
      </div>
    </div>
  );
}
