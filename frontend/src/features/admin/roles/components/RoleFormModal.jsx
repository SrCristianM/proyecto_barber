import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import Modal from "../../shared/components/Modal";
import FormFieldError from "../../shared/components/FormFieldError";
import { validateRoleForm } from "../validations/roleValidation";

/**
 * Módulos del sistema con sus acciones disponibles.
 * Basado en la estructura real de la BD (tabla modulos + permisos).
 */
const SYSTEM_MODULES = [
  {
    id: "usuarios",
    label: "Usuarios",
    acciones: [
      { key: "usuarios_ver", label: "Ver" },
      { key: "usuarios_crear", label: "Crear" },
      { key: "usuarios_editar", label: "Editar" },
      { key: "usuarios_eliminar", label: "Eliminar" },
      { key: "usuarios_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "roles",
    label: "Roles y Permisos",
    acciones: [
      { key: "roles_ver", label: "Ver" },
      { key: "roles_crear", label: "Crear" },
      { key: "roles_editar", label: "Editar" },
      { key: "roles_eliminar", label: "Eliminar" },
      { key: "roles_asignar", label: "Asignar Roles" }
    ]
  },
  {
    id: "citas",
    label: "Citas",
    acciones: [
      { key: "citas_ver", label: "Ver" },
      { key: "citas_crear", label: "Crear" },
      { key: "citas_editar", label: "Editar" },
      { key: "citas_cancelar", label: "Cancelar" }
    ]
  },
  {
    id: "servicios",
    label: "Servicios",
    acciones: [
      { key: "servicios_ver", label: "Ver" },
      { key: "servicios_crear", label: "Crear" },
      { key: "servicios_editar", label: "Editar" },
      { key: "servicios_eliminar", label: "Eliminar" },
      { key: "servicios_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "productos",
    label: "Productos",
    acciones: [
      { key: "productos_ver", label: "Ver" },
      { key: "productos_crear", label: "Crear" },
      { key: "productos_editar", label: "Editar" },
      { key: "productos_eliminar", label: "Eliminar" },
      { key: "productos_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "ventas",
    label: "Ventas",
    acciones: [
      { key: "ventas_ver", label: "Ver" },
      { key: "ventas_crear", label: "Crear" },
      { key: "ventas_editar", label: "Editar" },
      { key: "ventas_anular", label: "Anular" }
    ]
  },
  {
    id: "horarios",
    label: "Horarios",
    acciones: [
      { key: "horarios_ver", label: "Ver" },
      { key: "horarios_crear", label: "Crear" },
      { key: "horarios_editar", label: "Editar" },
      { key: "horarios_eliminar", label: "Eliminar" },
      { key: "horarios_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "clientes",
    label: "Clientes",
    acciones: [
      { key: "clientes_ver", label: "Ver" },
      { key: "clientes_crear", label: "Crear" },
      { key: "clientes_editar", label: "Editar" },
      { key: "clientes_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "proveedores",
    label: "Proveedores",
    acciones: [
      { key: "proveedores_ver", label: "Ver" },
      { key: "proveedores_crear", label: "Crear" },
      { key: "proveedores_editar", label: "Editar" },
      { key: "proveedores_eliminar", label: "Eliminar" },
      { key: "proveedores_activar", label: "Activar / Desactivar" }
    ]
  },
  {
    id: "compras",
    label: "Compras",
    acciones: [
      { key: "compras_ver", label: "Ver" },
      { key: "compras_crear", label: "Crear" },
      { key: "compras_editar", label: "Editar" },
      { key: "compras_anular", label: "Anular" },
      { key: "compras_eliminar", label: "Eliminar" }
    ]
  }
];

export default function RoleFormModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose
}) {
  const [errors, setErrors] = useState({});
  const isCreate = mode === "create";
  const permisos = formData.permisos || [];

  const allKeys = SYSTEM_MODULES.flatMap((m) => m.acciones.map((a) => a.key));
  const allSelected = allKeys.every((k) => permisos.includes(k));

  const togglePermission = (key) => {
    const next = permisos.includes(key)
      ? permisos.filter((p) => p !== key)
      : [...permisos, key];
    setFormData({ ...formData, permisos: next });
    if (errors.permisos) setErrors((prev) => ({ ...prev, permisos: null }));
  };

  const toggleModule = (module) => {
    const moduleKeys = module.acciones.map((a) => a.key);
    const allModuleSelected = moduleKeys.every((k) => permisos.includes(k));
    let next;
    if (allModuleSelected) {
      next = permisos.filter((p) => !moduleKeys.includes(p));
    } else {
      next = [...new Set([...permisos, ...moduleKeys])];
    }
    setFormData({ ...formData, permisos: next });
    if (errors.permisos) setErrors((prev) => ({ ...prev, permisos: null }));
  };

  const toggleAll = () => {
    if (allSelected) {
      setFormData({ ...formData, permisos: [] });
    } else {
      setFormData({ ...formData, permisos: [...allKeys] });
      if (errors.permisos) setErrors((prev) => ({ ...prev, permisos: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateRoleForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  return (
    <Modal
      title={isCreate ? "Crear Nuevo Rol" : "Editar Rol"}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del Rol <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            name="nombre_rol"
            id="nombre_rol"
            maxLength={50}
            value={formData.nombre_rol}
            onChange={(e) => {
              setFormData({ ...formData, nombre_rol: e.target.value });
              if (errors.nombre_rol) setErrors((prev) => ({ ...prev, nombre_rol: null }));
            }}
            className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.nombre_rol
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
            placeholder="Ej: Administrador"
            autoFocus
          />
          <FormFieldError error={errors.nombre_rol} />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
          <textarea
            name="descripcion"
            id="descripcion"
            maxLength={255}
            value={formData.descripcion}
            onChange={(e) => {
              setFormData({ ...formData, descripcion: e.target.value });
              if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: null }));
            }}
            className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
              errors.descripcion
                ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                : "border-input focus:ring-2 focus:ring-primary"
            }`}
            rows="2"
            placeholder="Descripción y responsabilidades del rol"
          />
          <FormFieldError error={errors.descripcion} />
        </div>

        {/* Permisos por módulo */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              Permisos por módulo <span className="text-destructive">*</span>
            </label>
            {/* Seleccionar todo global */}
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>
          <FormFieldError error={errors.permisos} />

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {SYSTEM_MODULES.map((module) => {
              const moduleKeys = module.acciones.map((a) => a.key);
              const selectedCount = moduleKeys.filter((k) => permisos.includes(k)).length;
              const allModuleSelected = selectedCount === moduleKeys.length;
              const someSelected = selectedCount > 0 && !allModuleSelected;

              return (
                <div
                  key={module.id}
                  className="bg-background border border-border rounded-lg overflow-hidden"
                >
                  {/* Header del módulo */}
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">{module.label}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={allModuleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={() => toggleModule(module)}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Seleccionar todo
                      </span>
                    </label>
                  </div>

                  {/* Acciones del módulo */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 px-3 py-2.5">
                    {module.acciones.map((accion) => (
                      <label
                        key={accion.key}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={permisos.includes(accion.key)}
                          onChange={() => togglePermission(accion.key)}
                          className="w-3.5 h-3.5 rounded border-input text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                          {accion.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contador de permisos */}
          <p className="text-xs text-muted-foreground mt-2">
            {permisos.length} de {allKeys.length} permisos seleccionados
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            {isCreate ? "Crear Rol" : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-foreground font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
