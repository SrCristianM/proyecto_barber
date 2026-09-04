import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Receipt, Download, Info, Search, Calendar, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { getClientPurchases, getCurrentClientProfile } from "../services/clientStorageService";
import { downloadClientSaleReceiptPDF } from "../../../shared/utils/pdfInvoiceGenerator";
import Modal from "../../admin/shared/components/Modal";

export default function ClientMyPurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const client = useMemo(() => getCurrentClientProfile(), []);
  const purchases = useMemo(() => getClientPurchases(), []);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const search = searchTerm.toLowerCase();
      const itemsText = (p.detalles || []).map((d) => d.nombre).join(" ").toLowerCase();
      return (
        search === "" ||
        String(p.id_venta).includes(search) ||
        p.fecha.includes(search) ||
        p.estado.toLowerCase().includes(search) ||
        itemsText.includes(search)
      );
    });
  }, [purchases, searchTerm]);

  const handleDownload = (sale) => {
    downloadClientSaleReceiptPDF(sale, client);
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Facturación Personal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mis Compras</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta el historial detallado de tus servicios y productos facturados con opción de comprobante oficial.
          </p>
        </div>

        <Link
          to="/portal/productos"
          className="px-5 py-2.5 rounded-xl border border-border hover:bg-accent text-foreground font-bold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-[#C9A24A]" />
          <span>Explorar Productos</span>
        </Link>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por # de recibo, fecha, producto o servicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24A]"
        />
      </div>

      {/* TABLA DE COMPRAS */}
      {filteredPurchases.length > 0 ? (
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Comprobante</th>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Artículos Facturados</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPurchases.map((sale) => (
                  <tr key={sale.id_venta} className="hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-foreground">
                      #VENTA-{String(sale.id_venta).padStart(4, "0")}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground block">{sale.fecha.substring(0, 10)}</span>
                      <span className="text-muted-foreground text-[11px]">{sale.fecha.substring(11, 16)}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="max-w-xs truncate text-foreground font-medium">
                        {(sale.detalles || []).map((d) => `${d.nombre} (x${d.cantidad})`).join(", ") || "Servicios generales"}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {(sale.detalles || []).length} ítem(s) en total
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-[#C9A24A] text-sm">
                      ${Number(sale.total).toLocaleString("es-CO")}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        {sale.estado || "Activa"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(sale)}
                          className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Detalle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(sale)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A24A]/15 text-[#C9A24A] hover:bg-[#C9A24A] hover:text-black border border-[#C9A24A]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Descargar Comprobante PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-3xl border border-border p-8 space-y-3">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-bold text-foreground">No tienes compras registradas aún</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Cuando asistas a tus citas o compres productos en la barbería, tus facturas y comprobantes aparecerán aquí.
          </p>
        </div>
      )}

      {/* MODAL DETALLE DE COMPRA */}
      {selectedSale && (
        <Modal
          title={`Comprobante de Venta #VENTA-${String(selectedSale.id_venta).padStart(4, "0")}`}
          onClose={() => setSelectedSale(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de Emisión:</span>
                <span className="font-bold text-foreground">{selectedSale.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-bold text-foreground">{client?.nombre} {client?.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-bold text-emerald-500">{selectedSale.estado || "Activa"}</span>
              </div>
            </div>

            {/* Desglose de ítems */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Artículos Facturados
              </span>
              <div className="space-y-2">
                {(selectedSale.detalles || []).map((d, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{d.nombre}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {d.cantidad} x ${Number(d.precio_unitario).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      ${Number(d.subtotal).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 rounded-2xl bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-foreground">Total de la Compra:</span>
              <span className="text-xl font-black text-[#C9A24A]">
                ${Number(selectedSale.total).toLocaleString("es-CO")}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => handleDownload(selectedSale)}
                className="px-5 py-2 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs hover:bg-[#d8b056] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Comprobante (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
