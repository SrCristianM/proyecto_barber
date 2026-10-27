import { useState } from "react";
import { toast } from "sonner";
import {
  Package,
  AlertTriangle,
  Truck,
  Edit2,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  History
} from "lucide-react";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

export default function WarehouseStockTable({
  warehouseItems = [],
  onOpenStockEntry,
  onEditItem,
  onDeleteItem,
  onNewItem,
  onViewMovements = null,
  isSubmitting = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = Array.from(new Set(warehouseItems.map((i) => i.categoria).filter(Boolean)));

  const filteredItems = warehouseItems.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.proveedor_nombre && item.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportExcel = () => {
    if (!filteredItems || filteredItems.length === 0) {
      toast.error("No hay insumos en bodega para exportar.");
      return;
    }

    exportToStyledExcel({
      title: "INVENTARIO GENERAL DE INSUMOS EN BODEGA",
      subtitle: `Control y Existencias de Consumibles | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Insumos Bodega",
      filename: "inventario_bodega_insumos",
      columns: [
        { header: "ID", key: "id_insumo", type: "code", width: 70, align: "center" },
        { header: "Insumo / Descripción", key: "nombre", width: 200 },
        { header: "Categoría", key: "categoria", width: 140 },
        { header: "Unidad de Medida", key: "unidad_medida", width: 130, align: "center" },
        { header: "Stock Actual", key: "stock_actual", type: "number", width: 110, align: "right" },
        { header: "Stock Mínimo", key: "stock_minimo", type: "number", width: 110, align: "right" },
        { header: "Proveedor", key: "proveedor_nombre", width: 180 },
        { header: "Estado Stock", key: "estado_stock", type: "status", width: 120, align: "center" }
      ],
      data: filteredItems.map((item) => {
        const isLow = Number(item.stock_actual) <= Number(item.stock_minimo);
        return {
          id_insumo: `#${item.id_insumo}`,
          nombre: item.nombre,
          categoria: item.categoria || "General",
          unidad_medida: item.unidad_medida || "Unidad",
          stock_actual: Number(item.stock_actual || 0),
          stock_minimo: Number(item.stock_minimo || 0),
          proveedor_nombre: item.proveedor_nombre || "Sin proveedor asignado",
          estado_stock: isLow ? "Por Agotar" : "Disponible"
        };
      })
    });

    toast.success("Inventario de bodega exportado a Excel");
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Botones Superiores */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/40 shadow-sm backdrop-blur-md">
        <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar insumo o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#DFB755]" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenStockEntry(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Cargar Mercancía</span>
          </button>

          <button
            type="button"
            onClick={onNewItem}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-md shadow-[#DDAE41]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Insumo / Descripción</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4 text-center">Stock Actual</th>
              <th className="py-3 px-4 text-center">Stock Mínimo</th>
              <th className="py-3 px-4">Proveedor</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isLow = Number(item.stock_actual) <= Number(item.stock_minimo);
                return (
                  <tr
                    key={item.id_insumo}
                    className={`transition-colors hover:bg-muted/30 ${
                      isLow ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                    }`}
                  >
                    {/* Insumo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground shrink-0">
                          <Package className="w-4 h-4 text-foreground" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{item.nombre}</div>
                          <div className="text-[10px] text-muted-foreground">{item.unidad_medida}</div>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {item.categoria || "General"}
                    </td>

                    {/* Stock Actual */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                          isLow
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {item.stock_actual}
                      </span>
                    </td>

                    {/* Stock Mínimo */}
                    <td className="py-3 px-4 text-center text-muted-foreground font-semibold">
                      {item.stock_minimo}
                    </td>

                    {/* Proveedor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 text-[#E8C466] shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {item.proveedor_nombre || "Distribuidor Oficial"}
                        </span>
                      </div>
                    </td>

                    {/* Estado / Alerta */}
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> Bajo Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Óptimo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenStockEntry(item)}
                          title="Cargar mercancía desde proveedor para este insumo"
                          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>

                        {onViewMovements && (
                          <button
                            type="button"
                            onClick={() => onViewMovements(item)}
                            title={`Ver historial de movimientos y ajustes de ${item.nombre}`}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          title="Editar detalles del insumo"
                          className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onDeleteItem(item.id_insumo)}
                          title="Eliminar insumo de bodega"
                          className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                  No se encontraron insumos de bodega con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
