import { AlertTriangle, Trash2, Power } from "lucide-react";
import { motion } from "motion/react";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="gold-modal-glow w-full max-w-md"
      >
        <div className="gold-modal-inner overflow-hidden">
          {/* Header */}
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", damping: 15, stiffness: 300 }}
              className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center shadow-inner`}
            >
              <Icon className={`h-7 w-7 ${config.iconColor}`} />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-sm font-medium cursor-pointer"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg transition-all text-sm font-medium cursor-pointer shadow-sm ${config.btnClass}`}
            >
              {confirmLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
