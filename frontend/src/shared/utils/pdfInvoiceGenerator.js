/**
 * @file pdfInvoiceGenerator.js
 * Generador y descargador de facturas y comprobantes oficiales en formato PDF nativo (PDF 1.4).
 * Diseñado con tipografía calibrada, coordenadas absolutas (sin traslación relativa errónea)
 * y diseño institucional premium acorde a la identidad de Tu Turno Barber.
 */

// Helper para limpiar y sanitizar cadenas para PDF estándar Helvetica (Type 1)
function sanitizeForPdf(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes y diacríticos para evitar caracteres corruptos
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

// Operador de texto con posición absoluta garantizada mediante matriz 'Tm'
function drawText(font, size, r, g, b, x, y, text) {
  const safeText = sanitizeForPdf(text);
  return `BT\n/${font} ${size} Tf\n${r} ${g} ${b} rg\n1 0 0 1 ${x} ${y} Tm\n(${safeText}) Tj\nET\n`;
}

// Operador de trazado de rectángulos
function drawRect(r, g, b, x, y, w, h, fill = true, stroke = false, strokeR = 0, strokeG = 0, strokeB = 0, lineWidth = 1) {
  let res = "";
  if (fill) {
    res += `${r} ${g} ${b} rg\n${x} ${y} ${w} ${h} re f\n`;
  }
  if (stroke) {
    res += `${strokeR} ${strokeG} ${strokeB} RG\n${lineWidth} w\n${x} ${y} ${w} ${h} re s\n`;
  }
  return res;
}

// Operador de trazado de líneas
function drawLine(r, g, b, x1, y1, x2, y2, lineWidth = 1) {
  return `${r} ${g} ${b} RG\n${lineWidth} w\n${x1} ${y1} m ${x2} ${y2} l S\n`;
}

/**
 * Empaqueta un flujo de comandos PostScript en un archivo PDF 1.4 binario válido.
 */
function buildPdfDocument(streamText) {
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
  return encoder.encode(totalContent);
}

/**
 * Genera un Blob PDF nativo (especificación PDF 1.4) para una orden / factura de compra a proveedor.
 */
export function generatePurchaseInvoiceBlob(purchase, supplier = {}, user = {}) {
  const invoiceRawId = purchase?.id_compra || "1";
  const invoiceNumber = String(invoiceRawId).padStart(5, "0");
  const dateStr = purchase?.fecha || new Date().toISOString().replace("T", " ").substring(0, 19);
  const status = purchase?.estado || "Registrada";
  const total = Number(purchase?.total || 0);

  const supplierName = supplier?.nombre || "Distribuidora Barber Pro Colombia";
  const supplierNit = supplier?.nit || "901.234.567-1";
  const supplierPhone = supplier?.telefono || "+57 (601) 745-8920";
  const supplierEmail = supplier?.correo || "contacto@proveedor.com";
  const supplierAddress = supplier?.direccion || "Cra. 15 # 85-32, Zona Rosa";
  const supplierCity = supplier?.ciudad || "Bogota D.C.";

  const userName = user?.nombre || "Administrador Principal";
  const items = purchase?.detalles || [];

  let stream = "";

  // 1. BANNER DE CABECERA INSTITUCIONAL (Y = 705 to 772)
  // Fondo oscuro slate/carbón
  stream += drawRect(0.06, 0.09, 0.16, 40, 705, 532, 67, true);
  // Franja superior de acento dorado
  stream += drawRect(0.85, 0.65, 0.18, 40, 768, 532, 4, true);

  // Textos Izquierda de Cabecera
  stream += drawText("F2", 15, 0.92, 0.72, 0.22, 55, 743, "TU TURNO BARBER");
  stream += drawText("F2", 8.5, 1, 1, 1, 55, 729, "COMPROBANTE OFICIAL DE COMPRA - ENTRADA DE ALMACEN");
  stream += drawText("F1", 7.5, 0.72, 0.76, 0.82, 55, 716, "Sistema ERP de Gestion y Abastecimiento de Inventario");

  // Recuadro derecho Badge de Orden de Compra (X = 415, Y = 712, W = 145, H = 50)
  stream += drawRect(0.12, 0.16, 0.25, 415, 712, 145, 50, true, true, 0.85, 0.65, 0.18, 1);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 425, 747, "ORDEN DE COMPRA");
  stream += drawText("F2", 13, 1, 1, 1, 425, 731, `OC-${invoiceNumber}`);
  const isAnulada = status.toLowerCase().includes("anul");
  if (isAnulada) {
    stream += drawText("F2", 7.5, 0.95, 0.35, 0.35, 425, 718, "ESTADO: ANULADA");
  } else {
    stream += drawText("F2", 7.5, 0.2, 0.85, 0.45, 425, 718, "ESTADO: REGISTRADA");
  }

  // 2. TARJETAS DUALES DE METADATOS (Y = 595 to 695, Altura = 100)
  // Tarjeta Izquierda: Proveedor (X = 40, W = 258)
  stream += drawRect(0.97, 0.98, 0.99, 40, 595, 258, 100, true, true, 0.86, 0.89, 0.93, 1);
  // Barra de título del proveedor
  stream += drawRect(0.1, 0.14, 0.22, 40, 675, 258, 20, true);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 48, 681, "DATOS DEL PROVEEDOR (EMISOR)");
  stream += drawText("F2", 8.5, 0.12, 0.14, 0.18, 48, 658, `Razon Social: ${supplierName.substring(0, 32)}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 48, 644, `NIT / RUT: ${supplierNit}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 48, 630, `Telefono: ${supplierPhone}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 48, 616, `Correo: ${supplierEmail}`);
  stream += drawText("F1", 7.5, 0.3, 0.34, 0.4, 48, 603, `Direccion: ${supplierAddress} (${supplierCity})`);

  // Tarjeta Derecha: Barbería / Receptor (X = 314, W = 258)
  stream += drawRect(0.97, 0.98, 0.99, 314, 595, 258, 100, true, true, 0.86, 0.89, 0.93, 1);
  // Barra de título de la barbería
  stream += drawRect(0.1, 0.14, 0.22, 314, 675, 258, 20, true);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 322, 681, "BARBERIA / RECEPTOR DEL PEDIDO");
  stream += drawText("F2", 8.5, 0.12, 0.14, 0.18, 322, 658, "Razon Social: Tu Turno Barber S.A.S.");
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 322, 644, "NIT: 901.452.839-1  |  Regimen Comun");
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 322, 630, `Fecha Emision: ${dateStr}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 322, 616, `Responsable ERP: ${userName}`);
  stream += drawText("F1", 7.5, 0.3, 0.34, 0.4, 322, 603, "Sede: Cra. 15 # 82-24, Local 102 (Bogota D.C.)");

  // 3. TABLA DE ARTÍCULOS E INSUMOS (Y = 560 hacia abajo)
  // Encabezado de la tabla (H = 22)
  stream += drawRect(0.08, 0.12, 0.20, 40, 560, 532, 22, true);
  stream += drawLine(0.85, 0.65, 0.18, 40, 560, 572, 560, 1.5); // Línea dorada divisoria

  // Encabezados con coordenadas fijas absolutas (sin superposición)
  stream += drawText("F2", 8, 1, 1, 1, 48, 567, "#");
  stream += drawText("F2", 8, 1, 1, 1, 75, 567, "DESCRIPCION DEL ARTICULO / INSUMO");
  stream += drawText("F2", 8, 1, 1, 1, 305, 567, "CANTIDAD");
  stream += drawText("F2", 8, 1, 1, 1, 390, 567, "PRECIO UNITARIO");
  stream += drawText("F2", 8, 1, 1, 1, 495, 567, "SUBTOTAL");

  let currentY = 538;
  const rowHeight = 22;

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const prodName = item.nombre_producto || item.nombre || "Insumo de barberia";
    const qty = item.cantidad || 1;
    const price = Number(item.precio_unitario || 0);
    const subtotal = Number(item.subtotal || price * qty);

    // Fondo alternado
    if (isEven) {
      stream += drawRect(0.98, 0.98, 0.99, 40, currentY - 6, 532, rowHeight, true);
    } else {
      stream += drawRect(1, 1, 1, 40, currentY - 6, 532, rowHeight, true);
    }
    // Borde inferior sutil de cada fila
    stream += drawLine(0.88, 0.9, 0.93, 40, currentY - 6, 572, currentY - 6, 0.5);

    // Columnas individuales con coordenadas absolutas independientes
    stream += drawText("F1", 8, 0.4, 0.44, 0.5, 48, currentY, String(idx + 1));
    stream += drawText("F2", 8.5, 0.12, 0.15, 0.2, 75, currentY, prodName.substring(0, 42));
    stream += drawText("F1", 8.5, 0.25, 0.28, 0.32, 312, currentY, `${qty} uds.`);
    stream += drawText("F1", 8.5, 0.25, 0.28, 0.32, 390, currentY, `$ ${price.toLocaleString("es-CO")}`);
    stream += drawText("F2", 8.5, 0.1, 0.12, 0.15, 495, currentY, `$ ${subtotal.toLocaleString("es-CO")}`);

    currentY -= rowHeight;
  });

  if (items.length === 0) {
    stream += drawRect(0.98, 0.98, 0.99, 40, currentY - 6, 532, rowHeight, true);
    stream += drawLine(0.88, 0.9, 0.93, 40, currentY - 6, 572, currentY - 6, 0.5);
    stream += drawText("F1", 8.5, 0.5, 0.5, 0.5, 75, currentY, "Sin desglose detallado de insumos registrado.");
    currentY -= rowHeight;
  }

  // 4. RESUMEN FINANCIERO Y CONDICIONES DE PAGO
  currentY -= 15;
  const summaryBoxY = Math.max(currentY - 65, 175);

  // Recuadro Izquierdo: Condiciones y Observaciones (X = 40, W = 285)
  stream += drawRect(0.97, 0.98, 0.99, 40, summaryBoxY, 285, 80, true, true, 0.86, 0.89, 0.93, 1);
  stream += drawRect(0.12, 0.16, 0.24, 40, summaryBoxY + 62, 285, 18, true);
  stream += drawText("F2", 7.5, 0.92, 0.72, 0.22, 48, summaryBoxY + 67, "CONDICIONES DE PAGO Y RECEPCION");
  stream += drawText("F1", 7.5, 0.25, 0.28, 0.32, 48, summaryBoxY + 48, "Metodo de Pago: Transferencia Bancaria (Contado)");
  stream += drawText("F1", 7.5, 0.25, 0.28, 0.32, 48, summaryBoxY + 35, "Moneda: COP - Pesos Colombianos | IVA: 0% S.I.");
  stream += drawText("F1", 7, 0.4, 0.45, 0.5, 48, summaryBoxY + 22, "Mercancia recibida a entera satisfaccion para inventario.");
  stream += drawText("F1", 7, 0.4, 0.45, 0.5, 48, summaryBoxY + 10, "Sujeto a politicas de auditoria y control interno de salon.");

  // Recuadro Derecho: Subtotales y Total Destacado (X = 345, W = 227)
  stream += drawText("F1", 8, 0.35, 0.38, 0.44, 348, summaryBoxY + 64, "Subtotal Neto Insumos:");
  stream += drawText("F1", 8, 0.2, 0.2, 0.2, 475, summaryBoxY + 64, `$ ${total.toLocaleString("es-CO")}`);

  stream += drawText("F1", 8, 0.35, 0.38, 0.44, 348, summaryBoxY + 48, "IVA / Impuestos (0% S.I.):");
  stream += drawText("F1", 8, 0.2, 0.2, 0.2, 475, summaryBoxY + 48, "$ 0");

  stream += drawLine(0.85, 0.88, 0.92, 345, summaryBoxY + 40, 572, summaryBoxY + 40, 1);

  // Recuadro de Total Destacado (X = 340, Y = summaryBoxY, W = 232, H = 34)
  stream += drawRect(0.06, 0.09, 0.16, 340, summaryBoxY, 232, 34, true, true, 0.85, 0.65, 0.18, 1.5);
  stream += drawText("F2", 9.5, 0.92, 0.72, 0.22, 350, summaryBoxY + 12, "TOTAL COMPRA:");
  stream += drawText("F2", 12.5, 1, 1, 1, 455, summaryBoxY + 11, `$ ${total.toLocaleString("es-CO")}`);

  // 5. SECCIÓN DE FIRMAS Y APROBACIONES (Y = 115)
  const signY = 115;
  // Firma proveedor
  stream += drawLine(0.65, 0.7, 0.75, 60, signY + 25, 250, signY + 25, 1);
  stream += drawText("F2", 7.5, 0.15, 0.18, 0.24, 75, signY + 12, "ENTREGADO POR (PROVEEDOR)");
  stream += drawText("F1", 7, 0.45, 0.5, 0.55, 82, signY, "Firma, C.C. y Sello de Despacho");

  // Firma receptor de la barbería
  stream += drawLine(0.65, 0.7, 0.75, 360, signY + 25, 550, signY + 25, 1);
  stream += drawText("F2", 7.5, 0.15, 0.18, 0.24, 375, signY + 12, "RECIBIDO (TU TURNO BARBER)");
  stream += drawText("F1", 7, 0.45, 0.5, 0.55, 385, signY, "Firma y Cedula Responsable de Almacen");

  // 6. PIE DE PÁGINA Y AUDITORÍA (Y = 35 to 65)
  stream += drawLine(0.85, 0.88, 0.92, 40, 65, 572, 65, 0.75);
  stream += drawText("F1", 7.5, 0.45, 0.5, 0.55, 40, 50, "Documento expedido por el Sistema ERP de Tu Turno Barber. Valido como comprobante interno de adquisicion.");
  stream += drawText("F1", 7, 0.55, 0.6, 0.65, 40, 38, `Generado electronicamente el ${new Date().toLocaleString("es-CO")} - Bogota D.C., Colombia - Pagina 1 de 1`);

  const pdfBytes = buildPdfDocument(stream);
  const cleanSupplier = (supplierName || "Proveedor").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Comprobante_Compra_#${invoiceNumber}_${cleanSupplier}.pdf`;

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return { blob, filename };
}

/**
 * Descarga directamente la factura o comprobante de compra en PDF.
 * Si la compra posee un archivo adjunto previamente subido por el usuario, descarga dicho archivo;
 * de lo contrario, genera el PDF nativo oficial de inmediato.
 */
export function downloadPurchaseInvoicePDF(purchase, supplier = {}, user = {}) {
  if (!purchase) return;

  // Si tiene archivo PDF ya adjunto previamente
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
 * Genera un Blob PDF nativo para un comprobante de venta o compra del cliente (Cliente Portal / POS).
 */
export function generateSaleReceiptBlob(sale, client = {}) {
  const invoiceRawId = sale?.id_venta || "1";
  const invoiceNumber = String(invoiceRawId).padStart(5, "0");
  const dateStr = sale?.fecha || new Date().toISOString().replace("T", " ").substring(0, 19);
  const status = sale?.estado || "Activa";
  const total = Number(sale?.total || 0);

  const clientName = `${client?.nombre || "Cliente"} ${client?.apellido || ""}`.trim();
  const clientEmail = client?.correo || "cliente@tuturnobarber.com";
  const clientPhone = client?.telefono || "+57 (300) 000-0000";
  const items = sale?.detalles || [];

  let stream = "";

  // 1. CABECERA
  stream += drawRect(0.06, 0.09, 0.16, 40, 705, 532, 67, true);
  stream += drawRect(0.85, 0.65, 0.18, 40, 768, 532, 4, true);

  stream += drawText("F2", 15, 0.92, 0.72, 0.22, 55, 743, "TU TURNO BARBER");
  stream += drawText("F2", 8.5, 1, 1, 1, 55, 729, "COMPROBANTE OFICIAL DE COMPRA Y SERVICIOS");
  stream += drawText("F1", 7.5, 0.72, 0.76, 0.82, 55, 716, "Cuidado Personal, Estilo Masculino y Barberia Profesional");

  // Badge Documento Recibo
  stream += drawRect(0.12, 0.16, 0.25, 415, 712, 145, 50, true, true, 0.85, 0.65, 0.18, 1);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 425, 747, "RECIBO DIGITAL");
  stream += drawText("F2", 13, 1, 1, 1, 425, 731, `REC-${invoiceNumber}`);
  stream += drawText("F2", 7.5, 0.2, 0.85, 0.45, 425, 718, `ESTADO: ${status.toUpperCase()}`);

  // 2. METADATOS CLIENTE Y OPERACIÓN
  // Tarjeta Cliente
  stream += drawRect(0.97, 0.98, 0.99, 40, 605, 258, 90, true, true, 0.86, 0.89, 0.93, 1);
  stream += drawRect(0.1, 0.14, 0.22, 40, 675, 258, 20, true);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 48, 681, "DATOS DEL CLIENTE");
  stream += drawText("F2", 8.5, 0.12, 0.14, 0.18, 48, 658, `Nombre: ${clientName.substring(0, 32)}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 48, 644, `Correo: ${clientEmail}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 48, 630, `Telefono: ${clientPhone}`);
  stream += drawText("F1", 7.5, 0.3, 0.34, 0.4, 48, 616, "Atencion: Barberia Presencial & Tienda Online");

  // Tarjeta Salón
  stream += drawRect(0.97, 0.98, 0.99, 314, 605, 258, 90, true, true, 0.86, 0.89, 0.93, 1);
  stream += drawRect(0.1, 0.14, 0.22, 314, 675, 258, 20, true);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 322, 681, "DATOS DE LA TRANSACCION");
  stream += drawText("F2", 8.5, 0.12, 0.14, 0.18, 322, 658, "Establecimiento: Tu Turno Barber S.A.S.");
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 322, 644, `Fecha: ${dateStr}`);
  stream += drawText("F1", 8, 0.3, 0.34, 0.4, 322, 630, "Metodo de Pago: Efectivo / Datafono / En Linea");
  stream += drawText("F1", 7.5, 0.3, 0.34, 0.4, 322, 616, "Sede: Cra. 15 # 82-24, Local 102 (Bogota D.C.)");

  // 3. TABLA DE ARTÍCULOS Y SERVICIOS
  stream += drawRect(0.08, 0.12, 0.20, 40, 570, 532, 22, true);
  stream += drawLine(0.85, 0.65, 0.18, 40, 570, 572, 570, 1.5);

  stream += drawText("F2", 8, 1, 1, 1, 48, 577, "#");
  stream += drawText("F2", 8, 1, 1, 1, 75, 577, "DESCRIPCION DEL PRODUCTO O SERVICIO");
  stream += drawText("F2", 8, 1, 1, 1, 305, 577, "CANTIDAD");
  stream += drawText("F2", 8, 1, 1, 1, 390, 577, "PRECIO UNITARIO");
  stream += drawText("F2", 8, 1, 1, 1, 495, 577, "SUBTOTAL");

  let currentY = 548;
  const rowHeight = 22;

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const prodName = item.nombre || item.nombre_producto || `Item ${idx + 1}`;
    const qty = item.cantidad || 1;
    const price = Number(item.precio_unitario || item.precio || 0);
    const subtotal = Number(item.subtotal || price * qty);

    if (isEven) {
      stream += drawRect(0.98, 0.98, 0.99, 40, currentY - 6, 532, rowHeight, true);
    } else {
      stream += drawRect(1, 1, 1, 40, currentY - 6, 532, rowHeight, true);
    }
    stream += drawLine(0.88, 0.9, 0.93, 40, currentY - 6, 572, currentY - 6, 0.5);

    stream += drawText("F1", 8, 0.4, 0.44, 0.5, 48, currentY, String(idx + 1));
    stream += drawText("F2", 8.5, 0.12, 0.15, 0.2, 75, currentY, prodName.substring(0, 42));
    stream += drawText("F1", 8.5, 0.25, 0.28, 0.32, 312, currentY, `${qty}`);
    stream += drawText("F1", 8.5, 0.25, 0.28, 0.32, 390, currentY, `$ ${price.toLocaleString("es-CO")}`);
    stream += drawText("F2", 8.5, 0.1, 0.12, 0.15, 495, currentY, `$ ${subtotal.toLocaleString("es-CO")}`);

    currentY -= rowHeight;
  });

  if (items.length === 0) {
    stream += drawRect(0.98, 0.98, 0.99, 40, currentY - 6, 532, rowHeight, true);
    stream += drawLine(0.88, 0.9, 0.93, 40, currentY - 6, 572, currentY - 6, 0.5);
    stream += drawText("F1", 8.5, 0.5, 0.5, 0.5, 75, currentY, "Sin detalle de articulos facturados.");
    currentY -= rowHeight;
  }

  // 4. TOTAL Y AGRADECIMIENTO
  currentY -= 20;
  const summaryBoxY = Math.max(currentY - 45, 180);

  // Recuadro de agradecimiento
  stream += drawRect(0.97, 0.98, 0.99, 40, summaryBoxY, 285, 48, true, true, 0.86, 0.89, 0.93, 1);
  stream += drawText("F2", 8, 0.92, 0.72, 0.22, 50, summaryBoxY + 30, "GRACIAS POR SU PREFERENCIA");
  stream += drawText("F1", 7.5, 0.3, 0.35, 0.4, 50, summaryBoxY + 16, "En Tu Turno Barber valoramos su confianza y satisfaccion.");
  stream += drawText("F1", 7, 0.45, 0.5, 0.55, 50, summaryBoxY + 5, "Conserve este comprobante digital como soporte de pago.");

  // Recuadro de Total
  stream += drawRect(0.06, 0.09, 0.16, 340, summaryBoxY, 232, 48, true, true, 0.85, 0.65, 0.18, 1.5);
  stream += drawText("F2", 10, 0.92, 0.72, 0.22, 352, summaryBoxY + 26, "TOTAL PAGADO:");
  stream += drawText("F2", 14, 1, 1, 1, 445, summaryBoxY + 24, `$ ${total.toLocaleString("es-CO")}`);
  stream += drawText("F1", 7.5, 0.7, 0.75, 0.82, 352, summaryBoxY + 10, "Impuestos incluidos - Moneda COP");

  // 5. PIE DE PÁGINA
  stream += drawLine(0.85, 0.88, 0.92, 40, 65, 572, 65, 0.75);
  stream += drawText("F1", 7.5, 0.45, 0.5, 0.55, 40, 50, "Tu Turno Barber ERP - Comprobante digital valido como constancia de adquisicion y servicio.");
  stream += drawText("F1", 7, 0.55, 0.6, 0.65, 40, 38, `Emitido electronicamente el ${new Date().toLocaleString("es-CO")} - Sede Chapinero - Pagina 1 de 1`);

  const pdfBytes = buildPdfDocument(stream);
  const filename = `Comprobante_Pago_#${invoiceNumber}.pdf`;
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
