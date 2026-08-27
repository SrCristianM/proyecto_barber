import Modal from "../../shared/components/Modal";
import { clients, users } from "../hooks/useSales";

export default function SaleDetailModal({ sale, onEdit, onClose }) {
  if (!sale) return null;

  const clientName = clients.find((c) => c.id_cliente === Number(sale.id_cliente))?.nombre || "Cliente Desconocido";
  const userName = users.find((u) => u.id_usuario === Number(sale.id_usuario))?.nombre || "Usuario Desconocido";

  return (
    <Modal title="Detalle de la Venta" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-4">
        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-3.5 bg-secondary/30 rounded-xl border border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              ID de Venta
            </span>
            <span className="text-base font-bold text-foreground">#{sale.id_venta}</span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              sale.estado === "Activa"
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {sale.estado === "Activa" ? "● Registrada / Activa" : "● Anulada"}
          </span>
        </div>

        {/* Cuadrícula de datos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-card border border-border rounded-xl text-xs">
          <div>
            <span className="text-muted-foreground font-medium block mb-1">Cliente</span>
            <p className="text-sm font-semibold text-foreground">{clientName}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Atendido por</span>
            <p className="text-sm font-semibold text-foreground">{userName}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Fecha y Hora</span>
            <p className="text-xs text-foreground font-medium">{sale.fecha}</p>
          </div>

          <div>
            <span className="text-muted-foreground font-medium block mb-1">Cita Vinculada</span>
            <p className="text-xs text-foreground font-medium">{sale.id_cita ? `Cita #${sale.id_cita}` : "Venta Directa en Mostrador"}</p>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Desglose de Servicios y Productos
          </span>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-2.5 px-3 font-semibold">Tipo</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Ítem</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Cant.</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Precio Unit.</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(sale.detalles || []).map((d, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground">{d.tipo_item}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{d.nombre}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{d.cantidad}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">${Number(d.precio_unitario).toLocaleString("es-CO")}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">${Number(d.subtotal).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/20">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right font-bold text-foreground text-sm">Total Venta:</td>
                  <td className="py-3 px-3 text-right font-extrabold text-primary text-base">
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
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Editar Venta
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
