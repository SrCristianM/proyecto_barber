import Modal from "../../shared/components/Modal";

export default function ClientDetailModal({ client, onEdit, onClose }) {
  if (!client) return null;

  return (
    <Modal title="Detalle del Cliente" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Cliente
            </span>
            <span className="text-base font-bold text-foreground">#{client.id_cliente}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Nombre Completo</span>
            <p className="text-sm font-semibold text-foreground">{client.nombre} {client.apellido}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Correo Electrónico</span>
            <p className="text-sm font-medium text-foreground break-all">{client.correo}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Teléfono</span>
            <p className="text-sm font-medium text-foreground">{client.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium block mb-1">Dirección de Residencia</span>
            <p className="text-sm font-medium text-foreground">{client.direccion || "No especificada"}</p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/50 flex items-center justify-between">
            <div>
              <span className="text-muted-foreground font-medium block mb-0.5">Usuario del Sistema Vinculado</span>
              <p className="text-xs text-foreground font-medium">Cuenta ID #{client.id_usuario}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Editar Cliente
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
