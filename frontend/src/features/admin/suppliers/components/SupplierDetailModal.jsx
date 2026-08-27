import Modal from "../../shared/components/Modal";

export default function SupplierDetailModal({ supplier, onEdit, onClose }) {
  if (!supplier) return null;

  return (
    <Modal title="Detalle del Proveedor" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Proveedor
            </span>
            <span className="text-xl font-bold text-foreground">#{supplier.id_proveedor}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              supplier.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {supplier.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre de la Empresa / Proveedor
            </span>
            <p className="text-base font-bold text-foreground">{supplier.nombre}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              NIT / Documento
            </span>
            <p className="text-base font-semibold text-primary">{supplier.nit || "No especificado"}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono de Contacto
            </span>
            <p className="text-base font-medium text-foreground">{supplier.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{supplier.correo || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Dirección Comercial / Sede
            </span>
            <p className="text-sm font-medium text-foreground">{supplier.direccion || "No especificada"}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Proveedor
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
