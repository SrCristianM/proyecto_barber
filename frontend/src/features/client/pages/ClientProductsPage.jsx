import { useState, useMemo } from "react";
import { ShoppingBag, Search, CheckCircle2, XCircle, Info, Tag } from "lucide-react";
import { getClientProducts } from "../services/clientStorageService";
import Modal from "../../admin/shared/components/Modal";

export default function ClientProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = useMemo(() => getClientProducts(), []);

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

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Cuidado y Estilo</span>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">Productos de Barbería</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Lleva a casa los mismos productos profesionales de fijación, cuidado y afeitado que usamos en nuestro salón.
        </p>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24A]"
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
                  ? "bg-[#C9A24A] text-black shadow-sm"
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
                className="group rounded-3xl bg-card border border-border hover:border-[#C9A24A]/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Imagen de Producto */}
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {prod.imagen_url ? (
                      <img
                        src={prod.imagen_url}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#C9A24A]/10 text-[#C9A24A]">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                    )}

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
                    <h3 className="text-sm font-extrabold text-foreground group-hover:text-[#C9A24A] transition-colors line-clamp-1">
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {prod.descripcion || "Fórmula prémium recomendada por nuestros barberos profesionales."}
                    </p>
                  </div>
                </div>

                {/* Pie con Precio y Detalle */}
                <div className="p-4 pt-3 border-t border-border flex items-center justify-between bg-muted/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Precio</span>
                    <span className="text-base font-black text-[#C9A24A]">
                      ${Number(prod.precio).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className="px-3.5 py-1.5 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Detalle</span>
                  </button>
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
        <Modal title={selectedProduct.nombre} onClose={() => setSelectedProduct(null)} maxWidthClass="max-w-md">
          <div className="space-y-4">
            {selectedProduct.imagen_url && (
              <div className="h-44 rounded-2xl overflow-hidden bg-muted">
                <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-bold text-foreground">{selectedProduct.categoria || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponibilidad en Salón:</span>
                <span className={`font-bold ${selectedProduct.stock > 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {selectedProduct.stock > 0 ? `Disponible (${selectedProduct.stock} unidades)` : "Agotado temporalmente"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Precio al Público:</span>
                <span className="text-base font-black text-[#C9A24A]">
                  ${Number(selectedProduct.precio).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Información del Producto
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedProduct.descripcion || "Producto original garantizado de alta calidad. Puedes solicitarlo directamente con tu barbero durante tu próxima cita."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#C9A24A]/10 border border-[#C9A24A]/20 text-[11px] text-muted-foreground">
              💡 <strong>Nota:</strong> Los productos se adquieren y entregan de manera presencial en nuestra barbería al momento de tu cita.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:bg-accent/80 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
