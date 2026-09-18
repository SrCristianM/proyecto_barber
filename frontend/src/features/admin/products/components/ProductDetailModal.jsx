import { useNavigate } from "react-router";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

export default function ProductDetailModal({ product, onEdit, onClose }) {
  const navigate = useNavigate();
  if (!product) return null;

  const categoryName =
    CATEGORIAS_PRODUCTO.find((c) => c.id_categoria_producto === Number(product.id_categoria_producto))?.nombre ||
    "Sin Categoría";

  const isLowStock = Number(product.stock) <= 5;

  const handleReorder = () => {
    onClose();
    navigate(`/dashboard/purchases?reorderProductId=${product.id_producto}`);
  };

  return (
    <Modal title="Detalle del Producto" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Alerta de Stock Crítico y Acción de Reabastecimiento */}
        {isLowStock && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-foreground">Stock Crítico ({product.stock} unidades restantes)</p>
                <p className="text-[11px] text-muted-foreground">Este producto está próximo a agotarse en el inventario.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReorder}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Pedir Reabastecimiento</span>
            </button>
          </div>
        )}

        {/* Cabecera con ID y Estado */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-secondary/30 rounded-2xl border border-border/60">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
              ID de Producto
            </span>
            <span className="text-xl font-bold text-foreground">#{product.id_producto}</span>
          </div>
          <span
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${
              product.estado === 1
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {product.estado === 1 ? "● Activo" : "● Inactivo"}
          </span>
        </div>

        {/* Cuadrícula de datos agrandada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 sm:p-6 bg-card border border-border rounded-2xl">
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre del Producto
            </span>
            <p className="text-base font-bold text-foreground">{product.nombre}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Categoría
            </span>
            <p className="text-base font-semibold text-primary">{categoryName}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Precio Unitario
            </span>
            <p className="text-base font-bold text-foreground">${Number(product.precio).toLocaleString("es-CO")}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Stock Disponible
            </span>
            <p className={`text-base font-bold ${isLowStock ? "text-warning" : "text-foreground"}`}>
              {product.stock} unidades
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Disponibilidad
            </span>
            <p className="text-base font-medium text-foreground">
              {product.stock > 0 ? "En inventario" : "Agotado"}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
          >
            Editar Producto
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground text-sm font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

