import { useState } from "react";
import { Plus, Boxes, BarChart3, History, RotateCcw, Download, Sparkles, User, FileSpreadsheet } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { usePermissions } from "../../../auth/hooks/usePermissions";
import { useSupplies } from "../hooks/useSupplies";
import SuppliesStats from "../components/SuppliesStats";
import SuppliesTable from "../components/SuppliesTable";
import SupplyFormModal from "../components/SupplyFormModal";
import SupplyDetailModal from "../components/SupplyDetailModal";
import SuppliesBarberAnalytics from "../components/SuppliesBarberAnalytics";
import SearchBar from "../../shared/components/SearchBar";
import StatusFilterPills from "../../shared/components/StatusFilterPills";
import FilterSelect from "../../shared/components/FilterSelect";
import DateRangeFilter from "../../shared/components/DateRangeFilter";
import ConfirmModal from "../../shared/components/ConfirmModal";
import { toast } from "sonner";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";

export default function SuppliesPage({ embedded = false }) {
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'analytics'
  const {
    filteredSupplies,
    barbers,
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    barberFilter,
    setBarberFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortField,
    sortDir,
    handleSort,
    hasActiveFilters,
    resetFilters,
    formData,
    setFormData,
    addItemToSupply,
    updateItemQuantity,
    removeItemFromSupply,
    resetForm,
    showCreateModal,
    setShowCreateModal,
    showDetailModal,
    setShowDetailModal,
    showCancelModal,
    setShowCancelModal,
    selectedSupply,
    setSelectedSupply,
    handleCreateSupply,
    handleCancelSupply,
    quickStats,
    metrics,
    metricsPeriod,
    setMetricsPeriod,
    metricsBarber,
    setMetricsBarber,
    fetchMetrics
  } = useSupplies();

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("abastecimiento", "crear");
  const canAnular = hasPermission("abastecimiento", "anular");

  const triggerGoldenConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#C9A24A", "#E5C875", "#FFFFFF"]
      });
    } catch { }
  };

  const onSubmitCreate = async () => {
    try {
      const created = await handleCreateSupply();
      if (created) {
        triggerGoldenConfetti();
        toast.success(`Despacho registrado correctamente (#AB-${String(created.id_abastecimiento || "").padStart(5, "0")})`);
      }
    } catch (err) {
      toast.error(err.message || "Error al registrar abastecimiento");
    }
  };

  const onConfirmCancel = async () => {
    try {
      await handleCancelSupply();
      toast.success("Abastecimiento anulado y stock restituido al inventario con éxito");
    } catch (err) {
      toast.error(err.message || "Error al anular abastecimiento");
    }
  };
  // Exportar a Excel con formato y diseño profesional
  const handleExportExcel = () => {
    if (!filteredSupplies || filteredSupplies.length === 0) {
      toast.error("No hay registros de despachos para exportar.");
      return;
    }

    exportToStyledExcel({
      title: "REGISTRO DE VALES DE DESPACHO Y ABASTECIMIENTO",
      subtitle: `Consumibles de Cabina y Puestos de Barbería | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Abastecimientos",
      filename: "abastecimientos_insumos",
      columns: [
        { header: "Folio", key: "folio", type: "code", width: 95, align: "center" },
        { header: "Barbero Responsable", key: "barbero_nombre", width: 180 },
        { header: "Fecha Despacho", key: "fecha", type: "date", width: 120, align: "center" },
        { header: "Insumos (Unidades)", key: "insumos_totales", type: "number", width: 130, align: "right" },
        { header: "Costo Estimado", key: "total_estimado", type: "currency", width: 135, align: "right" },
        { header: "Estado", key: "estado", type: "status", width: 110, align: "center" },
        { header: "Observaciones", key: "observaciones", width: 240 }
      ],
      data: filteredSupplies.map((s) => ({
        folio: `AB-${String(s.id_abastecimiento).padStart(5, "0")}`,
        barbero_nombre: s.barbero_nombre || "Barbero General",
        fecha: s.fecha || "—",
        insumos_totales: (s.detalles || []).reduce((acc, d) => acc + Number(d.cantidad || 0), 0),
        total_estimado: Number(s.total_estimado || 0),
        estado: s.estado || "Completado",
        observaciones: s.observaciones || "Sin observaciones"
      }))
    });

    toast.success("Historial de abastecimientos exportado a Excel");
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo (solo cuando no está embebido en otra pestaña) */}
      {!embedded ? (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Módulo de Abastecimiento
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Boxes className="w-3.5 h-3.5" />
                Consumibles de Cabina
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gestión de insumos y productos suministrados a barberos durante los servicios (descuento de stock sin impacto en caja)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border/40 bg-card hover:bg-secondary text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#DFB755]" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-white text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nuevo Despacho
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Barra de Acciones de Vales cuando está embebido en la pestaña */
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-card/60 border border-border/40 shadow-sm backdrop-blur-md">
          <div>
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              Vales de Despacho y Consumo
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DFB755]/15 text-[#DFB755] font-black border border-[#DFB755]/30">
                Historial de Salidas
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Registro histórico de insumos entregados a cada barbero con restitución de stock al anular.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#DFB755]" />
              <span>Exportar Excel</span>
            </button>

            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Despacho</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pestañas de Navegación del Módulo (Historial vs Análisis por Barbero) - Solo si no está embebido */}
      {!embedded && (
        <div className="flex items-center gap-2 border-b border-border/40 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "history"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
          >
            <History className="w-4 h-4" />
            Historial de Despachos
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("analytics");
              fetchMetrics(metricsPeriod, metricsBarber);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === "analytics"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Control y Consumo por Barbero
          </button>
        </div>
      )}

      {(activeTab === "history" || embedded) && (
        <div className="space-y-6">
          {/* Tarjetas de Estadísticas Rápidas */}
          <SuppliesStats stats={quickStats} />

          {/* Barra de Filtros y Búsqueda Estandarizada */}
          <div className="bg-card/60 border border-border/40 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Buscador */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por barbero, insumo, folio..."
                  maxWidthClass="w-full sm:w-64"
                />

                {/* Filtro de Estado con Pills */}
                <StatusFilterPills
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { key: "all", label: "Todos" },
                    { key: "Registrado", label: "Registrados" },
                    { key: "Anulado", label: "Anulados" }
                  ]}
                />

                {/* Filtro FK Barbero con SearchableSelect */}
                <FilterSelect
                  label="Barbero"
                  value={barberFilter}
                  onChange={setBarberFilter}
                  placeholder="Todos los barberos"
                  icon={<User className="h-3.5 w-3.5 text-primary" />}
                  options={(barbers || []).map((b) => ({
                    value: b.id_barbero,
                    label: `${b.nombre} ${b.apellido || ""}`.trim(),
                    subtitle: b.especialidad || "Barbero Profesional"
                  }))}
                  className="min-w-[190px]"
                />

                {/* Rango de Fechas */}
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onClear={() => { setStartDate(""); setEndDate(""); }}
                />

                {/* Limpiar Filtros */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-2 px-3 rounded-xl border border-border hover:bg-secondary transition-colors cursor-pointer"
                    title="Limpiar todos los filtros"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {/* Contador de Registros */}
              <div className="text-xs text-muted-foreground shrink-0 pl-1 lg:pl-0">
                Mostrando <strong className="text-foreground font-mono font-bold">{filteredSupplies.length}</strong> vales
              </div>
            </div>
          </div>

          {/* Tabla de Abastecimientos */}
          <SuppliesTable
            supplies={filteredSupplies}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onViewDetail={(item) => {
              setSelectedSupply(item);
              setShowDetailModal(true);
            }}
            onCancelSupply={(item) => {
              setSelectedSupply(item);
              setShowCancelModal(true);
            }}
            canAnular={canAnular}
          />
        </div>
      )}

      {activeTab === "analytics" && (
        <SuppliesBarberAnalytics
          metrics={metrics}
          barbers={barbers}
          period={metricsPeriod}
          onPeriodChange={setMetricsPeriod}
          selectedBarberId={metricsBarber}
          onBarberChange={setMetricsBarber}
          loading={loading}
        />
      )}

      {/* Modal de Nuevo Abastecimiento */}
      {showCreateModal && (
        <SupplyFormModal
          formData={formData}
          setFormData={setFormData}
          barbers={barbers}
          products={products}
          onAddItem={addItemToSupply}
          onUpdateItemQuantity={updateItemQuantity}
          onRemoveItem={removeItemFromSupply}
          onSubmit={onSubmitCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal de Detalle / Vale de Despacho */}
      {showDetailModal && selectedSupply && (
        <SupplyDetailModal
          supply={selectedSupply}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSupply(null);
          }}
          onCancel={(item) => {
            setShowDetailModal(false);
            setSelectedSupply(item);
            setShowCancelModal(true);
          }}
          canAnular={canAnular}
        />
      )}

      {/* Modal de Confirmación de Anulación */}
      {showCancelModal && selectedSupply && (
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedSupply(null);
          }}
          onConfirm={onConfirmCancel}
          title="¿Anular este Abastecimiento?"
          message={`¿Estás seguro de anular el vale AB-${String(selectedSupply.id_abastecimiento).padStart(5, "0")} despachado a ${selectedSupply.barbero_nombre}? Los insumos consumidos se restituirán automáticamente al inventario.`}
          confirmText="Sí, Anular y Reponer Stock"
          type="danger"
        />
      )}
    </div>
  );
}
