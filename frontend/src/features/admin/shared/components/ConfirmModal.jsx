import { AlertTriangle, Trash2, Power } from "lucide-react";

/**
 * Modal de confirmación reutilizable para acciones críticas.
 * Soporta variantes: "delete" y "deactivate".
 *
 * @param {string} title - Título del modal
 * @param {string} description - Descripción / mensaje de advertencia
 * @param {string} confirmLabel - Texto del botón de confirmación
 * @param {Function} onConfirm - Callback al confirmar
 * @param {Function} onClose - Callback al cancelar
 * @param {"delete"|"deactivate"|"warning"} variant - Variante visual
 */
export default function ConfirmModal({
  title = "¿Confirmar acción?",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Confirmar",
  onConfirm,
  onClose,
  variant = "delete"
}) {
  const variantConfig = {
    delete: {
      icon: Trash2,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      btnClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    },
    deactivate: {
      icon: Power,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      btnClass: "bg-warning text-warning-foreground hover:bg-warning/90"
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      btnClass: "bg-primary text-primary-foreground hover:opacity-90"
    }
  };

  const config = variantConfig[variant] || variantConfig.delete;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${config.iconColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${config.btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
