import Modal from "../../shared/components/Modal";

export default function ClientDetailModal({ client, onEdit, onClose }) {
  if (!client) return null;

  return (
    <Modal title="Detalle del Cliente" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Cliente
            </span>
            <span className="text-xl font-bold text-foreground">#{client.id_cliente}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                client.nivel_fidelidad === "Oro"
                  ? "bg-[#DAA520]/15 text-[#DAA520] border border-[#DAA520]/30"
                  : client.nivel_fidelidad === "Plata"
                  ? "bg-muted text-muted-foreground border border-border"
                  : "bg-[#CD7F32]/15 text-[#CD7F32] border border-[#CD7F32]/30"
              }`}
            >
              Fidelidad: {client.nivel_fidelidad || "Nuevo"}
            </span>
            <span
              className={`px-3.5 py-1 text-xs font-semibold rounded-full border ${
                client.estado === 1
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {client.estado === 1 ? "● Activo" : "● Inactivo"}
            </span>
          </div>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre Completo
            </span>
            <p className="text-base font-bold text-foreground">{client.nombre} {client.apellido}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{client.correo}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="text-sm font-medium text-foreground">{client.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Dirección de Residencia
            </span>
            <p className="text-sm font-medium text-foreground">{client.direccion || "No especificada"}</p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Usuario del Sistema Vinculado
            </span>
            <p className="text-sm text-foreground font-medium">Cuenta ID #{client.id_usuario}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
          >
            Editar Cliente
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground text-sm font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
