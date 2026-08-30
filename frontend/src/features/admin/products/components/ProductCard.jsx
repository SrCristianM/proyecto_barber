import { Package, Eye, Power, Edit, Trash2, Layers } from "lucide-react";
import TiltCard from "../../shared/components/TiltCard";
import { categories } from "../hooks/useProducts";

export default function ProductCard({ product, onDetail, onToggleStatus, onEdit, onDelete }) {
  const isActive = product.estado === 1;
  const category = categories.find((c) => c.id_categoria_producto === product.id_categoria_producto);
  const categoryName = category ? category.nombre : "General";

  const isStockEmpty = product.stock === 0;
  const isStockLow = product.stock > 0 && product.stock <= 4;
  const isStockMid = product.stock > 4 && product.stock <= 10;

  return (
    <TiltCard maxTilt={5} scale={1.015}>
      <div
        id={`card-prd-${product.id_producto}`}
        data-highlight-id={`prd-${product.id_producto}`}
        className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all h-full flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-3">
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={product.nombre}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/30 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0 shadow-xs">
                  <Package className="h-6 w-6" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">
                  {product.nombre}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[11px] font-semibold text-muted-foreground bg-secondary rounded-lg">
                  <Layers className="h-3 w-3 text-primary" />
                  {categoryName}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                isActive ? "badge-glow-success" : "badge-glow-destructive"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Nivel de Stock con Barra Animada */}
          <div className="bg-secondary/40 rounded-xl p-2.5 my-3 border border-border/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium">Nivel de Stock:</span>
              <span
                className={`font-bold ${
                  isStockEmpty ? "text-destructive" : isStockLow ? "text-amber-500" : "text-foreground"
                }`}
              >
                {product.stock} unidades ({isStockEmpty ? "Agotado" : isStockLow ? "Crítico" : "Óptimo"})
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full rounded-full transition-all ${
                  isStockEmpty
                    ? "w-0"
                    : isStockLow
                    ? "w-1/4 loyalty-progress-bronze"
                    : isStockMid
                    ? "w-3/5 loyalty-progress-silver"
                    : "w-full loyalty-progress-gold"
                }`}
              />
            </div>
          </div>

          {/* Precio y SKU */}
          <div className="flex items-center justify-between py-2 border-t border-border/60 text-xs">
            <span className="text-muted-foreground font-medium">Precio de Venta</span>
            <span className="text-base font-bold text-primary font-mono">
              ${Number(product.precio).toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-3 border-t border-border/60 mt-2">
          <button
            type="button"
            onClick={() => onDetail && onDetail(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-foreground bg-secondary hover:bg-accent rounded-xl transition-colors font-semibold cursor-pointer"
            title="Ver Detalle"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          <button
            type="button"
            onClick={() => onEdit && onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-semibold cursor-pointer"
            title="Editar"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(product)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:text-foreground"
            }`}
            title={isActive ? "Desactivar" : "Activar"}
          >
            <Power className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(product)}
            className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
