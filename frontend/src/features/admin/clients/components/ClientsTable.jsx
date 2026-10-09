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
  onDelete,
  canEdit = true,
  canToggle = true,
  canDelete = true
}) {
  return (
    <>
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[480px] sm:min-w-[700px] text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[11px] sm:text-xs uppercase tracking-wider">
              <th className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Cliente" field="nombre" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Correo" field="correo" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold hidden md:table-cell">
                <SortHeader label="Dirección" field="direccion" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Nivel Fidelidad" field="nivel_fidelidad" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold">
                <SortHeader label="Estado" field="estado" current={sortField} dir={sortDir} onSort={onSort} />
              </th>
              <th className="text-right py-2 px-2 sm:py-3.5 sm:px-4 font-bold whitespace-nowrap">Acciones</th>
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
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-md sm:rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                        <User className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs sm:text-sm line-clamp-1 max-w-[110px] sm:max-w-none">{client.nombre} {client.apellido}</p>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground truncate max-w-[110px] sm:max-w-none">
                          {client.documento && <span>Doc: {client.documento}</span>}
                          {client.documento && client.telefono && <span>•</span>}
                          <span>{client.telefono || ""}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-muted-foreground text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{client.correo}</td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-foreground text-xs sm:text-sm font-medium hidden md:table-cell">{client.direccion || "—"}</td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                    <div className="space-y-1 min-w-[75px] sm:min-w-[120px]">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${loyalty.badge}`}
                      >
                        <LoyaltyIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {client.nivel_fidelidad || "Nuevo"}
                      </span>
                      {/* Barra de progreso animada acorde a su color de rango */}
                      <div className="w-14 sm:w-24 h-1 sm:h-1.5 bg-secondary/80 rounded-full overflow-hidden border border-border/50">
                        <div className={`h-full rounded-full ${loyalty.progressWidth} ${loyalty.progressClass}`} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 sm:py-3.5 sm:px-4">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full border whitespace-nowrap ${
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
                      {canToggle && (
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
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(client)}
                          className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
