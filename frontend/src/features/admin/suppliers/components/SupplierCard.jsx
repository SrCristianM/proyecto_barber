import { Building2, Eye, Power, Edit, Trash2, Phone, Mail, MapPin, Hash } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";

export default function SupplierCard({
  supplier,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  const isActive = supplier.estado === 1;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-sup-${supplier.id_proveedor}`}
        data-highlight-id={`sup-${supplier.id_proveedor}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground text-base leading-snug truncate" title={supplier.nombre}>
                  {supplier.nombre}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                  <Hash className="h-3 w-3 text-primary" />
                  {supplier.nit ? `NIT: ${supplier.nit}` : "Sin NIT"}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isActive ? "badge-glow-success" : "badge-glow-destructive"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Datos de contacto */}
          <div className="space-y-2 py-3 border-y border-border/60 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Teléfono
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{supplier.telefono || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Correo
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{supplier.correo || "Sin correo"}</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Dirección
              </span>
              <span className="font-medium text-foreground truncate max-w-[150px]">{supplier.direccion || "—"}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(supplier)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
          {onToggleStatus && (
            <button
              type="button"
              onClick={() => onToggleStatus(supplier)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                  : "text-muted-foreground bg-muted hover:text-foreground"
              }`}
              title={isActive ? "Desactivar" : "Activar"}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(supplier)}
              className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors cursor-pointer"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
