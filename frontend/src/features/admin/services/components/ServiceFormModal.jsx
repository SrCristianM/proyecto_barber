import Modal from "../../shared/components/Modal";
import { availableCategories } from "../hooks/useServices";

export default function ServiceFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Crear Nuevo Servicio" : "Editar Servicio"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nombre del Servicio</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="Ej: Corte Clásico"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
          <select
            value={formData.id_categoria_servicio}
            onChange={(e) => setFormData({ ...formData, id_categoria_servicio: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {availableCategories.map((cat) => (
              <option key={cat.id_categoria_servicio} value={cat.id_categoria_servicio}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Duración (minutos)</label>
            <input
              type="number"
              min="1"
              value={formData.duracion_minutos}
              onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Precio ($)</label>
            <input
              type="number"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">URL de Imagen (Opcional)</label>
          <input
            type="url"
            value={formData.imagen_url || ""}
            onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="https://ejemplo.com/servicio.jpg"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isCreate ? "Crear Servicio" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
