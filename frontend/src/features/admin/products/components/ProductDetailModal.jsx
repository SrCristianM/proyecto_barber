import Modal from "../../shared/components/Modal";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

export default function ProductDetailModal({ product, onEdit, onClose }) {
  if (!product) return null;

  const categoryName =
    CATEGORIAS_PRODUCTO.find((c) => c.id_categoria_producto === Number(product.id_categoria_producto))?.nombre ||
    "Sin Categoría";

  return (
    <Modal title="Detalle del Producto" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
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
            <p className={`text-base font-bold ${product.stock <= 5 ? "text-warning" : "text-foreground"}`}>
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
