import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion } from "motion/react";

export default function Modal({ title, children, onClose, maxWidthClass = "max-w-2xl" }) {
  // Bloquear scroll de fondo mientras el modal está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className={`w-full ${maxWidthClass} bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-auto`}
      >
        <div className="max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/95 backdrop-blur-xs z-10 shrink-0">
            <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-xl transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>
          <div className="p-6 sm:p-7 overflow-y-auto">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
