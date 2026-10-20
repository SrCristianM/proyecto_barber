import { useState } from "react";
import { Plus, Boxes, BarChart3, History, RotateCcw, Download, Sparkles } from "lucide-react";
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

export default function SuppliesPage() {
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
    } catch {}
  };

  const onSubmitCreate = async () => {
    try {
      await handleCreateSupply();
      triggerGoldenConfetti();
    } catch (err) {
      alert(err.message || "Error al registrar abastecimiento");
    }
  };

  const onConfirmCancel = async () => {
    try {
      await handleCancelSupply();
    } catch (err) {
      alert(err.message || "Error al anular abastecimiento");
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (!filteredSupplies || filteredSupplies.length === 0) return;
    const headers = ["Folio", "Barbero", "Fecha", "Insumos_Totales", "Costo_Estimado", "Estado", "Observaciones"];
    const rows = filteredSupplies.map((s) => [
      `AB-${String(s.id_abastecimiento).padStart(5, "0")}`,
      `"${s.barbero_nombre || ""}"`,
      s.fecha,
      (s.detalles || []).reduce((acc, d) => acc + Number(d.cantidad || 0), 0),
      s.total_estimado,
      s.estado,
      `"${(s.observaciones || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Abastecimientos_Barberia_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
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
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Despacho
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de Navegación del Módulo (Historial vs Análisis por Barbero) */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "history"
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Control y Consumo por Barbero
        </button>
      </div>

      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Tarjetas de Estadísticas Rápidas */}
          <SuppliesStats stats={quickStats} />

          {/* Barra de Filtros y Búsqueda */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por barbero, insumo, folio..."
                />
              </div>

              <div className="sm:col-span-3">
                <FilterSelect
                  label="Barbero"
                  value={barberFilter}
                  onChange={setBarberFilter}
                  options={[
                    { value: "all", label: "Todos los barberos" },
                    ...barbers.map((b) => ({
                      value: b.id_barbero,
                      label: `${b.nombre} ${b.apellido || ""}`.trim()
                    }))
                  ]}
                />
              </div>

              <div className="sm:col-span-5 flex items-center gap-2 flex-wrap sm:justify-end">
                <StatusFilterPills
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: "Registrado", label: "Registrado" },
                    { value: "Anulado", label: "Anulado" }
                  ]}
                />

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Limpiar filtros"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rango de fechas */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50 flex-wrap">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
              <span className="text-xs text-muted-foreground">
                Mostrando <strong className="text-foreground">{filteredSupplies.length}</strong> vales de abastecimiento
              </span>
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
