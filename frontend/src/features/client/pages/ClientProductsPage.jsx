import { useState, useMemo, useEffect, useRef } from "react";
import { ShoppingBag, Search, CheckCircle2, XCircle, Info, Tag, Plus, Minus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import ClientImage from "../components/ClientImage";
import ClientCartDrawer from "../components/ClientCartDrawer";
import { getClientProducts } from "../services/clientStorageService";
import Modal from "../../admin/shared/components/Modal";
import { toast } from "sonner";

export default function ClientProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Referencia para animación Fly-to-Cart hacia el header
  const cartBtnRef = useRef(null);
  const [flyingItems, setFlyingItems] = useState([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Estado de Productos dinámico
  const [products, setProducts] = useState(() => getClientProducts());
  const loadProducts = () => {
    setProducts(getClientProducts());
  };

  // Estado del Carrito de Compras
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("tu_turno_client_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistir carrito en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tu_turno_client_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Reiniciar cantidad del modal al cambiar de producto
  useEffect(() => {
    setModalQuantity(1);
  }, [selectedProduct]);

  const categories = useMemo(() => {
    const cats = ["all"];
    products.forEach((p) => {
      const catName = p.categoria || "General";
      if (!cats.includes(catName)) cats.push(catName);
    });
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchTerm === "" ||
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const catName = p.categoria || "General";
      const matchesCategory = selectedCategory === "all" || catName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product, quantity = 1, e = null) => {
    if (Number(product.stock || 0) <= 0) {
      toast.error("Este producto está agotado temporalmente.");
      return;
    }

    // Efecto Fly-to-Cart hacia el botón del header
    if (e && cartBtnRef.current) {
      const targetRect = cartBtnRef.current.getBoundingClientRect();
      const startX = e.clientX || window.innerWidth / 2;
      const startY = e.clientY || window.innerHeight / 2;
      const endX = Math.max(30, Math.min(window.innerWidth - 30, targetRect.left + targetRect.width / 2));
      const endY = Math.max(20, targetRect.top + targetRect.height / 2);

      const flyId = Date.now() + Math.random();
      setFlyingItems((prev) => [
        ...prev,
        {
          id: flyId,
          startX,
          startY,
          endX,
          endY,
          image: product.imagen_url,
          name: product.nombre,
        },
      ]);

      // Animación de impacto en carrito (bounce + micro-confetti) tras 600ms
      setTimeout(() => {
        setIsCartBouncing(true);
        setTimeout(() => setIsCartBouncing(false), 500);

        if (targetRect.top >= -20 && targetRect.bottom <= window.innerHeight + 100) {
          try {
            const xRatio = Math.max(0.1, Math.min(0.9, (targetRect.left + targetRect.width / 2) / window.innerWidth));
            const yRatio = Math.max(0.05, Math.min(0.9, (targetRect.top + targetRect.height / 2) / window.innerHeight));
            confetti({
              particleCount: 18,
              spread: 50,
              origin: { x: xRatio, y: yRatio },
              colors: ["#DFB755", "#E8C466", "#FFFFFF", "#DDAE41"],
              disableForReducedMotion: true,
              scalar: 0.65,
            });
          } catch {
            // Si confetti no puede ejecutarse, continuar normalmente
          }
        }
      }, 600);
    }

    setCart((prevCart) => {
      const existing = prevCart.find((it) => it.id_producto === product.id_producto);
      if (existing) {
        const newQty = Math.min(Number(product.stock || 99), existing.cantidad + quantity);
        toast.success(`Se actualizó la cantidad de "${product.nombre}" en tu carrito.`, {
          action: {
            label: "Ver Carrito",
            onClick: () => setIsCartOpen(true),
          },
        });
        return prevCart.map((it) =>
          it.id_producto === product.id_producto ? { ...it, cantidad: newQty } : it
        );
      }
      toast.success(`¡"${product.nombre}" añadido al carrito!`, {
        action: {
          label: "Ver Carrito",
          onClick: () => setIsCartOpen(true),
        },
      });
      return [
        ...prevCart,
        {
          id_producto: product.id_producto,
          nombre: product.nombre,
          precio: Number(product.precio),
          imagen_url: product.imagen_url,
          categoria: product.categoria,
          stock: Number(product.stock || 99),
          cantidad: quantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((it) => (it.id_producto === productId ? { ...it, cantidad: newQty } : it))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((it) => it.id_producto !== productId));
    toast.info("Producto retirado del carrito.");
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, it) => sum + it.cantidad, 0);

  return (
    <div className="space-y-6 relative">
      {/* ORBS VOLADORES (FLY-TO-CART) */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX - 24,
                y: item.startY - 24,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: item.endX - 20,
                y: item.endY - 20,
                scale: 0.2,
                opacity: 0.85,
                rotate: 360,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => {
                setFlyingItems((prev) => prev.filter((it) => it.id !== item.id));
              }}
              className="absolute w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#E8C466] shadow-2xl bg-black/90 flex items-center justify-center backdrop-blur-md"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-6 h-6 text-[#E8C466]" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">Cuidado y Estilo</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Productos de Barbería</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Lleva a casa los mismos productos profesionales de fijación, cuidado y afeitado que usamos en nuestro salón.
          </p>
        </div>

        {/* Botón Abrir Carrito con Rebote */}
        <motion.button
          ref={cartBtnRef}
          type="button"
          onClick={() => setIsCartOpen(true)}
          animate={
            isCartBouncing
              ? { scale: [1, 1.25, 0.92, 1.15, 1], rotate: [0, -5, 5, -2, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45 }}
          className="relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-black" />
          <span>VER CARRITO</span>
          {totalCartCount > 0 && (
            <motion.span
              key={totalCartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black text-white ml-1 shadow-xs"
            >
              {totalCartCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por gel, cera, shampoo, aceite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]"
          />
        </div>

        {/* Categorías Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {cat === "all" ? "Todos los Productos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isAvailable = Number(prod.stock || 0) > 0;

            return (
              <div
                key={prod.id_producto}
                className="group rounded-3xl bg-card border border-border hover:border-[#DFB755]/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Imagen de Producto */}
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <ClientImage
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      type="product"
                      category={prod.categoria}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge Categoría */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/10">
                        {prod.categoria || "Producto"}
                      </span>
                    </div>

                    {/* Badge Disponibilidad */}
                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/90 text-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Disponible</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-destructive/90 text-white shadow-sm">
                          <XCircle className="w-3 h-3" />
                          <span>Agotado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-extrabold text-foreground group-hover:text-[#DDAE41] dark:group-hover:text-[#E8C466] transition-colors line-clamp-1">
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {prod.descripcion || "Fórmula prémium recomendada por nuestros barberos profesionales."}
                    </p>
                  </div>
                </div>

                {/* Pie con Precio y Acciones */}
                <div className="p-4 pt-3 border-t border-border flex items-center justify-between bg-muted/10 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Precio</span>
                    <span className="text-base font-black text-[#DDAE41] dark:text-[#E8C466] whitespace-nowrap">
                      ${Number(prod.precio).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(prod);
                        setModalQuantity(1);
                      }}
                      className="p-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Ver detalles"
                    >
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>

                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => handleAddToCart(prod, 1, e)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] active:scale-95 text-black text-xs font-black shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isAvailable ? "Comprar" : "Agotado"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-3xl border border-border p-8">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No encontramos productos</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta con otra palabra de búsqueda o filtra por una categoría diferente.
          </p>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <Modal 
          title={selectedProduct.nombre} 
          onClose={() => setSelectedProduct(null)} 
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-5">
            <div className="h-52 rounded-2xl overflow-hidden bg-muted">
              <ClientImage
                src={selectedProduct.imagen_url}
                alt={selectedProduct.nombre}
                type="product"
                category={selectedProduct.categoria}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-muted/40 border border-border space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Categoría:</span>
                <span className="font-bold text-foreground">{selectedProduct.categoria || "General"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Disponibilidad:</span>
                <span className={`font-bold ${selectedProduct.stock > 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {selectedProduct.stock > 0 ? `Disponible (${selectedProduct.stock} unidades)` : "Agotado temporalmente"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-muted-foreground font-medium">Precio al Público:</span>
                <span className="text-xl font-black text-[#DDAE41] dark:text-[#E8C466]">
                  ${Number(selectedProduct.precio).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Información del Producto
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedProduct.descripcion || "Producto original garantizado de alta calidad. Puedes solicitarlo para entrega o recogerlo directamente en nuestra barbería."}
              </p>
            </div>

            {/* Selector de cantidad y botón comprar */}
            {Number(selectedProduct.stock || 0) > 0 ? (
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-xs font-bold text-muted-foreground">Cantidad:</span>
                  <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden p-0.5">
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      disabled={modalQuantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-foreground">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.min(Number(selectedProduct.stock || 1), q + 1))}
                      disabled={modalQuantity >= Number(selectedProduct.stock || 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent text-foreground disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-accent cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleAddToCart(selectedProduct, modalQuantity, e);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar (${(Number(selectedProduct.precio) * modalQuantity).toLocaleString("es-CO")})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/80 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}



      {/* DRAWER DEL CARRITO DE COMPRAS */}
      <ClientCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onPurchaseSuccess={() => {
          loadProducts();
        }}
      />
    </div>
  );
}
