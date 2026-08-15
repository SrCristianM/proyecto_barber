import { Trash2 } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function DeleteConfirmModal({ userName, onConfirm, onClose }) {
  return (
    <Modal title="Confirmar Eliminación" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <p className="text-center text-foreground">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userName}</strong>?
        </p>
        <p className="text-center text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 pt-4">
          <button onClick={onConfirm} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity">
            Eliminar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
