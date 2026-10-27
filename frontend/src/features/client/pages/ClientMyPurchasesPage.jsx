import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Receipt, Download, Info, Search, Calendar, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { getClientPurchases, getCurrentClientProfile } from "../services/clientStorageService";
import { downloadClientSaleReceiptPDF } from "../../../shared/utils/pdfInvoiceGenerator";
import Modal from "../../admin/shared/components/Modal";
import { useDataSync, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";

export default function ClientMyPurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [purchases, setPurchases] = useState(() => getClientPurchases());

  const client = useMemo(() => getCurrentClientProfile(), []);

  const reloadPurchases = () => setPurchases(getClientPurchases());
  useDataSync([SYNC_ENTITIES.SALES], reloadPurchases);

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
          <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">Facturación Personal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mis Compras</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta el historial detallado de tus servicios y productos facturados con opción de comprobante oficial.
          </p>
        </div>

        <Link
          to="/portal/productos"
          className="px-5 py-2.5 rounded-xl border border-border hover:bg-accent text-foreground font-bold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-[#DFB755] dark:text-[#E8C466]" />
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
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]"
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

                    <td className="py-4 px-4 font-black text-[#DDAE41] dark:text-[#E8C466] text-sm">
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
                          className="px-3 py-1.5 rounded-lg bg-[#DFB755]/15 text-[#DDAE41] dark:text-[#E8C466] hover:bg-gradient-to-r hover:from-[#E8C466] hover:to-[#DDAE41] hover:text-black border border-[#DFB755]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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

      {/* MODAL DETALLE DE COMPRA: MINI FACTURA TÉRMICA */}
      {selectedSale && (
        <Modal
          title={`Comprobante de Venta • #VENTA-${String(selectedSale.id_venta).padStart(4, "0")}`}
          onClose={() => setSelectedSale(null)}
          maxWidthClass="max-w-md"
        >
          <div className="space-y-5">
            {/* TICKET / FACTURA TÉRMICA ESTILIZADA */}
            <div className="rounded-3xl bg-card border border-border/80 shadow-2xl p-6 relative overflow-hidden font-mono text-xs">
              {/* Franja superior decorativa Barber Pole */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-white to-blue-600 absolute top-0 left-0" />

              {/* Encabezado de la factura */}
              <div className="text-center pb-4 border-b border-dashed border-border/80 space-y-1 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#DFB755] block">
                  TU TURNO BARBER
                </span>
                <h4 className="text-sm font-black text-foreground">COMPROBANTE DE PAGO</h4>
                <p className="text-[10px] text-muted-foreground">NIT: 901.458.239-1 • Salón Principal</p>
                <p className="text-[11px] font-bold text-foreground">
                  #FACTURA-{String(selectedSale.id_venta).padStart(4, "0")}
                </p>
              </div>

              {/* Metadatos */}
              <div className="py-3 border-b border-dashed border-border/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-bold text-foreground">{selectedSale.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-bold text-foreground">{client?.nombre} {client?.apellido}</span>
                </div>
                {selectedSale.metodo_pago && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método Pago:</span>
                    <span className="font-bold text-[#DFB755]">{selectedSale.metodo_pago}</span>
                  </div>
                )}
                {selectedSale.metodo_entrega && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modalidad:</span>
                    <span className="font-bold text-foreground">{selectedSale.metodo_entrega}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-bold text-emerald-500">{selectedSale.estado || "Aprobada"}</span>
                </div>
              </div>

              {/* Desglose de ítems */}
              <div className="py-3 border-b border-dashed border-border/80 space-y-2">
                <div className="flex justify-between font-bold text-muted-foreground text-[10px] uppercase">
                  <span>Cant. / Artículo</span>
                  <span>Total</span>
                </div>

                {(selectedSale.detalles || []).map((d, index) => (
                  <div key={index} className="flex justify-between items-start text-xs">
                    <div className="pr-2">
                      <p className="font-bold text-foreground">{d.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.cantidad} x ${Number(d.precio_unitario).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <span className="font-bold text-foreground whitespace-nowrap">
                      ${Number(d.subtotal).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Final */}
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Subtotal:</span>
                  <span>${Number(selectedSale.total).toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Impuestos (IVA):</span>
                  <span>Incluido</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-border/60">
                  <span className="text-foreground">TOTAL FACTURADO:</span>
                  <span className="text-lg text-[#DFB755] dark:text-[#E8C466]">
                    ${Number(selectedSale.total).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              {/* Código de barras decorativo tipo recibo */}
              <div className="mt-4 pt-3 border-t border-dashed border-border/60 text-center space-y-1">
                <div className="flex justify-center items-center gap-0.5 h-7 opacity-75">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-full inline-block bg-foreground ${
                        i % 3 === 0 ? "w-1" : i % 5 === 0 ? "w-0.5" : "w-1.5"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-muted-foreground tracking-widest block">
                  * {selectedSale.id_venta}-CO-BARBER *
                </span>
                <p className="text-[9.5px] text-muted-foreground italic mt-1">
                  ¡Gracias por tu preferencia en Tu Turno Barber!
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2 flex justify-between items-center">
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black text-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#DFB755]/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Comprobante PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
