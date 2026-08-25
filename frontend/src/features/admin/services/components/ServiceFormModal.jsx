import { useState, useEffect } from "react";
import Modal from "../../shared/components/Modal";
import { availableCategories } from "../hooks/useServices";
import { Scissors, ImageOff, Loader2, Info, Sparkles, X } from "lucide-react";

const SAMPLE_IMAGES = [
  { label: "Corte Clásico", url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80" },
  { label: "Barba & Afeitado", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80" },
  { label: "Degradado / Fade", url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80" }
];

function ImagePreview({ url, onClear, onSelectSample }) {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "ok" | "error"

  useEffect(() => {
    const trimmed = (url || "").trim();
    if (!trimmed) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const timeout = setTimeout(() => {
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.onload = () => setStatus("ok");
      img.onerror = () => setStatus("error");
      img.src = trimmed;
    }, 200);

    return () => clearTimeout(timeout);
  }, [url]);

  if (status === "idle") {
    return (
      <div className="mt-2 p-3 rounded-lg border border-dashed border-border bg-muted/20">
        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          O prueba con una imagen de ejemplo rápida:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => onSelectSample(sample.url)}
              className="px-2.5 py-1 text-[11px] font-medium bg-card hover:bg-accent border border-border rounded-md text-foreground transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="rounded-xl overflow-hidden border border-border bg-muted/30 relative group">
        {status === "loading" && (
          <div className="h-40 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Cargando vista previa…
          </div>
        )}

        {status === "error" && (
          <div className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <ImageOff className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-destructive">
                No se pudo cargar la imagen desde este enlace
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm">
                Asegúrate de copiar la <strong>dirección directa de la imagen</strong> (que termine en .jpg, .png, .webp) y no la URL de una página web o búsqueda de Google.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => onSelectSample(SAMPLE_IMAGES[0].url)}
                className="px-2.5 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors"
              >
                Usar imagen de prueba
              </button>
              <button
                type="button"
                onClick={onClear}
                className="px-2.5 py-1 text-xs border border-border hover:bg-accent rounded-md text-foreground transition-colors"
              >
                Limpiar URL
              </button>
            </div>
          </div>
        )}

        {status === "ok" && (
          <div className="relative">
            <img
              src={url.trim()}
              alt="Vista previa del servicio"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors shadow"
              title="Quitar imagen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {status === "ok" && (
        <p className="text-[11px] text-success flex items-center gap-1">
          ✓ Imagen cargada correctamente
        </p>
      )}
    </div>
  );
}

export default function ServiceFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  const handleClearUrl = () => {
    setFormData({ ...formData, imagen_url: "" });
  };

  const handleSelectSample = (sampleUrl) => {
    setFormData({ ...formData, imagen_url: sampleUrl });
  };

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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-foreground">
              URL de Imagen{" "}
              <span className="text-muted-foreground font-normal">(Opcional)</span>
            </label>
          </div>
          <div className="relative">
            <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={formData.imagen_url || ""}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
          {/* Preview interactiva con fallback inteligente y tips */}
          <ImagePreview
            url={formData.imagen_url}
            onClear={handleClearUrl}
            onSelectSample={handleSelectSample}
          />
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
