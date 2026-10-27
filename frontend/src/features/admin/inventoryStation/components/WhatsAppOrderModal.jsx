import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  X,
  MessageCircle,
  Truck,
  Copy,
  Check,
  AlertTriangle,
  Building,
  Phone,
  PackageCheck,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppOrderModal({
  isOpen,
  onClose,
  warehouseItems = [],
  suppliers = [],
  lowStockItems = []
}) {
  // Preseleccionar insumos con bajo stock o los primeros de la bodega si ninguno está bajo
  const [selectedItems, setSelectedItems] = useState(() => {
    const map = {};
    const base = lowStockItems.length > 0 ? lowStockItems : warehouseItems.slice(0, 3);
    base.forEach((item) => {
      const id = item.id_insumo;
      const suggested = Math.max(5, (Number(item.stock_minimo || 5) * 2) - Number(item.stock_actual || 0));
      map[id] = {
        selected: true,
        quantity: suggested
      };
    });
    return map;
  });

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id_proveedor || "");
  const [customPhone, setCustomPhone] = useState(suppliers[0]?.telefono || "+57 300 000 0000");
  const [customNotes, setCustomNotes] = useState("Por favor enviar factura electrónica y confirmar tiempo estimado de entrega.");
  const [copied, setCopied] = useState(false);

  // Al cambiar proveedor, actualizar teléfono
  const handleSupplierChange = (supId) => {
    setSelectedSupplierId(supId);
    const found = suppliers.find((s) => String(s.id_proveedor) === String(supId));
    if (found && found.telefono) {
      setCustomPhone(found.telefono);
    }
  };

  const selectedSupplier = suppliers.find((s) => String(s.id_proveedor) === String(selectedSupplierId));

  // Ítems activos para la orden
  const orderList = useMemo(() => {
    return warehouseItems
      .filter((item) => selectedItems[item.id_insumo]?.selected)
      .map((item) => {
        const qty = Number(selectedItems[item.id_insumo]?.quantity || 1);
        const cost = Number(item.costo_unitario || 0);
        return {
          ...item,
          orderQty: qty,
          orderSubtotal: qty * cost
        };
      });
  }, [warehouseItems, selectedItems]);

  const totalEstimatedCost = orderList.reduce((sum, i) => sum + i.orderSubtotal, 0);

  // Generar texto con formato de WhatsApp
  const generatedMessage = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const supName = selectedSupplier ? selectedSupplier.nombre : "Proveedor Directo";

    let text = `💈 *PEDIDO DE INSUMOS - TU TURNO BARBER* 💈\n`;
    text += `📅 *Fecha:* ${todayStr}\n`;
    text += `🏢 *Para:* ${supName}\n\n`;
    text += `Estimado distribuidor, solicitamos cotización y despacho de los siguientes insumos para nuestra bodega:\n\n`;

    orderList.forEach((item, index) => {
      const unit = item.unidad_medida || "unidades";
      text += `${index + 1}. *${item.nombre}*\n`;
      text += `   • Cantidad requerida: *${item.orderQty} ${unit}*\n`;
      if (item.costo_unitario) {
        text += `   • Ref. Costo Estimado: $${Number(item.costo_unitario).toLocaleString("es-CO")}\n`;
      }
    });

    text += `\n💰 *Total Estimado Ref:* $${totalEstimatedCost.toLocaleString("es-CO")} COP\n`;
    if (customNotes.trim()) {
      text += `📝 *Nota:* ${customNotes.trim()}\n`;
    }
    text += `\n📍 *Lugar de Entrega:* Barbería Tu Turno Barber - Sede Principal\n`;
    text += `🙏 *Agradecemos confirmar disponibilidad para coordinar el despacho.*`;

    return text;
  }, [selectedSupplier, orderList, totalEstimatedCost, customNotes]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleToggleItem = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        selected: !prev[id]?.selected,
        quantity: prev[id]?.quantity || 5
      }
    }));
  };

  const handleQuantityChange = (id, newQty) => {
    const val = Math.max(1, Number(newQty) || 1);
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: val
      }
    }));
  };

  const handleCopyMessage = () => {
    if (orderList.length === 0) {
      toast.error("Selecciona al menos un insumo para el pedido.");
      return;
    }
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success("¡Texto de pedido copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (orderList.length === 0) {
      toast.error("Selecciona al menos un insumo para el pedido.");
      return;
    }
    const cleanNumber = customPhone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Abriendo WhatsApp para enviar la orden...");
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card border border-emerald-500/30 shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Cabecera Estilo WhatsApp & Barber Shop */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-950/60 via-card to-card border-b border-border/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Generador de Pedido a Proveedor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> WhatsApp Directo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cotiza y solicita insumos agotados o críticos con un solo clic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Fila 1: Selección de Proveedor y Teléfono */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#DFB755]" /> Datos del Distribuidor Destinatario
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Proveedor de Insumos
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-hidden focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Proveedor General / Directo --</option>
                  {suppliers.map((s) => (
                    <option key={s.id_proveedor} value={s.id_proveedor}>
                      {s.nombre} {s.contacto ? `(${s.contacto})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:outline-hidden focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Insumos a Pedir */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" />
                Insumos para la Orden ({orderList.length} seleccionados)
              </span>
              <span className="text-[11px] font-bold text-amber-500 font-mono">
                Total Estimado: ${totalEstimatedCost.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {warehouseItems.map((item) => {
                const id = item.id_insumo;
                const isChecked = Boolean(selectedItems[id]?.selected);
                const isLow = Number(item.stock_actual || 0) <= Number(item.stock_minimo || 5);
                const currentQty = selectedItems[id]?.quantity || 5;

                return (
                  <div
                    key={id}
                    onClick={() => handleToggleItem(id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                        : "bg-card border-border/60 hover:bg-muted/20 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(id)}
                        className="w-4 h-4 rounded text-emerald-500 bg-background border-border focus:ring-emerald-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-foreground truncate text-xs">{item.nombre}</p>
                          {isLow && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Bajo Stock ({item.stock_actual})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          En bodega: <strong>{item.stock_actual} {item.unidad_medida || "un."}</strong> • Ref: ${Number(item.costo_unitario || 0).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>

                    {/* Selector de cantidad a pedir */}
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="text-[10px] text-muted-foreground font-semibold">Pedir:</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={currentQty}
                        onChange={(e) => handleQuantityChange(id, e.target.value)}
                        disabled={!isChecked}
                        className="w-16 px-2 py-1 text-center bg-background border border-border rounded-lg text-foreground font-mono font-bold text-xs focus:border-emerald-500 disabled:opacity-40"
                      />
                      <span className="text-[11px] text-muted-foreground">{item.unidad_medida || "un."}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fila 3: Nota y Vista Previa del Mensaje */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Instrucción Adicional / Observación
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ej: Requerimos entrega urgente antes de las 11:00 AM..."
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-hidden focus:border-emerald-500 transition-colors"
            />

            {/* Cuadro de Vista Previa */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Vista Previa del Mensaje a Enviar:
              </span>
              <pre className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 text-emerald-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {generatedMessage}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer del Modal con Acciones */}
        <div className="px-6 py-4 bg-background/80 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Orden lista para enviar con <strong className="text-foreground">{orderList.length} insumos</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyMessage}
              disabled={orderList.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "¡Copiado!" : "Copiar Texto"}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={orderList.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
