import Modal from "../../shared/components/Modal";
import { clients, users, saleStatuses, catalogItems } from "../hooks/useSales";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cliente</label>
            <select
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {clients.map((client) => (
                <option key={client.id_cliente} value={client.id_cliente}>
                  {client.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Usuario Responsable</label>
            <select
              value={formData.id_usuario}
              onChange={(e) => setFormData({ ...formData, id_usuario: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {users.map((user) => (
                <option key={user.id_usuario} value={user.id_usuario}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Estado de la Venta</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {saleStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Detalle de Venta (Servicios y Productos)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-input-background border border-input rounded-lg max-h-48 overflow-y-auto">
            {catalogItems.map((item) => {
              const isChecked = formData.selectedItemIds.includes(item.id_item);
              return (
                <label
                  key={item.id_item}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    isChecked ? "bg-primary/10 border border-primary/30" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleItem(item)}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground block">{item.nombre}</span>
                      <span className="text-[11px] text-muted-foreground uppercase">{item.tipo_item}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    ${Number(item.precio_unitario).toLocaleString()}
                  </span>
                </label>
              );
            })}
          </div>
          {isCreate && formData.detalles.length === 0 && (
            <p className="text-sm text-destructive mt-1">Selecciona al menos un artículo o servicio</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Total ($)</label>
          <input
            type="number"
            min="0"
            value={formData.total}
            onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-semibold text-lg"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={formData.detalles.length === 0}
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
