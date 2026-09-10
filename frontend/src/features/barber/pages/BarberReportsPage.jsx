import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scissors,
  Search,
  Eye,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  Download
} from "lucide-react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
import Modal from "../../admin/shared/components/Modal";
import { getBarberReports, getCurrentBarberProfile } from "../services/barberStorageService";

export default function BarberReportsPage() {
  const [activeTab, setActiveTab] = useState("programadas"); // 'programadas' | 'completadas'
  const [reportsData, setReportsData] = useState({
    totalProgramadas: 0,
    totalCompletadas: 0,
    citasProgramadas: [],
    citasCompletadas: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [barber, setBarber] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setLoading(true);
    const profile = getCurrentBarberProfile();
    setBarber(profile);
    const data = getBarberReports();
    setReportsData(data);
    setLoading(false);
  };

  const currentList =
    activeTab === "programadas"
      ? reportsData.citasProgramadas
      : reportsData.citasCompletadas;

  // Filtrado de la lista activa
  const filteredList = currentList.filter((apt) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      (apt.cliente_nombre || "").toLowerCase().includes(search) ||
      (apt.servicio_nombre || "").toLowerCase().includes(search) ||
      (apt.fecha || "").includes(search) ||
      String(apt.id_cita).includes(search)
    );
  });

  const handleExportCSV = () => {
    const listToExport = filteredList;
    if (!listToExport || listToExport.length === 0) {
      toast.error("No hay registros para exportar en este reporte.");
      return;
    }

    const headers = [
      "ID Cita",
      "Cliente",
      "Telefono",
      "Fecha",
      "Hora",
      "Servicio",
      "Paquete",
      "Precio (COP)",
      "Estado"
    ];

    const rows = listToExport.map((apt) => [
      `#${apt.id_cita}`,
      `"${(apt.cliente_nombre || "").replace(/"/g, '""')}"`,
      `"${(apt.cliente_telefono || "").replace(/"/g, '""')}"`,
      apt.fecha,
      apt.hora,
      `"${(apt.servicio_nombre || "").replace(/"/g, '""')}"`,
      `"${(apt.paquete_nombre || "N/A").replace(/"/g, '""')}"`,
      Number(apt.precio || apt.servicio_precio || 0),
      apt.estado
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `reporte_citas_${activeTab}_${barber?.nombre || "barbero"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Reporte descargado: ${fileName}`);
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-[#DFB755]/15 text-[#DFB755] border-[#DFB755]/30";
      case "Completada":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Cancelada":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Reportes de Citas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Métricas del Barbero
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Informes oficiales de citas programadas y completadas para {barber?.nombre} {barber?.apellido}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground hover:text-[#DFB755] font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-[#DFB755]" />
          <span>Exportar a CSV (Excel)</span>
        </button>
      </div>

      {/* TARJETAS RESUMEN DE REPORTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Citas Programadas */}
        <div
          onClick={() => setActiveTab("programadas")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "programadas"
              ? "bg-[#DFB755]/10 border-[#DFB755] shadow-md shadow-[#DFB755]/15"
              : "bg-card border-border hover:border-[#DFB755]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Citas Programadas
            </span>
            <div className="p-2 rounded-xl bg-[#DFB755]/15 text-[#DFB755]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {reportsData.totalProgramadas}
            </span>
            <span className="text-xs text-muted-foreground font-medium">por atender</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Próximas atenciones en agenda
          </p>
        </div>

        {/* Citas Completadas */}
        <div
          onClick={() => setActiveTab("completadas")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "completadas"
              ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/15"
              : "bg-card border-border hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Citas Completadas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500">
              {reportsData.totalCompletadas}
            </span>
            <span className="text-xs text-muted-foreground font-medium">atendidas</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Histórico de servicios finalizados
          </p>
        </div>

        {/* Efectividad del Barbero */}
        <div className="p-5 rounded-2xl bg-card border border-border sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Gestionadas
            </span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {reportsData.totalProgramadas + reportsData.totalCompletadas}
            </span>
            <span className="text-xs text-muted-foreground font-medium">citas en sistema</span>
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">
            Registro exclusivo de tu usuario
          </p>
        </div>
      </div>

      {/* PESTAÑAS DE REPORTE */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("programadas")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "programadas"
              ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md shadow-[#DDAE41]/25"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Reporte: Citas Programadas ({reportsData.totalProgramadas})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completadas")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "completadas"
              ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md shadow-[#DDAE41]/25"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Reporte: Citas Completadas ({reportsData.totalCompletadas})</span>
        </button>
      </div>

      {/* FILTRO DE BÚSQUEDA */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar en reporte de citas ${activeTab} por cliente, servicio o fecha...`}
            className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* TABLA DEL REPORTE */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#DFB755]" />
            <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">
              {activeTab === "programadas" ? "Citas Programadas" : "Citas Completadas"} — Total: {filteredList.length}
            </h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {barber?.nombre} {barber?.apellido}
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">
              No hay citas {activeTab} registradas para los criterios seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/10 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4 sm:px-6">Cita</th>
                  <th className="py-3.5 px-4 sm:px-6">Fecha</th>
                  <th className="py-3.5 px-4 sm:px-6">Hora</th>
                  <th className="py-3.5 px-4 sm:px-6">Cliente</th>
                  <th className="py-3.5 px-4 sm:px-6">Servicio</th>
                  <th className="py-3.5 px-4 sm:px-6">Estado</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {filteredList.map((apt) => (
                  <tr key={apt.id_cita} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-foreground">
                      #{apt.id_cita}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-bold text-foreground">
                      {apt.fecha}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-mono text-muted-foreground">
                      {apt.hora}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-foreground">
                      {apt.cliente_nombre}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-muted-foreground">
                      {apt.paquete_nombre || apt.servicio_nombre}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(apt.estado)}`}>
                        {apt.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(apt)}
                        className="px-3 py-1.5 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE CITA EN REPORTE */}
      {selectedAppointment && (
        <Modal
          title={`Detalle de Cita #${selectedAppointment.id_cita}`}
          onClose={() => setSelectedAppointment(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{selectedAppointment.estado}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(selectedAppointment.estado)}`}>
                {selectedAppointment.estado}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-1.5 text-xs">
              <span className="text-muted-foreground font-bold block uppercase tracking-wider">Cliente:</span>
              <p className="text-sm font-black text-foreground">{selectedAppointment.cliente_nombre}</p>
              {selectedAppointment.cliente_telefono && (
                <p className="text-muted-foreground">Teléfono: {selectedAppointment.cliente_telefono}</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">
                  {selectedAppointment.paquete_nombre || selectedAppointment.servicio_nombre}
                </span>
                <span className="font-black text-[#DFB755]">
                  ${Number(selectedAppointment.precio || selectedAppointment.servicio_precio || 0).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground font-bold">Fecha:</span>
                  <p className="font-extrabold text-foreground">{selectedAppointment.fecha}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">Hora:</span>
                  <p className="font-extrabold text-foreground">{selectedAppointment.hora}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
