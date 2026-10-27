import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  History,
  TrendingUp,
  TrendingDown,
  Search,
  FileSpreadsheet,
  Package,
  Calendar,
  Eye,
  Filter,
  Layers,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

export default function WarehouseMovementsHistoryView({
  movements = [],
  warehouseItems = [],
  onSelectMovement,
  initialInsumoId = "all"
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInsumoId, setSelectedInsumoId] = useState(initialInsumoId);
  const [selectedTipo, setSelectedTipo] = useState("all");

  // Filtrado reactivo en frontend
  const filteredMovements = useMemo(() => {
    return (movements || []).filter((m) => {
      const matchInsumo =
        selectedInsumoId === "all" || Number(m.id_insumo) === Number(selectedInsumoId);

      const normTipo = (m.tipo_movimiento || "").toLowerCase();
      const matchTipo =
        selectedTipo === "all" ||
        (selectedTipo === "cargo" && normTipo.includes("cargo")) ||
        (selectedTipo === "descargo" && normTipo.includes("descargo"));

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (m.insumo_nombre || "").toLowerCase().includes(term) ||
        (m.observaciones || "").toLowerCase().includes(term) ||
        (m.insumo_categoria || "").toLowerCase().includes(term) ||
        (m.proveedor_nombre || "").toLowerCase().includes(term) ||
        String(m.id_movimiento || "").includes(term);

      return matchInsumo && matchTipo && matchSearch;
    });
  }, [movements, selectedInsumoId, selectedTipo, searchTerm]);

  // Métricas y KPIs resumen
  const stats = useMemo(() => {
    let totalCargos = 0;
    let unidadesCargadas = 0;
    let totalDescargos = 0;
    let unidadesDescargadas = 0;
    const uniqueInsumos = new Set();

    (movements || []).forEach((m) => {
      uniqueInsumos.add(m.id_insumo);
      const isCargo = (m.tipo_movimiento || "").toLowerCase().includes("cargo");
      const qty = Number(m.cantidad || 0);
      if (isCargo) {
        totalCargos++;
        unidadesCargadas += qty;
      } else {
        totalDescargos++;
        unidadesDescargadas += qty;
      }
    });

    return {
      total: (movements || []).length,
      totalCargos,
      unidadesCargadas,
      totalDescargos,
      unidadesDescargadas,
      insumosCount: uniqueInsumos.size
    };
  }, [movements]);

  // Exportar a Excel con formato visual idéntico al estándar del sistema
  const handleExportExcel = () => {
    if (!filteredMovements || filteredMovements.length === 0) {
      toast.error("No hay movimientos de bodega para exportar con los filtros seleccionados.");
      return;
    }

    exportToStyledExcel({
      title: "HISTORIAL DE MOVIMIENTOS Y AJUSTES DE BODEGA GENERAL",
      subtitle: `Registro de auditoría de cargos y descargos manuales | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Movimientos Bodega",
      filename: "historial_ajustes_bodega",
      columns: [
        { header: "ID Movimiento", key: "id_movimiento", type: "code", width: 95, align: "center" },
        { header: "Fecha y Hora", key: "fecha", type: "date", width: 155, align: "center" },
        { header: "Insumo", key: "insumo_nombre", width: 220 },
        { header: "Categoría", key: "categoria", width: 140 },
        { header: "Tipo de Movimiento", key: "tipo_movimiento", type: "status", width: 145, align: "center" },
        { header: "Cantidad Ajustada", key: "cantidad", type: "number", width: 120, align: "right" },
        { header: "Unidad", key: "unidad_medida", width: 100, align: "center" },
        { header: "Stock Anterior", key: "stock_anterior", type: "number", width: 110, align: "right" },
        { header: "Stock Resultante", key: "stock_nuevo", type: "number", width: 115, align: "right" },
        { header: "Observaciones / Justificación", key: "observaciones", width: 280 },
        { header: "Proveedor Habitual", key: "proveedor_nombre", width: 160 }
      ],
      data: filteredMovements.map((m) => {
        const isCargo = (m.tipo_movimiento || "").toLowerCase().includes("cargo");
        return {
          id_movimiento: `#MOV-${String(m.id_movimiento).padStart(4, "0")}`,
          fecha: m.fecha_movimiento
            ? new Date(m.fecha_movimiento).toLocaleString("es-CO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            : "—",
          insumo_nombre: m.insumo_nombre || "Insumo de Bodega",
          categoria: m.insumo_categoria || "General",
          tipo_movimiento: isCargo ? "CARGO (+)" : "DESCARGO (-)",
          cantidad: isCargo ? `+${m.cantidad}` : `-${m.cantidad}`,
          unidad_medida: m.unidad_medida || "Unidad",
          stock_anterior: Number(m.stock_anterior ?? 0),
          stock_nuevo: Number(m.stock_nuevo ?? 0),
          observaciones: m.observaciones || "Ajuste manual de inventario",
          proveedor_nombre: m.proveedor_nombre || "General"
        };
      })
    });

    toast.success("Historial de movimientos exportado a Excel exitosamente");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedInsumoId("all");
    setSelectedTipo("all");
  };

  return (
    <div className="space-y-4">
      {/* TARJETAS RESUMEN / KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Movimientos */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Total Ajustes
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">{stats.total}</div>
            <span className="text-[11px] text-muted-foreground">Movimientos registrados</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Cargos por Ajuste */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">
              Cargos por Ajuste
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              +{stats.unidadesCargadas}{" "}
              <span className="text-xs font-semibold text-muted-foreground">uds</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              En {stats.totalCargos} movimientos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Descargos por Ajuste */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
              Descargos por Ajuste
            </span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">
              -{stats.unidadesDescargadas}{" "}
              <span className="text-xs font-semibold text-muted-foreground">uds</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              En {stats.totalDescargos} movimientos
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Insumos Afectados */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
              Insumos Calibrados
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {stats.insumosCount}
            </div>
            <span className="text-[11px] text-muted-foreground">Con ajuste histórico</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/40 shadow-sm backdrop-blur-md">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por insumo, observación, categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
            />
          </div>

          {/* Filtro por Insumo */}
          <select
            value={selectedInsumoId}
            onChange={(e) => setSelectedInsumoId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer max-w-[220px]"
          >
            <option value="all">Todos los insumos ({warehouseItems.length})</option>
            {warehouseItems.map((item) => (
              <option key={item.id_insumo} value={item.id_insumo}>
                {item.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por Tipo de Movimiento */}
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="cargo">🟢 Solo Cargos por ajuste (+)</option>
            <option value="descargo">🔴 Solo Descargos por ajuste (-)</option>
          </select>

          {(searchTerm || selectedInsumoId !== "all" || selectedTipo !== "all") && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Limpiar filtros"
              className="p-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#DFB755]" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL DEL HISTORIAL */}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4 text-center">ID</th>
              <th className="py-3 px-4">Fecha y Hora</th>
              <th className="py-3 px-4">Insumo de Bodega</th>
              <th className="py-3 px-4 text-center">Tipo de Movimiento</th>
              <th className="py-3 px-4 text-right">Cantidad</th>
              <th className="py-3 px-4 text-center">Stock (Antes ➔ Nuevo)</th>
              <th className="py-3 px-4">Observaciones / Motivo</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {filteredMovements.length > 0 ? (
              filteredMovements.map((m) => {
                const isCargo = (m.tipo_movimiento || "").toLowerCase().includes("cargo");
                const qty = Number(m.cantidad || 0);
                const stockAnterior = Number(m.stock_anterior ?? 0);
                const stockNuevo = Number(m.stock_nuevo ?? 0);
                const formattedId = `#MOV-${String(m.id_movimiento || 0).padStart(4, "0")}`;

                const fechaFormateada = m.fecha_movimiento
                  ? new Date(m.fecha_movimiento).toLocaleString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "—";

                return (
                  <tr
                    key={m.id_movimiento}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border/40">
                        {formattedId}
                      </span>
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{fechaFormateada}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#DFB755]" />
                        <span>Hora Col.</span>
                      </div>
                    </td>

                    {/* Insumo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">
                          <Package className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {m.insumo_nombre || "Insumo de Bodega"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {m.insumo_categoria || "General"} • {m.unidad_medida || "Unidad"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tipo de Movimiento */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          isCargo
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {isCargo ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{isCargo ? "Cargo por ajuste" : "Descargo por ajuste"}</span>
                      </span>
                    </td>

                    {/* Cantidad Ajustada */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-xs font-black ${
                          isCargo ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isCargo ? `+${qty}` : `-${qty}`} {m.unidad_medida || "uds"}
                      </span>
                    </td>

                    {/* Evolución del Stock */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/60 text-xs font-bold">
                        <span className="text-muted-foreground">{stockAnterior}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span
                          className={`font-black ${
                            isCargo ? "text-emerald-400" : "text-foreground"
                          }`}
                        >
                          {stockNuevo}
                        </span>
                      </div>
                    </td>

                    {/* Observaciones */}
                    <td className="py-3 px-4 max-w-xs">
                      <p
                        className="text-xs text-foreground/90 italic truncate"
                        title={m.observaciones}
                      >
                        "{m.observaciones || "Ajuste de inventario"}"
                      </p>
                    </td>

                    {/* Acción: Ver Ficha Completa */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectMovement(m)}
                        title="Ver detalle completo del movimiento"
                        className="p-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-xs font-bold text-foreground">
                      No se encontraron movimientos registrados
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm">
                      {searchTerm || selectedInsumoId !== "all" || selectedTipo !== "all"
                        ? "Prueba cambiando los criterios de búsqueda o limpiando los filtros."
                        : "Cada vez que cargues o descargues insumos en el modal de edición, quedará registrado aquí con trazabilidad completa."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
