/**
 * @file pdfInvoiceGenerator.js
 * Generador y descargador de facturas en formato PDF para compras y proveedores.
 * Construye documentos PDF 1.4 nativos, limpios y compatibles con cualquier visor PDF sin requerir librerías pesadas.
 */

// Helper para escapar strings en sintaxis PDF
function escapePdf(str) {
  return String(str || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Genera un Blob PDF nativo (especificación PDF 1.4) para una compra / factura de proveedor.
 */
export function generatePurchaseInvoiceBlob(purchase, supplier = {}, user = {}) {
  const invoiceNumber = purchase?.id_compra || "0";
  const date = purchase?.fecha || new Date().toLocaleString("es-CO");
  const status = purchase?.estado || "Registrada";
  const total = purchase?.total || 0;
  const supplierName = supplier?.nombre || "Proveedor General";
  const supplierNit = supplier?.nit || "Sin NIT registrado";
  const userName = user?.nombre || "Administrador del Sistema";
  const items = purchase?.detalles || [];

  // Construcción del contenido gráfico del PDF (PostScript commands)
  let streamText = `
% Franja de cabecera oscura
0.10 0.10 0.12 rg
0 710 612 82 re f

% Acento dorado en la cabecera
0.79 0.64 0.29 rg
50 745 m 562 745 l S

BT
/F2 17 Tf
1 1 1 rg
50 752 Td
(TU TURNO BARBER - FACTURA DE COMPRA) Tj
ET

BT
/F1 10 Tf
0.82 0.82 0.84 rg
50 730 Td
(Sistema ERP - Comprobante de Adquisicion de Inventario) Tj
ET

BT
/F2 12 Tf
0.79 0.64 0.29 rg
410 752 Td
(COMPRA #${escapePdf(invoiceNumber)}) Tj
ET

BT
/F1 9 Tf
1 1 1 rg
410 730 Td
(Estado: ${escapePdf(status)}  |  ${escapePdf(date)}) Tj
ET

% Recuadro de Metadatos de Proveedor y Registro
0.96 0.96 0.98 rg
50 610 512 85 re f
0.84 0.85 0.88 RG
1 w
50 610 512 85 re s

BT
/F2 10 Tf
0.12 0.12 0.14 rg
65 675 Td
(DATOS DEL PROVEEDOR Y REGISTRO) Tj
ET

BT
/F1 9 Tf
0.25 0.25 0.28 rg
65 657 Td
(Proveedor / Razon Social: ${escapePdf(supplierName)}) Tj
65 642 Td
(NIT / Identificacion: ${escapePdf(supplierNit)}) Tj
65 627 Td
(Registrado en el ERP por: ${escapePdf(userName)}) Tj
ET

BT
/F1 9 Tf
0.25 0.25 0.28 rg
360 657 Td
(Fecha Comprobante: ${escapePdf(date)}) Tj
360 642 Td
(Moneda: COP - Pesos Colombianos) Tj
360 627 Td
(Estado en Sistema: ${escapePdf(status)}) Tj
ET

% Encabezado de la tabla de productos
0.14 0.14 0.17 rg
50 568 512 24 re f

BT
/F2 9 Tf
1 1 1 rg
60 576 Td
(ITEM / PRODUCTO) Tj
310 576 Td
(CANTIDAD) Tj
380 576 Td
(PRECIO UNIT.) Tj
475 576 Td
(SUBTOTAL) Tj
ET
`;

  // Filas de productos
  let currentY = 544;
  items.forEach((item, index) => {
    const prodName = item.nombre || item.nombre_producto || "Insumo de barbería";
    const qty = item.cantidad || 1;
    const price = Number(item.precio_unitario || 0);
    const subtotal = Number(item.subtotal || price * qty);

    if (index % 2 === 0) {
      streamText += `
0.98 0.98 0.99 rg
50 ${currentY - 6} 512 20 re f
`;
    }
    streamText += `
0.88 0.88 0.91 RG
0.5 w
50 ${currentY - 6} 512 20 re s

BT
/F1 9 Tf
0.15 0.15 0.18 rg
60 ${currentY} Td
(${escapePdf(prodName)}) Tj
320 ${currentY} Td
(${escapePdf(qty)} uds.) Tj
385 ${currentY} Td
($ ${price.toLocaleString("es-CO")}) Tj
480 ${currentY} Td
($ ${subtotal.toLocaleString("es-CO")}) Tj
ET
`;
    currentY -= 22;
  });

  // Si no hubo items, renderizar fila vacía
  if (items.length === 0) {
    streamText += `
BT
/F1 9 Tf
0.5 0.5 0.5 rg
60 ${currentY} Td
(Sin detalle de productos registrado) Tj
ET
`;
    currentY -= 22;
  }

  // Recuadro de Total General
  currentY -= 12;
  streamText += `
0.10 0.10 0.12 rg
340 ${currentY - 8} 222 32 re f
0.79 0.64 0.29 RG
1 w
340 ${currentY - 8} 222 32 re s

BT
/F2 10 Tf
1 1 1 rg
355 ${currentY + 4} Td
(TOTAL COMPRA:) Tj
/F2 12 Tf
0.79 0.64 0.29 rg
450 ${currentY + 4} Td
($ ${Number(total).toLocaleString("es-CO")}) Tj
ET

% Nota legal inferior
BT
/F1 8 Tf
0.52 0.52 0.56 rg
50 45 Td
(Documento generado por Tu Turno Barber ERP. Soporte interno de compras e ingreso a inventario de productos.) Tj
50 33 Td
(Valido para contabilidad y control de proveedores.) Tj
ET
`;

  // Codificación UTF-8 para calcular longitud exacta
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamText);
  const streamLength = streamBytes.length;

  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj6 = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj\n`;

  const objList = [obj1, obj2, obj3, obj4, obj5, obj6];

  const headerStr = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  let bodyStr = "";
  const xrefOffsets = [0];

  let currentOffset = encoder.encode(headerStr).length;

  for (let i = 0; i < objList.length; i++) {
    xrefOffsets.push(currentOffset);
    bodyStr += objList[i];
    currentOffset += encoder.encode(objList[i]).length;
  }

  const startxref = currentOffset;
  let xrefStr = `xref\n0 ${objList.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objList.length; i++) {
    const offsetStr = String(xrefOffsets[i]).padStart(10, "0");
    xrefStr += `${offsetStr} 00000 n \n`;
  }

  const trailerStr = `trailer\n<< /Size ${objList.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const totalContent = headerStr + bodyStr + xrefStr + trailerStr;
  const pdfBytes = encoder.encode(totalContent);

  const cleanSupplier = (supplierName || "Proveedor").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Factura_Compra_#${invoiceNumber}_${cleanSupplier}.pdf`;

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return { blob, filename };
}

/**
 * Descarga directamente la factura en PDF.
 * Si la compra posee un archivo adjunto previamente subido por el usuario, descarga dicho archivo;
 * de lo contrario, genera el PDF nativo oficial de inmediato.
 */
export function downloadPurchaseInvoicePDF(purchase, supplier = {}, user = {}) {
  if (!purchase) return;

  // Si tiene archivo PDF ya adjunto
  if (purchase.factura_pdf?.url) {
    const link = document.createElement("a");
    link.href = purchase.factura_pdf.url;
    link.download = purchase.factura_pdf.nombre || `Factura_Compra_#${purchase.id_compra}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generación nativa inmediata
  const { blob, filename } = generatePurchaseInvoiceBlob(purchase, supplier, user);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Genera un Blob PDF nativo para un comprobante de venta o compra del cliente.
 */
export function generateSaleReceiptBlob(sale, client = {}) {
  const invoiceNumber = sale?.id_venta || "0";
  const date = sale?.fecha || new Date().toLocaleString("es-CO");
  const status = sale?.estado || "Activa";
  const total = sale?.total || 0;
  const clientName = `${client?.nombre || "Cliente"} ${client?.apellido || ""}`.trim();
  const clientEmail = client?.correo || "";
  const items = sale?.detalles || [];

  let streamText = `
0.10 0.10 0.12 rg
0 710 612 82 re f

0.79 0.64 0.29 rg
50 745 m 562 745 l S

BT
/F2 17 Tf
1 1 1 rg
50 752 Td
(TU TURNO BARBER - COMPROBANTE DE COMPRA) Tj
ET

BT
/F1 10 Tf
0.82 0.82 0.84 rg
50 730 Td
(Facturacion Oficial de Barberia y Estilo) Tj
ET

BT
/F2 12 Tf
0.79 0.64 0.29 rg
410 752 Td
(RECIBO #${escapePdf(invoiceNumber)}) Tj
ET

BT
/F1 9 Tf
0.82 0.82 0.84 rg
410 730 Td
(Estado: ${escapePdf(status)}) Tj
ET

0.96 0.96 0.97 rg
50 620 512 70 re f
0.85 0.85 0.87 RG
50 620 512 70 re S

BT
/F2 10 Tf
0.2 0.2 0.2 rg
65 670 Td
(DATOS DEL CLIENTE) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
65 654 Td
(Cliente: ${escapePdf(clientName)}) Tj
65 640 Td
(Correo: ${escapePdf(clientEmail)}) Tj
ET

BT
/F2 10 Tf
0.2 0.2 0.2 rg
340 670 Td
(DETALLES DE LA OPERACION) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
340 654 Td
(Fecha de Emision: ${escapePdf(date)}) Tj
340 640 Td
(Metodo: Pago en Establecimiento) Tj
ET

0.15 0.15 0.18 rg
50 580 512 24 re f

BT
/F2 9 Tf
1 1 1 rg
60 588 Td
(ITEM / ARTICULO FACTURADO) Tj
310 588 Td
(CANT) Tj
370 588 Td
(PRECIO UNIT.) Tj
480 588 Td
(SUBTOTAL) Tj
ET
`;

  let currentY = 556;
  for (let i = 0; i < items.length; i++) {
    const itm = items[i];
    const name = escapePdf(itm.nombre || `Articulo ${i + 1}`);
    const qty = String(itm.cantidad || 1);
    const unitPrice = `$${Number(itm.precio_unitario || 0).toLocaleString("es-CO")}`;
    const subtotal = `$${Number(itm.subtotal || 0).toLocaleString("es-CO")}`;

    if (i % 2 === 1) {
      streamText += `\n0.97 0.97 0.98 rg\n50 ${currentY - 5} 512 20 re f\n`;
    }

    streamText += `
BT
/F1 9 Tf
0.2 0.2 0.2 rg
60 ${currentY} Td
(${name.substring(0, 36)}) Tj
318 ${currentY} Td
(${qty}) Tj
370 ${currentY} Td
(${unitPrice}) Tj
480 ${currentY} Td
(${subtotal}) Tj
ET
`;
    currentY -= 20;
    if (currentY < 180) break;
  }

  streamText += `
0.8 0.8 0.8 RG
50 ${currentY + 6} m 562 ${currentY + 6} l S

0.79 0.64 0.29 rg
350 ${currentY - 35} 212 32 re f

BT
/F2 12 Tf
0 0 0 rg
365 ${currentY - 23} Td
(TOTAL PAGADO:) Tj
ET

BT
/F2 12 Tf
0 0 0 rg
465 ${currentY - 23} Td
($${escapePdf(Number(total).toLocaleString("es-CO"))}) Tj
ET

BT
/F1 8 Tf
0.5 0.5 0.5 rg
50 60 Td
(Tu Turno Barber ERP - Comprobante digital valido como constancia de servicio y compra.) Tj
50 48 Td
(Gracias por preferir nuestros servicios profesionales de barberia.) Tj
ET
`;

  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamText);
  const streamLength = streamBytes.length;

  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj6 = `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj\n`;

  const objList = [obj1, obj2, obj3, obj4, obj5, obj6];
  const headerStr = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  let bodyStr = "";
  const xrefOffsets = [0];
  let currentOffset = encoder.encode(headerStr).length;

  for (let i = 0; i < objList.length; i++) {
    xrefOffsets.push(currentOffset);
    bodyStr += objList[i];
    currentOffset += encoder.encode(objList[i]).length;
  }

  const startxref = currentOffset;
  let xrefStr = `xref\n0 ${objList.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objList.length; i++) {
    const offsetStr = String(xrefOffsets[i]).padStart(10, "0");
    xrefStr += `${offsetStr} 00000 n \n`;
  }

  const trailerStr = `trailer\n<< /Size ${objList.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  const totalContent = headerStr + bodyStr + xrefStr + trailerStr;
  const pdfBytes = encoder.encode(totalContent);

  const filename = `Comprobante_Compra_#${invoiceNumber}.pdf`;
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return { blob, filename };
}

/**
 * Descarga directamente el comprobante de compra / recibo en formato PDF.
 */
export function downloadClientSaleReceiptPDF(sale, client = {}) {
  if (!sale) return;
  const { blob, filename } = generateSaleReceiptBlob(sale, client);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
