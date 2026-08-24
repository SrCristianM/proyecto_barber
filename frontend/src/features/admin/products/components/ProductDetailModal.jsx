import { Package } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

export default function ProductDetailModal({ product, onEdit, onClose }) {
  const categoryName =
    CATEGORIAS_PRODUCTO.find((c) => c.id_categoria_producto === Number(product.id_categoria_producto))?.nombre ||
    "Sin Categoría";

  return (
    <Modal title="Detalle del Producto" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          {product.imagen_url ? (
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="w-24 h-24 rounded-lg object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre del Producto</label>
            <p className="text-foreground font-medium">{product.nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
            <p className="text-foreground font-medium">{categoryName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Precio</label>
            <p className="text-foreground font-medium">${Number(product.precio).toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Disponible</label>
            <p className="text-foreground font-medium">{product.stock} unidades</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                product.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {product.estado === 1 ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Producto</label>
            <p className="text-foreground">#{product.id_producto}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Editar Producto
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
