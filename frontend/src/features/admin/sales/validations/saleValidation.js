import {
  validateNumber
} from "../../../../shared/validations/commonValidators";

/**
 * Valida formulario de ventas (venta y venta_detalle).
 */
export function validateSaleForm(formData) {
  const errors = {};

  // Cliente
  if (!formData.id_cliente || Number(formData.id_cliente) <= 0) {
    errors.id_cliente = "Debes seleccionar un cliente para facturar.";
  }

  // Detalle de ítems
  if (!formData.detalles || formData.detalles.length === 0) {
    errors.detalles = "Debes agregar al menos un servicio o producto a la venta.";
  } else {
    // Validar cada fila
    const rowErrors = [];
    formData.detalles.forEach((item, index) => {
      const rowErr = {};
      if (item.tipo_item === "Servicio" && (!item.id_servicio || Number(item.id_servicio) <= 0)) {
        rowErr.id_servicio = "Servicio inválido.";
      }
      if (item.tipo_item === "Producto" && (!item.id_producto || Number(item.id_producto) <= 0)) {
        rowErr.id_producto = "Producto inválido.";
      }
      const qtyErr = validateNumber(item.cantidad, "La cantidad", {
        min: 1,
        max: 999,
        allowZero: false,
        isInteger: true,
        isMandatory: true
      });
      if (qtyErr) rowErr.cantidad = qtyErr;

      const priceErr = validateNumber(item.precio_unitario, "El precio", {
        min: 0,
        max: 99999999,
        allowZero: true,
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

  // Total
  if (formData.total !== undefined) {
    const totalErr = validateNumber(formData.total, "El total a cobrar", {
      min: 0,
      allowZero: false,
      isMandatory: true
    });
    if (totalErr && formData.detalles && formData.detalles.length > 0) {
      errors.total = totalErr;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
