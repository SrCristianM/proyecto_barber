import Modal from "../../shared/components/Modal";

export default function SupplierDetailModal({ supplier, onEdit, onClose }) {
  if (!supplier) return null;

  return (
    <Modal title="Detalle del Proveedor" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Proveedor
            </span>
            <span className="text-base font-bold text-foreground">#{supplier.id_proveedor}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              supplier.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {supplier.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Nombre de la Empresa / Proveedor</span>
            <p className="text-sm font-semibold text-foreground">{supplier.nombre}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">NIT / Documento</span>
            <p className="text-sm font-semibold text-foreground">{supplier.nit || "No especificado"}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Teléfono de Contacto</span>
            <p className="text-sm font-medium text-foreground">{supplier.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Correo Electrónico</span>
            <p className="text-sm font-medium text-foreground break-all">{supplier.correo || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Dirección Comercial</span>
            <p className="text-sm font-medium text-foreground">{supplier.direccion || "No especificada"}</p>
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
