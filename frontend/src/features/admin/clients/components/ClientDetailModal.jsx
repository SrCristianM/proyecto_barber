import Modal from "../../shared/components/Modal";

export default function ClientDetailModal({ client, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Cliente" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary">
              {`${client.nombre?.[0] || ""}${client.apellido?.[0] || ""}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
            <p className="text-foreground font-medium">{client.nombre} {client.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fidelidad</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                client.nivel_fidelidad === "Oro"
                  ? "bg-[#DAA520]/10 text-[#DAA520]"
                  : client.nivel_fidelidad === "Plata"
                  ? "bg-muted text-muted-foreground"
                  : "bg-[#CD7F32]/10 text-[#CD7F32]"
              }`}
            >
              {client.nivel_fidelidad || "Nuevo"}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Correo</label>
            <p className="text-foreground">{client.correo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Teléfono</label>
            <p className="text-foreground">{client.telefono || "No especificado"}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Dirección</label>
            <p className="text-foreground">{client.direccion || "No especificada"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                client.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {client.estado === 1 ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Cliente</label>
            <p className="text-foreground">#{client.id_cliente}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Usuario Asociado</label>
            <p className="text-foreground">#{client.id_usuario}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Cliente
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
