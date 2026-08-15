import Modal from "../../shared/components/Modal";
import { barbers, paymentMethods, availableItems } from "../hooks/useSales";

export default function SaleFormModal({ mode, formData, setFormData, onToggleItem, onSubmit, onClose }) {
  const isCreate = mode === "create";

  return (
    <Modal title={isCreate ? "Registrar Nueva Venta" : "Editar Venta"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Hora</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Cliente</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder="Nombre del cliente"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Artículos/Servicios</label>
          <div className="grid grid-cols-2 gap-2 p-4 bg-input-background border border-input rounded-lg max-h-48 overflow-y-auto">
            {availableItems.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                <input type="checkbox" checked={formData.items.includes(item)} onChange={() => onToggleItem(item)} className="w-4 h-4" />
                <span className="text-sm text-foreground">{item}</span>
              </label>
            ))}
          </div>
          {isCreate && formData.items.length === 0 && (
            <p className="text-sm text-destructive mt-1">Selecciona al menos un artículo</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Barbero</label>
            <select
              value={formData.barber}
              onChange={(e) => setFormData({ ...formData, barber: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {barbers.map((barber) => (
                <option key={barber} value={barber}>
                  {barber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Método de Pago</label>
            <select
              value={formData.payment}
              onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Total ($)</label>
          <input
            type="number"
            min="0"
            value={formData.total}
            onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Notas (Opcional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            rows={2}
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isCreate && formData.items.length === 0}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Registrar Venta" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
