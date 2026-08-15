import { Package } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function ProductDetailModal({ product, onEdit, onClose }) {
  return (
    <Modal title="Detalle del Producto" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre</label>
            <p className="text-foreground font-medium">{product.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría</label>
            <p className="text-foreground font-medium">{product.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Actual</label>
            <p className="text-foreground">{product.stock}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Mínimo</label>
            <p className="text-foreground">{product.minStock}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Precio</label>
            <p className="text-foreground font-bold">${product.price.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                product.status === "Disponible"
                  ? "bg-success/10 text-success"
                  : product.status === "Stock Bajo"
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {product.status}
            </span>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Descripción</label>
            <p className="text-foreground">{product.description || "Sin descripción"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">ID de Producto</label>
            <p className="text-foreground">#{product.id}</p>
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
