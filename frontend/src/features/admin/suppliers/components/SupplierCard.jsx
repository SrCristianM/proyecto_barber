import { Building2, Eye, Power, Edit, Trash2, Phone, Mail, MapPin, Hash } from "lucide-react";
import { motion } from "motion/react";

export default function SupplierCard({
  supplier,
  onDetail,
  onToggleStatus,
  onEdit,
  onDelete
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header de la card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-base truncate" title={supplier.nombre}>
                {supplier.nombre}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Hash className="h-3 w-3" />
                {supplier.nit ? `NIT: ${supplier.nit}` : "Sin NIT"}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
              supplier.estado === 1
                ? "bg-success/10 text-success border border-success/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {supplier.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Datos de contacto */}
        <div className="space-y-2 py-3 border-y border-border/60 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="text-foreground truncate font-medium">
              {supplier.telefono || "Sin teléfono registrado"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="text-foreground truncate font-medium">
              {supplier.correo || "Sin correo registrado"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="text-foreground truncate font-medium">
              {supplier.direccion || "Sin dirección registrada"}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between gap-1 pt-4 mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDetail(supplier)}
            className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors"
            title="Ver Detalle"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleStatus(supplier)}
            className={`p-2 hover:bg-secondary rounded-lg transition-colors ${
              supplier.estado === 1
                ? "text-warning hover:text-warning/80"
                : "text-success hover:text-success/80"
            }`}
            title={supplier.estado === 1 ? "Desactivar Proveedor" : "Activar Proveedor"}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(supplier)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            onClick={() => onDelete(supplier)}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
            title="Eliminar Proveedor"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
