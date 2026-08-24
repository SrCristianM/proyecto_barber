import { DollarSign } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { clients, users } from "../hooks/useSales";

export default function SaleDetailModal({ sale, onEdit, onClose }) {
  const clientName = clients.find((c) => c.id_cliente === Number(sale.id_cliente))?.nombre || "Cliente Desconocido";
  const userName = users.find((u) => u.id_usuario === Number(sale.id_usuario))?.nombre || "Usuario Desconocido";

  return (
    <Modal title="Detalle de la Venta" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <DollarSign className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Cliente</label>
            <p className="text-foreground font-medium">{clientName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Registrado por</label>
            <p className="text-foreground font-medium">{userName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha</label>
            <p className="text-foreground">{sale.fecha}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                sale.estado === "Activa" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {sale.estado}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Venta</label>
            <p className="text-foreground">#{sale.id_venta}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Cita Asociada</label>
            <p className="text-foreground">{sale.id_cita ? `#${sale.id_cita}` : "Venta Directa"}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Detalle de Artículos / Servicios</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-accent/40 border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3">Tipo</th>
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-center py-2 px-3">Cant.</th>
                  <th className="text-right py-2 px-3">Unitario</th>
                  <th className="text-right py-2 px-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(sale.detalles || []).map((d, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-2 px-3 text-muted-foreground text-xs">{d.tipo_item}</td>
                    <td className="py-2 px-3 font-medium text-foreground">{d.nombre}</td>
                    <td className="py-2 px-3 text-center">{d.cantidad}</td>
                    <td className="py-2 px-3 text-right">${Number(d.precio_unitario).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold">${Number(d.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-card">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right font-bold text-foreground">Total:</td>
                  <td className="py-3 px-3 text-right font-bold text-primary text-base">
                    ${Number(sale.total).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Venta
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
