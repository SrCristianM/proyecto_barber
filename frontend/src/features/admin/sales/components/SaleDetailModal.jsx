import { ShoppingCart } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function SaleDetailModal({ sale, onEdit, onClose }) {
  return (
    <Modal title="Detalle de la Venta" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Fecha</label>
            <p className="text-foreground font-medium">{sale.date}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Hora</label>
            <p className="text-foreground font-medium">{sale.time}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Cliente</label>
            <p className="text-foreground">{sale.client}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Barbero</label>
            <p className="text-foreground">{sale.barber}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Artículos/Servicios</label>
            <div className="space-y-1">
              {sale.items.map((item, idx) => (
                <p key={idx} className="text-foreground">
                  • {item}
                </p>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Método de Pago</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                sale.payment === "Efectivo"
                  ? "bg-success/10 text-success"
                  : sale.payment === "Tarjeta"
                  ? "bg-[#DAA520]/10 text-[#DAA520]"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {sale.payment}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Total</label>
            <p className="text-foreground font-bold text-2xl">${sale.total.toLocaleString()}</p>
          </div>
          {sale.notes && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Notas</label>
              <p className="text-foreground">{sale.notes}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Venta</label>
            <p className="text-foreground">#{sale.id}</p>
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
