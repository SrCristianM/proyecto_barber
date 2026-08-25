import { Users, UserCheck, Shield } from "lucide-react";

export default function UsersStats({ users = [] }) {
  const total = users.length;
  const activos = users.filter((u) => u.estado === 1).length;
  const adminOrStaff = users.filter((u) => u.id_rol === 1 || u.id_rol === 2).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Usuarios</span>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Usuarios Activos</span>
          <UserCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Administradores y Staff</span>
          <Shield className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{adminOrStaff}</h3>
      </div>
    </div>
  );
}
