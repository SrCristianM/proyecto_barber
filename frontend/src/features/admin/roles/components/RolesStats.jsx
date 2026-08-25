import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

export default function RolesStats({ roles = [] }) {
  const total = roles.length;
  const activos = roles.filter((r) => r.estado === 1).length;
  const inactivos = roles.filter((r) => r.estado === 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Roles</span>
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Roles Activos</span>
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Roles Inactivos</span>
          <ShieldAlert className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{inactivos}</h3>
      </div>
    </div>
  );
}
