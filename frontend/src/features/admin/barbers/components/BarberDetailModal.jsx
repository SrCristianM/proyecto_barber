import Modal from "../../shared/components/Modal";

export default function BarberDetailModal({ barber, onEdit, onClose }) {
  if (!barber) return null;

  return (
    <Modal title="Detalle del Barbero" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Barbero
            </span>
            <span className="text-base font-bold text-foreground">#{barber.id_barbero}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              barber.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {barber.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div>
            <span className="text-muted-foreground font-medium block mb-1">Nombre Completo</span>
            <p className="text-sm font-semibold text-foreground">{barber.nombre} {barber.apellido}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Especialidad</span>
            <p className="text-sm font-semibold text-primary">{barber.especialidad || "General"}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Correo Electrónico</span>
            <p className="text-sm font-medium text-foreground break-all">{barber.correo}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Teléfono</span>
            <p className="text-sm font-medium text-foreground">{barber.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground font-medium block mb-0.5">Usuario del Sistema Vinculado</span>
            <p className="text-xs text-foreground font-medium">Cuenta ID #{barber.id_usuario}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            Editar Barbero
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
