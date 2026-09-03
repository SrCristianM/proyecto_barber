import { useRef } from "react";
import { Printer, Scissors, CheckCircle, Download, X } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function SaleReceiptModal({ sale, clientName, userName, onClose }) {
  const printRef = useRef(null);

  if (!sale) return null;

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
          <title>Ticket de Venta #${sale.id_venta}</title>
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
            .logo { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
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

  return (
    <Modal title="Ticket de Venta / Factura Térmica" onClose={onClose} maxWidthClass="max-w-md">
      <div className="space-y-4">
        {/* Contenedor del Ticket Térmico estilizado */}
        <div
          ref={printRef}
          className="bg-white text-black p-6 rounded-2xl border border-border shadow-md font-mono text-xs max-w-xs mx-auto space-y-3 print:m-0 print:p-0 print:border-none print:shadow-none"
        >
          {/* Cabecera de la Barbería */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 font-sans font-bold text-sm tracking-widest uppercase text-black">
              <Scissors className="h-4 w-4 text-black inline" />
              <span>Tu Turno Barber</span>
            </div>
            <p className="text-[10px] text-neutral-600">NIT: 901.452.883-1</p>
            <p className="text-[10px] text-neutral-600">Calle Principal # 45 - 20, Medellín</p>
            <p className="text-[10px] text-neutral-600">Tel: (+57) 300 123 4567</p>
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Metadata de Venta */}
          <div className="text-[11px] space-y-0.5 text-neutral-800">
            <div className="flex justify-between">
              <span className="font-bold">Factura / Ticket:</span>
              <span className="font-bold">#VK-{String(sale.id_venta).padStart(5, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{sale.fecha || new Date().toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente:</span>
              <span className="font-semibold truncate max-w-[140px]">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span>Cajero/Atiende:</span>
              <span>{userName}</span>
            </div>
            {sale.id_cita && (
              <div className="flex justify-between text-neutral-500">
                <span>Cita Asociada:</span>
                <span>#{sale.id_cita}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Tabla de Artículos */}
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-dashed border-neutral-400 text-left">
                <th className="pb-1">Cant.</th>
                <th className="pb-1">Descripción</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(sale.detalles || []).map((item, idx) => (
                <tr key={idx} className="py-1">
                  <td className="align-top py-1 font-semibold">{item.cantidad}x</td>
                  <td className="align-top py-1 pr-1">
                    <div>{item.nombre}</div>
                    <span className="text-[9px] text-neutral-500">
                      ${Number(item.precio_unitario).toLocaleString("es-CO")} c/u
                    </span>
                  </td>
                  <td className="align-top py-1 text-right font-bold">
                    ${Number(item.subtotal).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Totales */}
          <div className="space-y-1 text-right text-[11px]">
            <div className="flex justify-between font-bold text-sm text-black border-t border-neutral-300 pt-1">
              <span>TOTAL PAGADO:</span>
              <span>${Number(sale.total).toLocaleString("es-CO")}</span>
            </div>
            <p className="text-[9px] text-neutral-500 text-left">IVA incluido (19%) - Forma de pago: Efectivo / Tarjeta</p>
          </div>

          <div className="border-t border-dashed border-neutral-400 my-2" />

          {/* Pie de Página */}
          <div className="text-center space-y-1 pt-1">
            <p className="text-[10px] font-bold text-neutral-800">¡GRACIAS POR TU PREFERENCIA!</p>
            <p className="text-[9px] text-neutral-500">Síguenos en Instagram @tuturno.barber</p>
            <p className="text-[8px] text-neutral-400 mt-2">Software de Barbería v2.4 - Factura Simple</p>
          </div>
        </div>

        {/* Botones de acción del Modal */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
