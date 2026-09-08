/**
 * @file excelExporter.js
 * Generador de archivos de Excel profesionales con diseño, estilos, membrete y formatos automáticos.
 * Utiliza el estándar Microsoft XML Spreadsheet 2003 para garantizar apertura nativa
 * en Excel, LibreOffice y Google Sheets con auto-ajuste de columnas y formato monetario.
 */

export function exportToStyledExcel({
  filename = "reporte",
  sheetName = "Datos",
  title = "Reporte Administrativo",
  subtitle = "Sistema Tu Turno Barber ERP",
  columns = [], // Array de { header: string, key: string, type?: 'string'|'number'|'currency'|'date'|'status', width?: number, align?: 'left'|'center'|'right' }
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
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>

    <!-- Membrete Título Principal -->
    <Style ss:ID="ReportTitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#D97706"/>
      <Interior ss:Color="#FFFBEB" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F59E0B"/>
      </Borders>
    </Style>

    <!-- Membrete Subtítulo -->
    <Style ss:ID="ReportSubtitle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Italic="1" ss:Color="#475569"/>
    </Style>

    <!-- Metadatos de Fecha y Cantidad -->
    <Style ss:ID="ReportMeta">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0F766E"/>
    </Style>

    <!-- Encabezados de Columnas -->
    <Style ss:ID="HeaderCol">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#D97706"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas Normales de Texto (Izquierda) -->
    <Style ss:ID="CellText">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
    </Style>

    <!-- Celdas Normales con fondo alternado (Zebra) -->
    <Style ss:ID="CellTextZebra">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas Centradas -->
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
    </Style>
    <Style ss:ID="CellCenterZebra">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas Numéricas -->
    <Style ss:ID="CellNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="CellNumberZebra">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>

    <!-- Celdas de Moneda (Pesos Colombianos) -->
    <Style ss:ID="CellCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
      <NumberFormat ss:Format="&quot;$&quot;\ #,##0"/>
    </Style>
    <Style ss:ID="CellCurrencyZebra">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;$&quot;\ #,##0"/>
    </Style>

    <!-- Celdas de Estado Activo / Exitoso -->
    <Style ss:ID="CellActive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#166534"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Inactivo / Cancelado -->
    <Style ss:ID="CellInactive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#991B1B"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Pendiente / Programada -->
    <Style ss:ID="CellPending">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#854D0E"/>
      <Interior ss:Color="#FEF9C3" ss:Pattern="Solid"/>
    </Style>
  </Styles>

  <Worksheet ss:Name="${sheetName}">
    <Table ss:DefaultRowHeight="20">`;

  // CÁLCULO INTELIGENTE DEL ANCHO DE COLUMNAS (AUTO-FIT CON MARGEN CÓMODO)
  columns.forEach((col) => {
    const headerLen = String(col.header || "").length;
    let maxContentLen = headerLen;

    data.forEach((row) => {
      const val = row[col.key];
      if (val !== undefined && val !== null) {
        let str;
        if (col.type === "currency") {
          str = `$ ${Number(val).toLocaleString("es-CO")}`;
        } else {
          str = String(val);
        }
        if (str.length > maxContentLen) {
          maxContentLen = str.length;
        }
      }
    });

    let finalWidth;
    if (col.width && col.width >= 50) {
      // Ancho ya provisto explícitamente en puntos (ej. 120, 180, 240)
      finalWidth = Math.max(col.width, maxContentLen * 8 + 25);
    } else if (col.width && col.width < 50) {
      // Ancho provisto erróneamente en número de caracteres (ej. 10, 14, 26)
      // Lo escalamos adecuadamente a puntos de Excel
      finalWidth = Math.max(col.width * 8.5 + 30, maxContentLen * 8 + 25);
    } else {
      // Auto-cálculo según longitud máxima de contenido + margen
      finalWidth = Math.max(maxContentLen * 8.5 + 30, 95);
    }

    // Reglas de ancho mínimo según el tipo de dato
    if (col.type === "currency") finalWidth = Math.max(finalWidth, 115);
    if (col.type === "number") finalWidth = Math.max(finalWidth, 85);
    if (col.key?.includes("fecha") || col.key?.includes("date")) finalWidth = Math.max(finalWidth, 115);
    if (col.key?.includes("correo") || col.key?.includes("email")) finalWidth = Math.max(finalWidth, 190);
    if (col.key?.includes("nombre") || col.key?.includes("cliente") || col.key?.includes("barbero") || col.key?.includes("proveedor")) {
      finalWidth = Math.max(finalWidth, 160);
    }
    if (col.key?.includes("servicio") || col.key?.includes("paquete") || col.key?.includes("articulo")) {
      finalWidth = Math.max(finalWidth, 180);
    }

    // Acotar entre 80 y 380 puntos
    finalWidth = Math.min(Math.max(finalWidth, 80), 380);

    xml += `\n      <Column ss:Width="${Math.round(finalWidth)}"/>`;
  });

  const totalCols = Math.max(columns.length, 1);

  // Fila 1: Título de la Barbería / ERP con Membrete
  xml += `
      <Row ss:Height="28">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportTitle">
          <Data ss:Type="String">TU TURNO BARBER — ${title.toUpperCase()}</Data>
        </Cell>
      </Row>`;

  // Fila 2: Subtítulo y fecha de exportación
  xml += `
      <Row ss:Height="20">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportSubtitle">
          <Data ss:Type="String">${subtitle} | Exportado el ${formattedDate}</Data>
        </Cell>
      </Row>`;

  // Fila 3: Total Registros y estado
  xml += `
      <Row ss:Height="20">
        <Cell ss:MergeAcross="${totalCols - 1}" ss:StyleID="ReportMeta">
          <Data ss:Type="String">Total de registros exportados: ${data.length}</Data>
        </Cell>
      </Row>
      <Row ss:Height="10"/>`; // Fila de separación elegante

  // Fila 5: Encabezados de Columnas
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

  // Filas de datos con Zebra striping
  data.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;

    xml += `
      <Row ss:Height="22">`;

    columns.forEach((col) => {
      let rawVal = row[col.key];
      if (rawVal === undefined || rawVal === null) rawVal = "";

      let styleID = isEven ? "CellText" : "CellTextZebra";
      let dataType = "String";
      let displayVal = String(rawVal);

      if (col.type === "currency") {
        styleID = isEven ? "CellCurrency" : "CellCurrencyZebra";
        dataType = "Number";
        const num = Number(rawVal);
        displayVal = isNaN(num) ? "0" : String(num);
      } else if (col.type === "number") {
        styleID = isEven ? "CellNumber" : "CellNumberZebra";
        dataType = "Number";
        const num = Number(rawVal);
        displayVal = isNaN(num) ? "0" : String(num);
      } else if (col.type === "status" || col.key?.includes("estado")) {
        const lower = String(rawVal).toLowerCase();
        if (lower.includes("act") || lower.includes("comp") || lower.includes("regis") || lower.includes("aprob")) {
          styleID = "CellActive";
        } else if (lower.includes("cancel") || lower.includes("anul") || lower.includes("inact")) {
          styleID = "CellInactive";
        } else {
          styleID = "CellPending";
        }
        dataType = "String";
      } else if (col.align === "center") {
        styleID = isEven ? "CellCenter" : "CellCenterZebra";
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
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>5</SplitHorizontal>
      <TopRowBottomPane>5</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
    <AutoFilter x:Range="R5C1:R${data.length + 5}C${totalCols}" xmlns="urn:schemas-microsoft-com:office:excel"/>
  </Worksheet>
</Workbook>`;

  // Descarga del archivo en formato nativo Excel (.xls)
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
