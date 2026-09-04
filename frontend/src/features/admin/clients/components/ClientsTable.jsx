import { User, Eye, Power, Edit, Trash2, Crown, UserCheck, Award } from "lucide-react";
import SortHeader from "../../shared/components/SortHeader";

const LOYALTY_CONFIG = {
  Oro: {
    badge: "bg-primary/10 text-primary border-primary/40 shadow-xs",
    icon: Crown,
    progressWidth: "w-full",
    progressClass: "loyalty-progress-gold",
    points: "100%"
  },
  Plata: {
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    icon: Award,
    progressWidth: "w-2/3",
    progressClass: "loyalty-progress-silver",
    points: "65%"
  },
  Bronce: {
    badge: "bg-amber-700/10 text-amber-600 border-amber-700/30",
    icon: Award,
    progressWidth: "w-1/3",
    progressClass: "loyalty-progress-bronze",
    points: "30%"
  },
  Nuevo: {
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: UserCheck,
    progressWidth: "w-1/6",
    progressClass: "loyalty-progress-new",
    points: "10%"
  }
};

export default function ClientsTable({
  clients,
  totalCount,
  sortField,
  sortDir,
  onSort,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">
                <SortHeader label="Cliente" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-3.5 px-4 font-bold">
                <SortHeader label="Correo" field="correo" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-3.5 px-4 font-bold">
                <SortHeader label="Dirección" field="direccion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-3.5 px-4 font-bold">
                <SortHeader label="Nivel Fidelidad" field="nivel_fidelidad" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-3.5 px-4 font-bold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-3.5 px-4 font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => {
              const loyalty = LOYALTY_CONFIG[client.nivel_fidelidad] || LOYALTY_CONFIG.Nuevo;
              const LoyaltyIcon = loyalty.icon;
              const isActive = client.estado === 1;

              return (
                <tr
                  key={client.id_cliente}
                  id={`row-cli-${client.id_cliente}`}
                  data-highlight-id={`cli-${client.id_cliente}`}
                  className="table-row-accent transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{client.nombre} {client.apellido}</p>
                        <p className="text-xs text-muted-foreground">{client.telefono || "Sin teléfono"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">{client.correo}</td>
                  <td className="py-3.5 px-4 text-foreground font-medium">{client.direccion || "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5 min-w-[120px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${loyalty.badge}`}
                      >
                        <LoyaltyIcon className="h-3 w-3" />
                        {client.nivel_fidelidad || "Nuevo"}
                      </span>
                      {/* Barra de progreso animada acorde a su color de rango */}
                      <div className="w-24 h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
                        <div className={`h-full rounded-full ${loyalty.progressWidth} ${loyalty.progressClass}`} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${
                        isActive ? "badge-glow-success" : "badge-glow-destructive"
                      }`}
                    >
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onDetail(client)}
                        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(client)}
                        className={`p-1.5 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
                          isActive ? "text-emerald-500 hover:text-amber-500" : "text-muted-foreground hover:text-emerald-500"
                        }`}
                        title={isActive ? "Desactivar" : "Activar"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(client)}
                        className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(client)}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
