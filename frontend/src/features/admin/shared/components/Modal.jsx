import { X } from "lucide-react";

export default function Modal({ title, children, onClose, maxWidthClass = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-card border border-border rounded-lg w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
