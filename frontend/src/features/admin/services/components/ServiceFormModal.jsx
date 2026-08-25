import { useState, useEffect } from "react";
import Modal from "../../shared/components/Modal";
import { availableCategories } from "../hooks/useServices";
import { Scissors, ImageOff, Loader2 } from "lucide-react";

function ImagePreview({ url }) {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "ok" | "error"

  useEffect(() => {
    if (!url || !url.trim()) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("ok");
    img.onerror = () => setStatus("error");
    img.src = url;
  }, [url]);

  if (status === "idle") return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-border bg-muted/30">
      {status === "loading" && (
        <div className="h-36 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando vista previa…
        </div>
      )}
      {status === "error" && (
        <div className="h-36 flex flex-col items-center justify-center gap-2 text-destructive text-sm">
          <ImageOff className="h-6 w-6" />
          <span>URL no válida o imagen no disponible</span>
        </div>
      )}
      {status === "ok" && (
        <img
          src={url}
          alt="Vista previa del servicio"
          className="w-full h-36 object-cover"
        />
      )}
    </div>
  );
}

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
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Servicio <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="Ej: Corte Clásico"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
          <select
            value={formData.id_categoria_servicio}
            onChange={(e) => setFormData({ ...formData, id_categoria_servicio: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Duración (min) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.duracion_minutos}
              onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Precio ($) <span className="text-destructive">*</span>
            </label>
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

        {/* URL de imagen con preview en tiempo real */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            URL de Imagen{" "}
            <span className="text-muted-foreground font-normal">(Opcional)</span>
          </label>
          <div className="relative">
            <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={formData.imagen_url || ""}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="https://ejemplo.com/servicio.jpg"
            />
          </div>
          {/* Preview actualizada en tiempo real */}
          <ImagePreview url={formData.imagen_url} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            {isCreate ? "Crear Servicio" : "Guardar Cambios"}
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
