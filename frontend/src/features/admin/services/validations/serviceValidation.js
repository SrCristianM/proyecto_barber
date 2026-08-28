import {
  isRequired,
  validateStringLength,
  validateNumber
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de servicios.
 */
export function validateServiceForm(formData) {
  const errors = {};

  // Nombre (Obligatorio, máx 120)
  const reqName = isRequired(formData.nombre, "El nombre del servicio");
  const lenName = validateStringLength(formData.nombre, 2, 120, "El nombre del servicio");
  if (reqName) errors.nombre = reqName;
  else if (lenName) errors.nombre = lenName;

  // Categoría (Obligatorio)
  if (!formData.id_categoria_servicio || Number(formData.id_categoria_servicio) <= 0) {
    errors.id_categoria_servicio = "Debes seleccionar una categoría de servicio.";
  }

  // Duración en minutos (Obligatorio, entero > 0)
  const durErr = validateNumber(formData.duracion_minutos, "La duración", {
    min: 5,
    max: 480,
    allowZero: false,
    isInteger: true,
    isMandatory: true
  });
  if (durErr) errors.duracion_minutos = durErr;

  // Precio (Obligatorio, numérico >= 0)
  const precioErr = validateNumber(formData.precio, "El precio", {
    min: 0,
    max: 99999999,
    allowZero: true,
    isInteger: false,
    isMandatory: true
  });
  if (precioErr) errors.precio = precioErr;

  // Imagen URL (Opcional, máx 255)
  if (formData.imagen_url && formData.imagen_url.trim() !== "") {
    const lenImg = validateStringLength(formData.imagen_url, 0, 255, "La imagen del servicio");
    if (lenImg) errors.imagen_url = lenImg;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida formulario de paquetes de servicios (combo y tabla puente paquete_servicio_detalle).
 */
export function validateServicePackageForm(formData) {
  const errors = {};

  // Nombre del paquete (Obligatorio, máx 120)
  const reqName = isRequired(formData.nombre, "El nombre del paquete");
  const lenName = validateStringLength(formData.nombre, 2, 120, "El nombre del paquete");
  if (reqName) errors.nombre = reqName;
  else if (lenName) errors.nombre = lenName;

  // Descuento porcentaje (0 a 100)
  const descErr = validateNumber(formData.descuento_porcentaje, "El descuento", {
    min: 0,
    max: 100,
    allowZero: true,
    isInteger: false,
    isMandatory: false
  });
  if (descErr) errors.descuento_porcentaje = descErr;

  // Servicios seleccionados (Mínimo 2 servicios)
  if (!formData.servicios_ids || formData.servicios_ids.length < 2) {
    errors.servicios_ids = "Un paquete debe componerse de al menos 2 servicios del catálogo.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
