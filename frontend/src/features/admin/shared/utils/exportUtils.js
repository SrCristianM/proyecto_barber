/**
 * Utilidad universal para exportar datos a CSV compatible con Excel (UTF-8 con BOM).
 * @param {string} filename - Nombre del archivo sin extensión.
 * @param {Array<Object>} rows - Lista de objetos a exportar.
 * @param {Array<{key: string, label: string}>} columns - Definición de columnas a incluir.
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) {
    return false;
  }

  // Encabezados
  const headers = columns ? columns.map(c => `"${c.label}"`) : Object.keys(rows[0]).map(k => `"${k}"`);
  
  // Filas
  const csvRows = rows.map(row => {
    if (columns) {
      return columns.map(col => {
        const val = typeof col.valueGetter === "function" ? col.valueGetter(row) : row[col.key];
        const formatted = val === null || val === undefined ? "" : String(val).replace(/"/g, '""');
        return `"${formatted}"`;
      }).join(",");
    } else {
      return Object.values(row).map(val => {
        const formatted = val === null || val === undefined ? "" : String(val).replace(/"/g, '""');
        return `"${formatted}"`;
      }).join(",");
    }
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
