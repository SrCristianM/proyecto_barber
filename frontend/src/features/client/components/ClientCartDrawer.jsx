import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Sparkles,
  Receipt
} from "lucide-react";
import ClientImage from "./ClientImage";
import { createClientPurchase, getCurrentClientProfile } from "../services/clientStorageService";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router";

export default function ClientCartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPurchaseSuccess
}) {
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // 'pickup' | 'delivery'
  const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' | 'transfer'
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const navigate = useNavigate();
  const clientProfile = getCurrentClientProfile();

  const subtotal = cart.reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0);
  const deliveryFee = deliveryMethod === "delivery" && subtotal < 60000 ? 5000 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (deliveryMethod === "delivery" && !deliveryAddress.trim() && !clientProfile?.direccion) {
      toast.error("Por favor indica la dirección de entrega.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = createClientPurchase({
        items: cart,
        metodoPago: paymentMethod === "cash" ? "Efectivo / Datáfono" : "Transferencia Nequi/Bancolombia",
        metodoEntrega: deliveryMethod === "pickup" ? "Retiro en Barbería" : "Envío a Domicilio",
        direccionEnvio: deliveryAddress || clientProfile?.direccion || "",
        notas: notes
      });

      setIsSubmitting(false);

      if (res.success) {
        // Lanzar confeti dorado de celebración
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"]
        });

        setCompletedSale(res.sale);
        if (onClearCart) onClearCart();
        if (onPurchaseSuccess) onPurchaseSuccess(res.sale);
        toast.success("¡Compra realizada con éxito! Comprobante generado.");
      } else {
        toast.error(res.error || "No se pudo procesar la compra.");
      }
    }, 450);
  };

  const handleClose = () => {
    setCompletedSale(null);
    onClose();
  };

  const handleGoToPurchases = () => {
    handleClose();
    navigate("/portal/mis-compras");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
        >
          {/* CABECERA DEL CARRITO */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#DFB755]/15 text-[#DFB755]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Tu Carrito</h3>
                <span className="text-xs text-muted-foreground">
                  {cart.length} {cart.length === 1 ? "artículo" : "artículos"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {completedSale ? (
              /* PANTALLA DE COMPRA EXITOSA */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[#DFB755]">
                    ¡Orden Confirmada!
                  </span>
                  <h4 className="text-xl font-black text-foreground">
                    Gracias por tu compra
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Tu pedido ha sido registrado con el comprobante:
                  </p>
                  <p className="text-sm font-mono font-black text-[#DFB755] pt-1">
                    #VENTA-{String(completedSale.id_venta).padStart(4, "0")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comprador:</span>
                    <span className="font-bold text-foreground">
                      {completedSale.cliente_nombre || (clientProfile ? `${clientProfile.nombre} ${clientProfile.apellido || ""}`.trim() : "Cliente")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método de Entrega:</span>
                    <span className="font-bold text-foreground">{completedSale.metodo_entrega}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método de Pago:</span>
                    <span className="font-bold text-foreground">{completedSale.metodo_pago}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold text-foreground">Total Pagado:</span>
                    <span className="text-base font-black text-[#DDAE41] dark:text-[#E8C466]">
                      ${Number(completedSale.total).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={handleGoToPurchases}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>VER EN MIS COMPRAS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs transition-colors cursor-pointer"
                  >
                    Seguir Explorando
                  </button>
                </div>
              </motion.div>
            ) : cart.length === 0 ? (
              /* ESTADO VACÍO */
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#DFB755]/10 text-[#DFB755] flex items-center justify-center mx-auto border border-[#DFB755]/20">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-foreground">Tu carrito está vacío</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Añade ceras, aceites, geles o productos de barbería para recibirlos en tu próxima cita o en casa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground text-xs font-bold transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              /* LISTA DE PRODUCTOS */
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Productos Seleccionados
                    </span>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      Vaciar carrito
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.id_producto}
                        className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-3"
                      >
                        {/* Imagen miniatura */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                          <ClientImage
                            src={item.imagen_url}
                            alt={item.nombre}
                            type="product"
                            category={item.categoria}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info y Cantidad */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-black text-foreground truncate">
                            {item.nombre}
                          </h5>
                          <span className="text-[11px] font-bold text-[#DDAE41] dark:text-[#E8C466]">
                            ${Number(item.precio).toLocaleString("es-CO")}
                          </span>

                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Selector de cantidad */}
                            <div className="flex items-center border border-border rounded-lg bg-card">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id_producto, item.cantidad - 1)}
                                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-black text-foreground">
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                disabled={item.cantidad >= (item.stock || 99)}
                                onClick={() => onUpdateQuantity(item.id_producto, item.cantidad + 1)}
                                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[10px] text-muted-foreground">
                              Subtotal: ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                            </span>
                          </div>
                        </div>

                        {/* Eliminar ítem */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id_producto)}
                          className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MÉTODO DE ENTREGA */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Forma de Entrega
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        deliveryMethod === "pickup"
                          ? "bg-[#DFB755]/15 border-[#DFB755] text-foreground font-bold"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Store className="w-4 h-4 text-[#DFB755] shrink-0" />
                      <div>
                        <p className="text-xs font-black">Retiro en Salón</p>
                        <span className="text-[10px] text-emerald-500 font-bold block">Gratis</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        deliveryMethod === "delivery"
                          ? "bg-[#DFB755]/15 border-[#DFB755] text-foreground font-bold"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Truck className="w-4 h-4 text-[#DFB755] shrink-0" />
                      <div>
                        <p className="text-xs font-black">A Domicilio</p>
                        <span className="text-[10px] text-muted-foreground block">
                          {subtotal >= 60000 ? "¡Envío Gratis!" : "$5.000 COP"}
                        </span>
                      </div>
                    </button>
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="pt-2 space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground block">
                        Dirección de Entrega
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Calle 10 # 40-20, Apto 502"
                        defaultValue={clientProfile?.direccion || ""}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-input-background border border-input text-foreground focus:ring-2 focus:ring-[#DFB755]"
                      />
                    </div>
                  )}
                </div>

                {/* MÉTODO DE PAGO */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Forma de Pago
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === "cash"
                          ? "bg-[#DFB755]/15 border-[#DFB755] text-foreground font-bold"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-[#DFB755] shrink-0" />
                      <div>
                        <p className="text-xs font-black">Contra Entrega</p>
                        <span className="text-[10px] text-muted-foreground block">Efectivo/Datáfono</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === "transfer"
                          ? "bg-[#DFB755]/15 border-[#DFB755] text-foreground font-bold"
                          : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#DFB755] shrink-0" />
                      <div>
                        <p className="text-xs font-black">Transferencia</p>
                        <span className="text-[10px] text-muted-foreground block">Nequi / Bancolombia</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* NOTAS ADICIONALES */}
                <div className="pt-2 border-t border-border">
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Instrucciones o notas adicionales (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Entregar en portería, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-input-background border border-input text-foreground focus:ring-2 focus:ring-[#DFB755]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PIE CON TOTAL Y CHECKOUT */}
          {!completedSale && cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-border bg-muted/20 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-bold text-foreground">
                    ${subtotal.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Costo de Entrega:</span>
                  <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-500" : "text-foreground"}`}>
                    {deliveryFee === 0 ? "Gratis" : `$${deliveryFee.toLocaleString("es-CO")}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
                  <span className="font-black text-foreground">Total a Pagar:</span>
                  <span className="text-xl font-black text-[#DDAE41] dark:text-[#E8C466]">
                    ${total.toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-lg shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>CONFIRMAR COMPRA (${total.toLocaleString("es-CO")})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
