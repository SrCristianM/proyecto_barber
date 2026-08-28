import {
  isRequired,
  validateStringLength,
  validateNumber
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de productos.
 */
export function validateProductForm(formData) {
  const errors = {};

  // Nombre (Obligatorio, máx 120)
  const reqName = isRequired(formData.nombre, "El nombre del producto");
  const lenName = validateStringLength(formData.nombre, 2, 120, "El nombre del producto");
  if (reqName) errors.nombre = reqName;
  else if (lenName) errors.nombre = lenName;

  // Categoría (Obligatorio)
  if (!formData.id_categoria_producto || Number(formData.id_categoria_producto) <= 0) {
    errors.id_categoria_producto = "Debes seleccionar una categoría de producto.";
  }

  // Stock (Obligatorio, entero, >= 0)
  const stockErr = validateNumber(formData.stock, "El stock", {
    min: 0,
    max: 999999,
    allowZero: true,
    isInteger: true,
    isMandatory: true
  });
  if (stockErr) errors.stock = stockErr;

  // Precio (Obligatorio, numérico, >= 0)
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
    const lenImg = validateStringLength(formData.imagen_url, 0, 255, "La imagen del producto");
    if (lenImg) errors.imagen_url = lenImg;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
