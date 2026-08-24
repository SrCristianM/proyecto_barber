import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

/**
 * Componente ImageUploader con preview local.
 * Permite seleccionar imagen del equipo, ver preview y eliminar selección.
 *
 * @param {string} value - URL actual de la imagen (para edición)
 * @param {Function} onChange - Callback con (dataUrl, file)
 * @param {string} label - Etiqueta del campo
 */
export default function ImageUploader({ value, onChange, label = "Imagen" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    // Validar tipo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no válido. Use JPG, PNG, WEBP o GIF.");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onChange?.(reader.result, file);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null, null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">{label}</label>
      )}

      {preview ? (
        /* Vista previa */
        <div className="relative group">
          <div className="w-full h-48 rounded-lg border border-border overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-white/90 text-foreground rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 bg-destructive/90 text-white rounded-lg text-sm font-medium hover:bg-destructive transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Eliminar
            </button>
          </div>
          {fileName && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{fileName}</p>
          )}
        </div>
      ) : (
        /* Zona de drop */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
          }`}
        >
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Arrastra una imagen o{" "}
              <span className="text-primary underline underline-offset-2">
                selecciona archivo
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WEBP o GIF — máx. {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
