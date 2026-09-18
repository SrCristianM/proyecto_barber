import { useRef, useState } from "react";
import { Printer, Scissors, CheckCircle, Download, X, Share2, Check } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../../shared/components/Modal";
import { toast } from "sonner";

export default function SaleReceiptModal({ sale, clientName, userName, onClose }) {
  const printRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const ticketNumber = `#VK-${String(sale.id_venta).padStart(5, "0")}`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Venta ${ticketNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              background: #fff;
              width: 76mm;
              margin: 2mm auto;
              padding: 0;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 11px; }
            .table th { border-bottom: 1px dashed #000; padding: 2px 0; text-align: left; }
            .table td { padding: 2px 0; }
            .barcode { font-family: monospace; letter-spacing: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleWhatsAppShare = () => {
    const itemsSummary = (sale.detalles || [])
      .map((d) => `• ${d.cantidad}x ${d.nombre} - $${Number(d.subtotal).toLocaleString("es-CO")}`)
      .join("%0A");
    
    const text = `💈 *TU TURNO BARBER* 💈%0A%0A*Factura:* ${ticketNumber}%0A*Cliente:* ${encodeURIComponent(clientName)}%0A*Fecha:* ${encodeURIComponent(sale.fecha || "")}%0A%0A*Detalle:*%0A${itemsSummary}%0A%0A*TOTAL:* $${Number(sale.total).toLocaleString("es-CO")}%0A%0A_¡Gracias por tu preferencia! Esperamos verte pronto._`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("Abriendo WhatsApp para compartir ticket");
  };

  return (
    <Modal title="Ticket Térmico Digital" onClose={onClose} maxWidthClass="max-w-md">
      <div className="space-y-4">
        {/* Ranura dispensadora de impresora térmica */}
        <div className="w-48 h-2.5 mx-auto bg-neutral-900 dark:bg-neutral-800 rounded-full border border-neutral-700 shadow-inner flex items-center justify-center">
          <div className="w-36 h-0.5 bg-neutral-950 rounded-full" />
        </div>

        {/* Contenedor del Ticket Térmico con animación de salida de papel y borde dentado */}
        <motion.div
          initial={{ y: -30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          ref={printRef}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% calc(100% - 10px), 96% 100%, 92% calc(100% - 10px), 88% 100%, 84% calc(100% - 10px), 80% 100%, 76% calc(100% - 10px), 72% 100%, 68% calc(100% - 10px), 64% 100%, 60% calc(100% - 10px), 56% 100%, 52% calc(100% - 10px), 48% 100%, 44% calc(100% - 10px), 40% 100%, 36% calc(100% - 10px), 32% 100%, 28% calc(100% - 10px), 24% 100%, 20% calc(100% - 10px), 16% 100%, 12% calc(100% - 10px), 8% 100%, 4% calc(100% - 10px), 0% 100%)"
          }}
          className="bg-white text-neutral-900 px-6 pt-6 pb-8 shadow-2xl font-mono text-xs max-w-xs mx-auto space-y-3 print:m-0 print:p-0 print:shadow-none select-none border-x border-neutral-300 relative"
        >
          {/* Cabecera de la Barbería */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-sans font-black text-base tracking-widest uppercase text-neutral-950">
              <Scissors className="h-4 w-4 text-amber-600 inline" />
              <span>Tu Turno Barber</span>
            </div>
            <p className="text-[10px] text-neutral-600 font-sans tracking-wide">NIT: 901.452.883-1 • RÉGIMEN SIMPLIFICADO</p>
            <p className="text-[10px] text-neutral-600">Calle Principal # 45 - 20, Medellín</p>
            <p className="text-[10px] text-neutral-600">Tel: (+57) 300 123 4567</p>
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Metadata de Venta */}
          <div className="text-[11px] space-y-0.5 text-neutral-800">
            <div className="flex justify-between">
              <span className="font-bold">Factura / Ticket:</span>
              <span className="font-bold text-neutral-950">{ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{sale.fecha || new Date().toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span className="font-semibold truncate max-w-[140px] text-neutral-950">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span>Atendido por:</span>
              <span>{userName}</span>
            </div>
            {sale.id_cita && (
              <div className="flex justify-between text-neutral-600">
                <span>Cita de Servicio:</span>
                <span className="font-semibold">#{sale.id_cita}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Estado:</span>
              <span className="font-bold text-emerald-700 uppercase text-[10px]">● {sale.estado || "Activa"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Tabla de Artículos */}
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-dashed border-neutral-400 text-left">
                <th className="pb-1 text-neutral-700">Cant.</th>
                <th className="pb-1 text-neutral-700">Descripción</th>
                <th className="pb-1 text-right text-neutral-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(sale.detalles || []).map((item, idx) => (
                <tr key={idx} className="py-1">
                  <td className="align-top py-1 font-bold text-neutral-900">{item.cantidad}x</td>
                  <td className="align-top py-1 pr-1">
                    <div className="font-semibold text-neutral-900">{item.nombre}</div>
                    <span className="text-[9px] text-neutral-500">
                      ${Number(item.precio_unitario).toLocaleString("es-CO")} c/u
                    </span>
                  </td>
                  <td className="align-top py-1 text-right font-bold text-neutral-950">
                    ${Number(item.subtotal).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Totales */}
          <div className="space-y-1 text-right text-[11px]">
            <div className="flex justify-between font-black text-sm text-neutral-950 border-t border-neutral-400 pt-1">
              <span>TOTAL PAGADO:</span>
              <span className="text-base">${Number(sale.total).toLocaleString("es-CO")}</span>
            </div>
            <p className="text-[9px] text-neutral-500 text-left">IVA incluido (19%) • Método: Efectivo / Tarjeta</p>
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Código de barras simulado en SVG estético */}
          <div className="text-center py-1">
            <svg className="w-full h-8 mx-auto" viewBox="0 0 160 32" preserveAspectRatio="none">
              <g fill="#1a1a1a">
                <rect x="5" y="0" width="3" height="32" />
                <rect x="10" y="0" width="1" height="32" />
                <rect x="13" y="0" width="4" height="32" />
                <rect x="19" y="0" width="2" height="32" />
                <rect x="23" y="0" width="1" height="32" />
                <rect x="27" y="0" width="5" height="32" />
                <rect x="34" y="0" width="2" height="32" />
                <rect x="38" y="0" width="4" height="32" />
                <rect x="44" y="0" width="1" height="32" />
                <rect x="48" y="0" width="3" height="32" />
                <rect x="53" y="0" width="2" height="32" />
                <rect x="57" y="0" width="4" height="32" />
                <rect x="63" y="0" width="1" height="32" />
                <rect x="67" y="0" width="3" height="32" />
                <rect x="72" y="0" width="5" height="32" />
                <rect x="79" y="0" width="2" height="32" />
                <rect x="83" y="0" width="1" height="32" />
                <rect x="86" y="0" width="4" height="32" />
                <rect x="92" y="0" width="2" height="32" />
                <rect x="96" y="0" width="3" height="32" />
                <rect x="101" y="0" width="1" height="32" />
                <rect x="104" y="0" width="5" height="32" />
                <rect x="111" y="0" width="2" height="32" />
                <rect x="115" y="0" width="3" height="32" />
                <rect x="120" y="0" width="1" height="32" />
                <rect x="123" y="0" width="4" height="32" />
                <rect x="129" y="0" width="2" height="32" />
                <rect x="133" y="0" width="5" height="32" />
                <rect x="140" y="0" width="1" height="32" />
                <rect x="143" y="0" width="3" height="32" />
                <rect x="148" y="0" width="2" height="32" />
                <rect x="152" y="0" width="4" height="32" />
              </g>
            </svg>
            <p className="text-[9px] tracking-widest font-mono text-neutral-600 mt-1 font-bold">
              *{String(sale.id_venta).padStart(8, "0")}*
            </p>
          </div>

          {/* Pie de Página */}
          <div className="text-center space-y-0.5 pt-1">
            <p className="text-[10px] font-bold text-neutral-900 uppercase">¡Gracias por tu preferencia!</p>
            <p className="text-[9px] text-neutral-600">Instagram: @tuturno.barber</p>
            <p className="text-[8px] text-neutral-400">Software Tu Turno Barber • v2.4</p>
          </div>
        </motion.div>

        {/* Botones de acción del Modal */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-xs sm:text-sm shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold text-xs sm:text-sm cursor-pointer shadow-xs"
            title="Compartir por WhatsApp"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-xs sm:text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

