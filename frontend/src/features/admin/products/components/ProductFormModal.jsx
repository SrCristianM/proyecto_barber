import Modal from "../../shared/components/Modal";
import ImageUploader from "../../shared/components/ImageUploader";
import { categories } from "../hooks/useProducts";

export default function ProductFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  const handleImageChange = (dataUrl) => {
    setFormData({ ...formData, imagen_url: dataUrl || "" });
  };

  return (
    <Modal title={isCreate ? "Crear Nuevo Producto" : "Editar Producto"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Producto <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="Ej: Gel para Cabello"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
          <select
            value={formData.id_categoria_producto}
            onChange={(e) => setFormData({ ...formData, id_categoria_producto: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id_categoria_producto} value={cat.id_categoria_producto}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Stock <span className="text-destructive">*</span></label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Precio ($) <span className="text-destructive">*</span></label>
            <input
              type="number"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
        </div>

        {/* Image Uploader reemplaza el campo URL */}
        <ImageUploader
          label="Imagen del Producto (Opcional)"
          value={formData.imagen_url}
          onChange={handleImageChange}
        />

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
            {isCreate ? "Crear Producto" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
