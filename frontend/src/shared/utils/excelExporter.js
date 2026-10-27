/**
 * @file excelExporter.js
 * Generador de archivos de Excel profesionales con diseño, estilos, membrete y formatos automáticos.
 * Utiliza el estándar Microsoft XML Spreadsheet 2003 para garantizar apertura nativa
 * en Excel, LibreOffice y Google Sheets con auto-ajuste de columnas y formato monetario.
 */

import { getLocalDateString } from "./dateUtils.js";

export function exportToStyledExcel({
  filename = "reporte",
  sheetName = "Datos",
  title = "Reporte Administrativo",
  subtitle = "Sistema Tu Turno Barber ERP",
  columns = [], // Array de { header: string, key: string, type?: 'string'|'number'|'currency'|'date'|'time'|'code'|'status', width?: number, align?: 'left'|'center'|'right' }
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

  // Limpieza rigurosa del nombre de archivo para evitar dobles extensiones (.xls.xls) o fechas duplicadas
  const baseName = String(filename || "reporte")
    .replace(/\.xlsx?$|\.csv$/i, "")
    .replace(/_\d{4}-\d{2}-\d{2}$/, "");
  const cleanFilename = `${baseName}_${getLocalDateString(currentDate)}.xls`;

  // Normalización inteligente de columnas: detección de tipo y alineación automática
  const normalizedColumns = columns.map((col) => {
    const key = String(col.key || "").toLowerCase();
    const header = String(col.header || col.label || col.key || "").toLowerCase();

    let type = col.type;
    let align = col.align;

    if (!type) {
      if (
        key.includes("precio") ||
        key.includes("costo") ||
        key.includes("total") ||
        key.includes("monto") ||
        key.includes("valor") ||
        key.includes("subtotal") ||
        header.includes("precio") ||
        header.includes("costo") ||
        header.includes("total") ||
        header.includes("monto") ||
        header.includes("cop")
      ) {
        type = "currency";
      } else if (
        key.includes("stock") ||
        key.includes("cantidad") ||
        key.includes("duracion") ||
        key.includes("edad") ||
        key.includes("unidades") ||
        header.includes("stock") ||
        header.includes("cantidad") ||
        header.includes("duración") ||
        header.includes("unidades")
      ) {
        type = "number";
      } else if (
        key.includes("estado") ||
        key.includes("status") ||
        key.includes("semaforo") ||
        header.includes("estado") ||
        header.includes("semáforo")
      ) {
        type = "status";
      } else if (
        key.includes("fecha") ||
        key.includes("date") ||
        header.includes("fecha")
      ) {
        type = "date";
      } else if (
        key.includes("hora") ||
        key.includes("time") ||
        header.includes("hora")
      ) {
        type = "time";
      } else if (
        key.startsWith("id_") ||
        key === "id" ||
        key.includes("folio")
      ) {
        type = "code";
      } else {
        type = "string";
      }
    }

    if (!align) {
      if (type === "currency" || (type === "number" && !key.startsWith("id"))) {
        align = "right";
      } else if (
        type === "status" ||
        type === "date" ||
        type === "time" ||
        type === "code" ||
        key.startsWith("id") ||
        key.includes("folio") ||
        key.includes("nit") ||
        key.includes("documento") ||
        key.includes("telefono") ||
        key.includes("celular")
      ) {
        align = "center";
      } else {
        align = "left";
      }
    }

    return {
      ...col,
      header: col.header || col.label || col.key,
      type,
      align
    };
  });

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
      <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#92400E"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
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

    <!-- Celdas de Estado Activo / Exitoso / Verde -->
    <Style ss:ID="CellActive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#166534"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Inactivo / Cancelado / Rojo -->
    <Style ss:ID="CellInactive">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#991B1B"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Pendiente / Programada / Amarillo -->
    <Style ss:ID="CellPending">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#854D0E"/>
      <Interior ss:Color="#FEF9C3" ss:Pattern="Solid"/>
    </Style>

    <!-- Celdas de Estado Información / En Proceso / Azul -->
    <Style ss:ID="CellInfo">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BAE6FD"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BAE6FD"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BAE6FD"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0369A1"/>
      <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
    </Style>

    <!-- Estilos para Fila de Totales / Resumen -->
    <Style ss:ID="TotalLabel">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#0F172A"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="TotalCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#047857"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;$&quot;\ #,##0"/>
    </Style>
    <Style ss:ID="TotalNumber">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#0F172A"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="TotalBlank">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#94A3B8"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
    </Style>
  </Styles>

  <Worksheet ss:Name="${sheetName}">
    <Table ss:DefaultRowHeight="20">`;

  // CÁLCULO INTELIGENTE DEL ANCHO DE COLUMNAS (AUTO-FIT CON MARGEN CÓMODO)
  normalizedColumns.forEach((col) => {
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
      finalWidth = Math.max(col.width, maxContentLen * 8 + 25);
    } else if (col.width && col.width < 50) {
      finalWidth = Math.max(col.width * 8.5 + 30, maxContentLen * 8 + 25);
    } else {
      finalWidth = Math.max(maxContentLen * 8.5 + 30, 95);
    }

    // Reglas de ancho mínimo según el tipo de dato
    if (col.type === "currency") finalWidth = Math.max(finalWidth, 120);
    if (col.type === "number") finalWidth = Math.max(finalWidth, 85);
    if (col.key?.includes("fecha") || col.key?.includes("date")) finalWidth = Math.max(finalWidth, 115);
    if (col.key?.includes("correo") || col.key?.includes("email")) finalWidth = Math.max(finalWidth, 190);
    if (
      col.key?.includes("nombre") ||
      col.key?.includes("cliente") ||
      col.key?.includes("barbero") ||
      col.key?.includes("proveedor") ||
      col.key?.includes("usuario")
    ) {
      finalWidth = Math.max(finalWidth, 160);
    }
    if (col.key?.includes("servicio") || col.key?.includes("paquete") || col.key?.includes("articulo") || col.key?.includes("insumo")) {
      finalWidth = Math.max(finalWidth, 180);
    }
    if (col.key?.includes("observacion") || col.key?.includes("descripcion")) {
      finalWidth = Math.max(finalWidth, 220);
    }

    // Acotar entre 80 y 420 puntos
    finalWidth = Math.min(Math.max(finalWidth, 80), 420);

    xml += `\n      <Column ss:Width="${Math.round(finalWidth)}"/>`;
  });

  const totalCols = Math.max(normalizedColumns.length, 1);

  // Fila 1: Título de la Barbería / ERP con Membrete
  xml += `
      <Row ss:Height="30">
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
  normalizedColumns.forEach((col) => {
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

    normalizedColumns.forEach((col) => {
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
      } else if (col.type === "status" || col.key?.includes("estado") || col.key?.includes("semaforo")) {
        const lower = String(rawVal).toLowerCase();
        if (
          lower.includes("act") ||
          lower.includes("comp") ||
          lower.includes("regis") ||
          lower.includes("aprob") ||
          lower.includes("verde") ||
          lower.includes("disp") ||
          lower.includes("pagad")
        ) {
          styleID = "CellActive";
        } else if (
          lower.includes("cancel") ||
          lower.includes("anul") ||
          lower.includes("inact") ||
          lower.includes("rojo") ||
          lower.includes("agotad") ||
          lower.includes("rechaz")
        ) {
          styleID = "CellInactive";
        } else if (
          lower.includes("pend") ||
          lower.includes("prog") ||
          lower.includes("amarillo") ||
          lower.includes("alerta") ||
          lower.includes("por agotar")
        ) {
          styleID = "CellPending";
        } else {
          styleID = "CellInfo";
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

  // FILA DE TOTALES / RESUMEN (si hay columnas numéricas o de moneda sumables)
  const summableCols = normalizedColumns.filter((col) => {
    const k = col.key.toLowerCase();
    if (k.startsWith("id_") || k === "id" || k.includes("duracion") || k.includes("telefono") || k.includes("nit") || k.includes("documento")) {
      return false;
    }
    return col.type === "currency" || (col.type === "number" && (k.includes("stock") || k.includes("cantidad") || k.includes("total") || k.includes("insumo")));
  });

  if (summableCols.length > 0 && data.length > 0) {
    xml += `
      <Row ss:Height="24">`;

    normalizedColumns.forEach((col, idx) => {
      const k = col.key.toLowerCase();
      const isSummable =
        !k.startsWith("id_") &&
        k !== "id" &&
        !k.includes("duracion") &&
        !k.includes("telefono") &&
        !k.includes("nit") &&
        !k.includes("documento") &&
        (col.type === "currency" || (col.type === "number" && (k.includes("stock") || k.includes("cantidad") || k.includes("total") || k.includes("insumo"))));

      if (idx === 0) {
        xml += `
        <Cell ss:StyleID="TotalLabel">
          <Data ss:Type="String">TOTAL GENERAL</Data>
        </Cell>`;
      } else if (isSummable) {
        const sum = data.reduce((acc, row) => {
          const n = Number(row[col.key]);
          return acc + (isNaN(n) ? 0 : n);
        }, 0);

        const style = col.type === "currency" ? "TotalCurrency" : "TotalNumber";
        xml += `
        <Cell ss:StyleID="${style}">
          <Data ss:Type="Number">${sum}</Data>
        </Cell>`;
      } else {
        xml += `
        <Cell ss:StyleID="TotalBlank">
          <Data ss:Type="String">—</Data>
        </Cell>`;
      }
    });

    xml += `
      </Row>`;
  }

  const lastRowIndex = data.length + 5 + (summableCols.length > 0 && data.length > 0 ? 1 : 0);

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
    <AutoFilter x:Range="R5C1:R${lastRowIndex}C${totalCols}" xmlns="urn:schemas-microsoft-com:office:excel"/>
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

