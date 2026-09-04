import { useRef, useState, useEffect } from "react";
import { User, Camera, Upload, X, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

/**
 * Componente profesional para Avatar y Foto de Barberos (y otros perfiles).
 * Permite:
 * - Previsualización limpia y circular/cuadrada redondeada sin deformación.
 * - Subida directa desde archivos del dispositivo.
 * - Validación de tipos y tamaño con feedback inmediato.
 * - Cambiar o eliminar foto.
 * - Selección opcional de muestras rápidas.
 */
export default function AvatarImageUploader({
  value,
  onChange,
  label = "Foto de Perfil / Avatar",
  sampleImages = [],
  className = ""
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no válido. Utiliza archivos JPG, PNG, WEBP o GIF.");
      return;
    }

    // Validación de peso
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen excede el límite máximo de ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setPreview(dataUrl);
      onChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview("");
    setFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange?.("");
  };

  const handleSelectSample = (url) => {
    setError("");
    setPreview(url);
    setFileName("Avatar de catálogo");
    onChange?.(url);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-secondary/25 border border-border">
        {/* Contenedor del Avatar con Overlay */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary/40 bg-card flex items-center justify-center shadow-md relative">
            {preview ? (
              <img
                src={preview}
                alt="Avatar de barbero"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                  setError("No se pudo cargar la imagen desde la ruta especificada.");
                  setPreview("");
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50 text-muted-foreground">
                <User className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                <span className="text-[10px] font-semibold mt-1">Sin foto</span>
              </div>
            )}

            {/* Hover overlay con botón de cambio rápido */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              title="Cambiar imagen"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Cambiar</span>
            </div>
          </div>

          {/* Botón flotante para eliminar foto actual */}
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-md hover:scale-110 transition-transform"
              title="Quitar foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Acciones e instrucciones */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">
              {fileName || (preview ? "Foto personalizada asignada" : "Selecciona o sube una imagen")}
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Formatos aceptados: JPG, PNG o WEBP. Proporción cuadrada o retrato recomendada (máx. {MAX_SIZE_MB}MB).
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Subir desde mi equipo
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>

          {/* Feedback de error si el archivo fue rechazado */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input oculto para selección nativa de archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
