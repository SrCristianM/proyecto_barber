import {
  validateNumber
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de orden de compra a proveedor.
 */
export function validatePurchaseForm(formData) {
  const errors = {};

  // Proveedor
  if (!formData.id_proveedor || Number(formData.id_proveedor) <= 0) {
    errors.id_proveedor = "Debes seleccionar un proveedor válido.";
  }

  // Detalle de productos (detalle_compra)
  if (!formData.detalles || formData.detalles.length === 0) {
    errors.detalles = "Debes agregar al menos un producto a la compra.";
  } else {
    // Validar cada fila
    const rowErrors = [];
    formData.detalles.forEach((item, index) => {
      const rowErr = {};
      if (!item.id_producto || Number(item.id_producto) <= 0) {
        rowErr.id_producto = "Selecciona un producto válido.";
      }
      const qtyErr = validateNumber(item.cantidad, "La cantidad", {
        min: 1,
        max: 99999,
        allowZero: false,
        isInteger: true,
        isMandatory: true
      });
      if (qtyErr) rowErr.cantidad = qtyErr;

      const priceErr = validateNumber(item.precio_unitario, "El costo unitario", {
        min: 0,
        max: 99999999,
        allowZero: false,
        isInteger: false,
        isMandatory: true
      });
      if (priceErr) rowErr.precio_unitario = priceErr;

      if (Object.keys(rowErr).length > 0) {
        rowErrors.push({ index, errors: rowErr });
      }
    });

    if (rowErrors.length > 0) {
      errors.filasDetalle = rowErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
