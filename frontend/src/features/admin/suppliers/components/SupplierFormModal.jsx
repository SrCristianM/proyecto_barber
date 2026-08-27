import Modal from "../../shared/components/Modal";

export default function SupplierFormModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose
}) {
  const isCreate = mode === "create";

  return (
    <Modal
      title={isCreate ? "Nuevo Proveedor" : "Editar Proveedor"}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre / Razón Social <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Ej: Distribuidora Barber Pro"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              autoFocus
            />
          </div>

          {/* NIT / Identificación */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              NIT / Documento de Identidad
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder="Ej: 901234567-1"
              value={formData.nit || ""}
              onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
            <select
              value={formData.estado !== undefined ? formData.estado : 1}
              onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value={1}>Activo (Disponible para compras)</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
            <input
              type="text"
              maxLength={20}
              placeholder="+57 300 000 0000"
              value={formData.telefono || ""}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              maxLength={120}
              placeholder="proveedor@empresa.com"
              value={formData.correo || ""}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Dirección de Sede / Despacho</label>
            <input
              type="text"
              maxLength={255}
              placeholder="Ej: Carrera 43A # 18-50, Medellín"
              value={formData.direccion || ""}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            {isCreate ? "Guardar Proveedor" : "Actualizar Proveedor"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
