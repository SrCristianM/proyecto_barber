/**
 * @file excelExporter.js
 * Generador de archivos de Excel profesionales con diseño, estilos, membrete y formatos.
 * Utiliza el estándar Microsoft XML Spreadsheet 2003 para garantizar apertura nativa
 * en Excel, LibreOffice y Google Sheets sin dependencias externas pesadas.
 */

export function exportToStyledExcel({
  filename = "reporte",
  sheetName = "Datos",
  title = "Reporte Administrativo",
  subtitle = "Sistema Tu Turno Barber ERP",
  columns = [], // Array de { header: string, key: string, type?: 'string'|'number'|'currency'|'date', width?: number, align?: 'left'|'center'|'right' }
  data = []
}) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const cleanFilename = `${filename}_${currentDate.toISOString().split("T")[0]}.xls`;

  // Construcción del documento XML Spreadsheet 2003
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  
  <Styles>
    <!-- Estilo predeterminado -->
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>

    <!-- Membrete Título Principal -->
    <Style ss:ID="ReportTitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="16" ss:Bold="1" ss:Color="#C9A24A"/>
    </Style>

    <!-- Membrete Subtítulo -->
    <Style ss:ID="ReportSubtitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Italic="1" ss:Color="#64748B"/>
    </Style>

    <!-- Metadatos de Fecha y Cantidad -->
    <Style ss:ID="ReportMeta">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#475569"/>
    </Style>

    <!-- Encabezados de Columnas -->
    <Style ss:ID="HeaderCol">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#C9A24A"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas Normales de Texto (Izquierda) -->
    <Style ss:ID="CellText">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#1E293B"/>
    </Style>

    <!-- Celdas Centradas -->
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#1E293B"/>
    </Style>

    <!-- Celdas Numéricas -->
    <Style ss:ID="CellNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#1E293B"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>

    <!-- Celdas de Moneda (Pesos) -->
    <Style ss:ID="CellCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#0F766E"/>
      <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
    </Style>

    <!-- Celdas de Estado Activo -->
    <Style ss:ID="CellActive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#15803D"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Inactivo / Anulado -->
    <Style ss:ID="CellInactive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#B91C1C"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
    </Style>
  </Styles>

  <Worksheet ss:Name="${sheetName}">
    <Table ss:DefaultRowHeight="20">`;

  // Ancho de columnas
  columns.forEach((col) => {
    const width = col.width || 120;
    xml += `\n      <Column ss:Width="${width}"/>`;
  });

  const totalCols = Math.max(columns.length, 1);

  // Fila 1: Título de la Barbería / ERP
  xml += `
      <Row ss:Height="26">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportTitle">
          <Data ss:Type="String">TU TURNO BARBER — ${title.toUpperCase()}</Data>
        </Cell>
      </Row>`;

  // Fila 2: Subtítulo
  xml += `
      <Row ss:Height="18">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportSubtitle">
          <Data ss:Type="String">${subtitle} • Generado el ${formattedDate}</Data>
        </Cell>
      </Row>`;

  // Fila 3: Total Registros
  xml += `
      <Row ss:Height="18">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportMeta">
          <Data ss:Type="String">Total de registros exportados: ${data.length}</Data>
        </Cell>
      </Row>
      <Row ss:Height="8"/>`; // Fila de separación

  // Fila 4: Encabezados
  xml += `
      <Row ss:Height="26">`;
  columns.forEach((col) => {
    xml += `
        <Cell ss:StyleID="HeaderCol">
          <Data ss:Type="String">${escapeXml(col.header)}</Data>
        </Cell>`;
  });
  xml += `
      </Row>`;

  // Filas de datos
  data.forEach((row) => {
    xml += `
      <Row ss:Height="22">`;

    columns.forEach((col) => {
      let rawVal = row[col.key];
      if (rawVal === undefined || rawVal === null) rawVal = "";

      // Determinar estilo
      let styleID = "CellText";
      let dataType = "String";
      let displayVal = String(rawVal);

      if (col.type === "currency") {
        styleID = "CellCurrency";
        dataType = "Number";
        const num = Number(rawVal);
        displayVal = isNaN(num) ? "0" : String(num);
      } else if (col.type === "number") {
        styleID = "CellNumber";
        dataType = "Number";
        const num = Number(rawVal);
        displayVal = isNaN(num) ? "0" : String(num);
      } else if (col.type === "status") {
        const isPos = String(rawVal).toLowerCase().includes("act") || String(rawVal).toLowerCase().includes("reg") || String(rawVal).toLowerCase().includes("comp");
        styleID = isPos ? "CellActive" : "CellInactive";
        dataType = "String";
      } else if (col.align === "center") {
        styleID = "CellCenter";
      }

      xml += `
        <Cell ss:StyleID="${styleID}">
          <Data ss:Type="${dataType}">${escapeXml(displayVal)}</Data>
        </Cell>`;
    });

    xml += `
      </Row>`;
  });

  xml += `
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <Selected/>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  // Descarga del archivo
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
