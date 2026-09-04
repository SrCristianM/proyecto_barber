import Modal from "../../shared/components/Modal";
import { useState } from "react";
import { availableLoyalties } from "../hooks/useClients";

export default function CreateClientModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    nivel_fidelidad: "Nuevo"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nombre: "", apellido: "", correo: "", telefono: "", direccion: "", nivel_fidelidad: "Nuevo" });
  };

  if (!isOpen) return null;

  return (
    <Modal title="Crear Nuevo Cliente" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Pedro"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Ej: López"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="Ej: pedro@example.com"
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
          <input
            type="tel"
            inputMode="numeric"
            name="telefono"
            maxLength={15}
            value={formData.telefono}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
              if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 15);
              setFormData((prev) => ({ ...prev, telefono: onlyNums }));
            }}
            placeholder="Ej: 3001234567"
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ej: Calle 10 # 5-20"
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nivel de Fidelidad</label>
          <select
            name="nivel_fidelidad"
            value={formData.nivel_fidelidad}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {availableLoyalties.map((loyalty) => (
              <option key={loyalty} value={loyalty}>
                {loyalty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Crear Cliente
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-background border border-border text-foreground font-semibold rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
