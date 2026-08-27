import Modal from "../../shared/components/Modal";
import { clients, users } from "../hooks/useSales";

export default function SaleDetailModal({ sale, onEdit, onClose }) {
  if (!sale) return null;

  const clientName = clients.find((c) => c.id_cliente === Number(sale.id_cliente))?.nombre || "Cliente Desconocido";
  const userName = users.find((u) => u.id_usuario === Number(sale.id_usuario))?.nombre || "Usuario Desconocido";

  return (
    <Modal title="Detalle de la Venta" onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="space-y-5">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Venta
            </span>
            <span className="text-xl font-bold text-foreground">#{sale.id_venta}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              sale.estado === "Activa"
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {sale.estado === "Activa" ? "● Registrada / Activa" : "● Anulada"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Cliente
            </span>
            <p className="text-base font-bold text-foreground">{clientName}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Atendido por
            </span>
            <p className="text-base font-semibold text-primary">{userName}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Fecha y Hora de Registro
            </span>
            <p className="text-sm text-foreground font-medium">{sale.fecha}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Origen de la Venta
            </span>
            <p className="text-sm text-foreground font-medium">
              {sale.id_cita ? `Cita de Servicio #${sale.id_cita}` : "Venta Directa en Mostrador"}
            </p>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
            Desglose de Servicios y Productos Facturados
          </span>
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold">Ítem</th>
                  <th className="text-center py-3 px-4 font-semibold">Cant.</th>
                  <th className="text-right py-3 px-4 font-semibold">Precio Unit.</th>
                  <th className="text-right py-3 px-4 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(sale.detalles || []).map((d, index) => (
                  <tr key={index} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">{d.tipo_item}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{d.nombre}</td>
                    <td className="py-3 px-4 text-center font-medium">{d.cantidad}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">${Number(d.precio_unitario).toLocaleString("es-CO")}</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">${Number(d.subtotal).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/30 border-t border-border">
                <tr>
                  <td colSpan={4} className="py-3.5 px-4 text-right font-bold text-foreground text-sm">Total Venta:</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-primary text-base sm:text-lg">
                    ${Number(sale.total).toLocaleString("es-CO")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Venta
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
