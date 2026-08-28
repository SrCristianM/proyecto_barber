import {
  isRequired,
  validateStringLength
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de roles y permisos.
 */
export function validateRoleForm(formData) {
  const errors = {};

  // Nombre del rol (Obligatorio, máx 50)
  const reqName = isRequired(formData.nombre_rol, "El nombre del rol");
  const lenName = validateStringLength(formData.nombre_rol, 2, 50, "El nombre del rol");
  if (reqName) errors.nombre_rol = reqName;
  else if (lenName) errors.nombre_rol = lenName;

  // Descripción (Opcional, máx 255)
  if (formData.descripcion && formData.descripcion.trim() !== "") {
    const lenDesc = validateStringLength(formData.descripcion, 0, 255, "La descripción");
    if (lenDesc) errors.descripcion = lenDesc;
  }

  // Permisos (Debe tener al menos 1 permiso asignado)
  if (!formData.permisos || formData.permisos.length === 0) {
    errors.permisos = "Debes asignar al menos un permiso al rol.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
