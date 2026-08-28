import { ShoppingBag, Plus, Trash2, UserCheck, Calendar } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { clients, users, saleStatuses, catalogItems } from "../hooks/useSales";

export default function SaleFormModal({
  mode,
  formData,
  setFormData,
  onAddItem,
  onUpdateItemQuantity,
  onRemoveItem,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";
  const currentUser = users.find((u) => u.id_usuario === Number(formData.id_usuario)) || users[0];

  return (
    <Modal
      title={isCreate ? "Registrar Nueva Venta" : "Editar Venta"}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (formData.detalles.length === 0) return;
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Cabecera de la Venta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cliente <span className="text-destructive">*</span>
            </label>
            <select
              name="id_cliente"
              id="id_cliente"
              value={formData.id_cliente}
              onChange={(e) => setFormData({ ...formData, id_cliente: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              required
            >
              {clients.map((client) => (
                <option key={client.id_cliente} value={client.id_cliente}>
                  {client.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario / Cajero (Contexto de Sesión) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cajero / Responsable <span className="text-xs text-muted-foreground font-normal">(Sesión Activa)</span>
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-foreground text-sm font-medium">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>{currentUser?.nombre || "Usuario en Turno"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cita de Origen (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Origen de la Venta <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
            </label>
            <select
              name="id_cita"
              id="id_cita"
              value={formData.id_cita || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  id_cita: e.target.value ? Number(e.target.value) : null
                })
              }
              className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="">Venta Directa en Mostrador</option>
              <option value="1">Cita #1 — Servicio Juan Pérez</option>
              <option value="2">Cita #2 — Servicio María García</option>
              <option value="3">Cita #3 — Servicio Pedro López</option>
            </select>
          </div>

          {/* Estado de la Venta */}
          {!isCreate ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Estado de la Venta
              </label>
              <select
                name="estado"
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              >
                {saleStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha / Hora <span className="text-xs text-muted-foreground font-normal">(Automática de Sistema)</span>
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-secondary/40 border border-border/80 rounded-xl text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Fecha y hora de registro al confirmar</span>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Detalle de Venta (venta_detalle) */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Líneas de Facturación (Productos y Servicios)
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecciona artículos del catálogo y ajusta cantidades para facturar
              </p>
            </div>
          </div>

          {/* Catálogo rápido para agregar */}
          <div className="p-3 bg-secondary/30 border border-border/70 rounded-xl mb-3.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Agregar al detalle:
            </span>
            <div className="flex flex-wrap gap-2">
              {catalogItems.map((item) => (
                <button
                  key={item.id_item}
                  type="button"
                  onClick={() => onAddItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-primary/10 hover:border-primary/40 border border-border rounded-lg text-xs font-medium text-foreground transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  <span>{item.nombre}</span>
                  <span className="text-[11px] font-semibold text-primary">
                    ${Number(item.precio_unitario).toLocaleString("es-CO")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Detalle (venta_detalle) */}
          {formData.detalles.length === 0 ? (
            <div className="p-4 border border-dashed border-destructive/40 rounded-xl bg-destructive/5 text-destructive text-xs text-center font-medium">
              Agrega al menos un servicio o producto para registrar la venta.
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="text-left py-2.5 px-3">Tipo</th>
                    <th className="text-left py-2.5 px-3">Ítem / Concepto</th>
                    <th className="text-center py-2.5 px-3 w-24">Cantidad</th>
                    <th className="text-right py-2.5 px-3 w-28">Precio Unit.</th>
                    <th className="text-right py-2.5 px-3 w-28">Subtotal</th>
                    <th className="text-center py-2.5 px-2 w-12">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {formData.detalles.map((item, idx) => (
                    <tr key={idx} className="hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.tipo_item === "Servicio"
                              ? "bg-primary/10 text-primary"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {item.tipo_item}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{item.nombre}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad || 1}
                          onChange={(e) =>
                            onUpdateItemQuantity(idx, Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-full px-2 py-1 bg-input-background border border-input rounded-md text-foreground text-xs text-center font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        ${Number(item.precio_unitario).toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground">
                        ${Number(item.subtotal).toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                          title="Quitar ítem"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary/40 border-t border-border">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right font-bold text-foreground text-sm">
                      Total a Cobrar:
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-primary text-base">
                      ${Number(formData.total).toLocaleString("es-CO")}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={formData.detalles.length === 0}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreate ? "Confirmar y Facturar Venta" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
