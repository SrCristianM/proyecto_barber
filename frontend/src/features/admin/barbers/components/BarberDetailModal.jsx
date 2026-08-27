import Modal from "../../shared/components/Modal";

export default function BarberDetailModal({ barber, onEdit, onClose }) {
  if (!barber) return null;

  return (
    <Modal title="Detalle del Barbero" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Barbero
            </span>
            <span className="text-xl font-bold text-foreground">#{barber.id_barbero}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              barber.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {barber.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre Completo
            </span>
            <p className="text-base font-bold text-foreground">{barber.nombre} {barber.apellido}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Especialidad
            </span>
            <p className="text-base font-semibold text-primary">{barber.especialidad || "General"}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{barber.correo}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="text-sm font-medium text-foreground">{barber.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Usuario del Sistema Vinculado
            </span>
            <p className="text-sm text-foreground font-medium">Cuenta ID #{barber.id_usuario}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Barbero
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
