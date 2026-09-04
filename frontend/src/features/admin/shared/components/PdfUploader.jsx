import { useRef, useState, useEffect } from "react";
import { FileText, Upload, X, CheckCircle2, AlertCircle, Eye, Download } from "lucide-react";

const MAX_PDF_SIZE_MB = 10;

/**
 * Componente para carga y gestión de facturas en formato PDF (Módulo de Proveedores / Compras).
 * Valida estrictamente tipo 'application/pdf', muestra metadatos (nombre, peso), y permite reemplazar o eliminar.
 */
export default function PdfUploader({
  value, // Puede ser objeto { nombre, tamano, url, fecha } o string/url
  onChange,
  label = "Factura del Proveedor (PDF)",
  required = false,
  error = null,
  className = ""
}) {
  const fileInputRef = useRef(null);
  const [fileData, setFileData] = useState(null);
  const [internalError, setInternalError] = useState("");

  useEffect(() => {
    if (!value) {
      setFileData(null);
      return;
    }
    if (typeof value === "object") {
      setFileData(value);
    } else if (typeof value === "string" && value.trim()) {
      setFileData({
        nombre: value.split("/").pop() || "Factura_Proveedor.pdf",
        tamano: "Archivo adjunto",
        url: value,
        fecha: new Date().toLocaleDateString("es-CO")
      });
    }
  }, [value]);

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación estricta de PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setInternalError("Únicamente se permiten documentos en formato PDF (.pdf).");
      return;
    }

    // Validación de peso máximo
    if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      setInternalError(`El archivo supera el límite máximo permitido de ${MAX_PDF_SIZE_MB}MB.`);
      return;
    }

    setInternalError("");

    const newFileData = {
      nombre: file.name,
      tamano: formatFileSize(file.size),
      url: URL.createObjectURL(file),
      fecha: new Date().toLocaleDateString("es-CO"),
      file: file
    };

    setFileData(newFileData);
    onChange?.(newFileData);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFileData(null);
    setInternalError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange?.(null);
  };

  const displayError = error || internalError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-medium text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          <span className="text-[11px] text-muted-foreground">Solo formato .pdf (Máx. {MAX_PDF_SIZE_MB}MB)</span>
        </div>
      )}

      {fileData ? (
        /* Tarjeta de archivo PDF ya adjuntado */
        <div className="p-3.5 rounded-2xl bg-card border border-primary/30 flex items-center justify-between gap-3 shadow-sm hover:border-primary/60 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="overflow-hidden leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate max-w-[220px] sm:max-w-[320px]">
                  {fileData.nombre}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success">
                  <CheckCircle2 className="h-2.5 w-2.5" /> PDF Cargado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {fileData.tamano} • {fileData.fecha || "Listo para guardar"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {fileData.url && (
              <a
                href={fileData.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-secondary hover:bg-accent rounded-lg text-foreground transition-colors"
                title="Visualizar PDF"
              >
                <Eye className="h-4 w-4 text-primary" />
              </a>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-secondary hover:bg-accent rounded-lg text-foreground text-xs font-semibold transition-colors cursor-pointer"
              title="Reemplazar archivo"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Eliminar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Zona de carga cuando no hay archivo seleccionado */
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            displayError
              ? "border-destructive bg-destructive/5 hover:bg-destructive/10"
              : "border-input bg-secondary/20 hover:border-primary/60 hover:bg-primary/5"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Haz clic para seleccionar la factura en <span className="text-primary font-bold">PDF</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Archivos permitidos: documentos tributarios, comprobantes o facturas electrónicas (.pdf)
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {displayError && (
        <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
