import { X } from "lucide-react";
import { motion } from "motion/react";

export default function Modal({ title, children, onClose, maxWidthClass = "max-w-2xl" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className={`gold-modal-glow w-full ${maxWidthClass}`}
      >
        <div className="gold-modal-inner max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card/95 backdrop-blur-xs z-10">
            <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-xl transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="p-6 sm:p-7">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
