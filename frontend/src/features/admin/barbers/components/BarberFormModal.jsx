import { useState, useEffect } from "react";
import Modal from "../../shared/components/Modal";
import { availableSpecialties } from "../hooks/useBarbers";
import { User, ImageOff, Loader2, Sparkles, X } from "lucide-react";

const SAMPLE_BARBER_IMAGES = [
  { label: "Barbero 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
  { label: "Barbero 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
  { label: "Barbero 3", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" }
];

function BarberImagePreview({ url, onClear, onSelectSample }) {
  const [status, setStatus] = useState("idle");

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
      <div className="mt-2 p-2.5 rounded-lg border border-dashed border-border bg-muted/20">
        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Probar con avatar de ejemplo:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_BARBER_IMAGES.map((sample) => (
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
      <div className="rounded-xl overflow-hidden border border-border bg-muted/30 relative flex items-center justify-center min-h-[120px]">
        {status === "loading" && (
          <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Cargando foto…
          </div>
        )}

        {status === "error" && (
          <div className="p-3 flex flex-col items-center justify-center text-center gap-1">
            <ImageOff className="h-5 w-5 text-destructive" />
            <p className="text-xs font-semibold text-destructive">
              Enlace no válido o imagen protegida
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Usa la dirección directa de la imagen (.jpg, .png o .webp).
            </p>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => onSelectSample(SAMPLE_BARBER_IMAGES[0].url)}
                className="px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded font-medium"
              >
                Usar ejemplo
              </button>
              <button
                type="button"
                onClick={onClear}
                className="px-2 py-1 text-xs border border-border hover:bg-accent rounded text-foreground"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {status === "ok" && (
          <div className="p-3 flex items-center gap-3 w-full">
            <img
              src={url.trim()}
              alt="Foto del barbero"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Vista previa cargada</p>
              <p className="text-[11px] text-success">✓ Foto lista para guardar</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BarberFormModal({ mode, formData, setFormData, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Crear Nuevo Barbero" : "Editar Barbero"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              id="nombre"
              maxLength={80}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="Ej: Carlos"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Apellido <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              id="apellido"
              maxLength={80}
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="Ej: Rodríguez"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Correo Electrónico <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            name="correo"
            id="correo"
            maxLength={120}
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            id="telefono"
            maxLength={20}
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Especialidad</label>
          <select
            name="especialidad"
            id="especialidad"
            value={formData.especialidad}
            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
          >
            {availableSpecialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            URL de Imagen <span className="text-muted-foreground font-normal text-xs">(Opcional, máx. 255 car.)</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              name="imagen_url"
              id="imagen_url"
              maxLength={255}
              value={formData.imagen_url || ""}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
          <BarberImagePreview
            url={formData.imagen_url}
            onClear={() => setFormData({ ...formData, imagen_url: "" })}
            onSelectSample={(sampleUrl) => setFormData({ ...formData, imagen_url: sampleUrl })}
          />
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Crear Barbero" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
