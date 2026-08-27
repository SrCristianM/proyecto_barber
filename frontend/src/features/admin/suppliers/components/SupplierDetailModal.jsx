import { Building2, Phone, Mail, MapPin, Hash, CheckCircle2, XCircle } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function SupplierDetailModal({ supplier, onEdit, onClose }) {
  if (!supplier) return null;

  return (
    <Modal title="Detalle del Proveedor" onClose={onClose} maxWidthClass="max-w-md">
      <div className="space-y-5">
        {/* Header Icon + Name */}
        <div className="flex flex-col items-center justify-center text-center p-4 bg-secondary/30 rounded-xl border border-border/60">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{supplier.nombre}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">ID de Proveedor: #{supplier.id_proveedor}</p>
          <div className="mt-2.5">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                supplier.estado === 1
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {supplier.estado === 1 ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Activo
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Inactivo
                </>
              )}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3 bg-card border border-border rounded-xl p-4 text-sm">
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Hash className="h-3.5 w-3.5 text-primary" /> NIT / Documento:
            </span>
            <span className="font-semibold text-foreground text-right">{supplier.nit || "No registrado"}</span>
          </div>

          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Phone className="h-3.5 w-3.5 text-primary" /> Teléfono:
            </span>
            <span className="font-medium text-foreground text-right">{supplier.telefono || "No registrado"}</span>
          </div>

          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Mail className="h-3.5 w-3.5 text-primary" /> Correo Electrónico:
            </span>
            <span className="font-medium text-foreground text-right break-all">{supplier.correo || "No registrado"}</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Dirección:
            </span>
            <span className="font-medium text-foreground text-right">{supplier.direccion || "No registrada"}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            Editar Proveedor
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
