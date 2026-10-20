export function validateSupplyForm(formData) {
  const errors = {};

  if (!formData.id_barbero || Number(formData.id_barbero) <= 0) {
    errors.id_barbero = "Debes seleccionar el barbero que recibirá los insumos.";
  }

  if (!Array.isArray(formData.detalles) || formData.detalles.length === 0) {
    errors.detalles = "Debes agregar al menos un insumo o producto para despachar.";
  } else {
    formData.detalles.forEach((item, index) => {
      if (!item.id_producto) {
        errors[`item_${index}_producto`] = "Insumo no válido.";
      }
      if (!item.cantidad || Number(item.cantidad) <= 0) {
        errors[`item_${index}_cantidad`] = "La cantidad debe ser mayor a 0.";
      }
      if (item.stockMax !== undefined && Number(item.cantidad) > Number(item.stockMax)) {
        errors[`item_${index}_cantidad`] = `La cantidad excede el stock disponible (${item.stockMax} un.).`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
