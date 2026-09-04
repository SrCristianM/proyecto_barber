import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

/**
 * Utilidad universal para exportar datos con diseño profesional a Excel (.xls) o CSV compatible.
 * @param {string} filename - Nombre del archivo sin extensión.
 * @param {Array<Object>} rows - Lista de objetos a exportar.
 * @param {Array<{key: string, label: string}>} columns - Definición de columnas a incluir.
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) {
    return false;
  }

  // Usar exportador con diseño premium y formato Excel nativo
  if (columns && columns.length > 0) {
    exportToStyledExcel({
      title: filename.replace(/[_-]/g, " ").toUpperCase(),
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `${filename}_${new Date().toISOString().split("T")[0]}.xls`,
      columns: columns.map(c => ({
        header: c.label || c.key,
        key: c.key,
        width: 22
      })),
      data: rows.map(row => {
        const item = {};
        columns.forEach(col => {
          item[col.key] = typeof col.valueGetter === "function" ? col.valueGetter(row) : (row[col.key] ?? "");
        });
        return item;
      })
    });
    return true;
  }

  // Encabezados fallback
  const headers = Object.keys(rows[0]).map(k => `"${k}"`);
  
  // Filas
  const csvRows = rows.map(row => {
    return Object.values(row).map(val => {
      const formatted = val === null || val === undefined ? "" : String(val).replace(/"/g, '""');
      return `"${formatted}"`;
    }).join(",");
  });

  // BOM para soporte UTF-8 en Excel
  const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
