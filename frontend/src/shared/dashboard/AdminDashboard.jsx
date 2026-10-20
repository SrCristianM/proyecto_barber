import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Scissors,
  Award,
  Crown,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Boxes,
  PackageCheck,
  Layers
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { motion } from "motion/react";
import SpotlightCard from "../../features/admin/shared/components/SpotlightCard";
import { usePermissions } from "../../features/auth/hooks/usePermissions";

const COLORS = ["#C9A24A", "#10b981", "#f59e0b", "#8b5cf6"];

function AnimatedCounter({ value }) {
  const isCurrency = typeof value === "string" && value.startsWith("$");
  const rawNumber = parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const steps = 25;
    const stepTime = Math.abs(Math.floor(duration / steps));
    const increment = rawNumber / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= rawNumber) {
        setCount(rawNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [rawNumber]);

  if (isCurrency) {
    return <span>${count.toLocaleString("es-CO")}</span>;
  }
  return <span>{count}</span>;
}

export default function AdminDashboard() {
  const { isRecepcionista } = usePermissions();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [kpis, setKpis] = useState({
    citasHoy: 0,
    ingresosHoy: 0,
    totalClientes: 0,
    stockCriticoCount: 0
  });
  const [criticalInventory, setCriticalInventory] = useState([]);
  const [topBarbers, setTopBarbers] = useState([]);
  const [salesHistoryData, setSalesHistoryData] = useState([]);
  const [serviceDemandData, setServiceDemandData] = useState([]);

  // Estado para la nueva métrica interactiva de Abastecimiento / Insumos por Barbero
  const [barbersList, setBarbersList] = useState([]);
  const [suppliesPeriod, setSuppliesPeriod] = useState("week"); // 'week' | 'month'
  const [suppliesBarberId, setSuppliesBarberId] = useState("all");
  const [suppliesMetrics, setSuppliesMetrics] = useState({
    total_despachos: 0,
    total_articulos: 0,
    total_costo_estimado: 0,
    top_consumibles: [],
    por_barbero: []
  });

  useEffect(() => {
    try {
      const colombiaNow = new Date().toLocaleString("en-CA", { timeZone: "America/Bogota", hour12: false });
      const todayStr = colombiaNow.split(",")[0].trim();
      const rawApts = localStorage.getItem("barber_appointments_db");
      const rawClients = localStorage.getItem("barber_clients_db");
      const rawUsers = localStorage.getItem("barber_users_db");
      const rawSales = localStorage.getItem("barber_sales_db");
      const rawProducts = localStorage.getItem("barber_products_db");
      const rawBarbers = localStorage.getItem("barber_barbers_db");

      const apts = rawApts ? JSON.parse(rawApts) : [];
      const clients = rawClients ? JSON.parse(rawClients) : [];
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const sales = rawSales ? JSON.parse(rawSales) : [];
      const products = rawProducts ? JSON.parse(rawProducts) : [];
      const barbers = rawBarbers ? JSON.parse(rawBarbers) : [
        { id_barbero: 1, nombre: "Carlos", apellido: "Rodríguez", especialidad: "Corte Clásico & Fade" }
      ];
      setBarbersList(barbers);

      const getBarberName = (id_barbero) => {
        const found = barbers.find((b) => Number(b.id_barbero) === Number(id_barbero));
        return found ? `${found.nombre} ${found.apellido || ""}`.trim() : "Barbero";
      };

      // 1. Citas del Día
      const todayList = Array.isArray(apts) ? apts.filter((a) => a.fecha === todayStr) : [];
      if (todayList.length > 0) {
        const formatted = todayList.map((a) => {
          let clientName = a.cliente_nombre || "";
          if (!clientName || clientName === "Cliente") {
            const foundClient = clients.find(
              (c) =>
                Number(c.id_cliente) === Number(a.id_cliente) ||
                (a.id_usuario && Number(c.id_usuario) === Number(a.id_usuario))
            );
            if (foundClient) {
              clientName = `${foundClient.nombre} ${foundClient.apellido || ""}`.trim();
            } else if (a.id_usuario) {
              const foundUser = users.find((u) => Number(u.id_usuario) === Number(a.id_usuario));
              if (foundUser) clientName = `${foundUser.nombre} ${foundUser.apellido || ""}`.trim();
            }
          }
          if (!clientName) clientName = "Cliente Registrado";

          return {
            time: (a.hora || "09:00").substring(0, 5),
            client: clientName,
            barber: a.barbero_nombre || getBarberName(a.id_barbero),
            service: a.nombre_item || a.servicio_nombre || "Corte Clásico",
            status: a.estado || "Programada"
          };
        });
        setTodayAppointments(formatted);
      } else {
        setTodayAppointments([]);
      }

      // 2. Ventas del Día
      const todaySales = Array.isArray(sales)
        ? sales.filter((s) => s.fecha && s.fecha.startsWith(todayStr) && s.estado !== "Anulada")
        : [];
      const totalIngresos = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);

      // 3. Inventario Crítico
      const critProds = Array.isArray(products)
        ? products
            .filter((p) => p.stock !== undefined && Number(p.stock) <= 5 && p.estado === 1)
            .map((p) => ({
              name: p.nombre,
              stock: Number(p.stock),
              min: 10,
              category: p.categoria || "Insumo",
              percent: Math.min(Math.round((Number(p.stock) / 10) * 100), 100)
            }))
        : [];
      setCriticalInventory(critProds);

      // 4. KPIs
      setKpis({
        citasHoy: todayList.length,
        ingresosHoy: totalIngresos,
        totalClientes: Array.isArray(clients) ? clients.length : 0,
        stockCriticoCount: critProds.length
      });

      // 5. Podio de Barberos
      const podium = barbers.slice(0, 3).map((b, idx) => {
        const bCitas = Array.isArray(apts)
          ? apts.filter((a) => Number(a.id_barbero) === Number(b.id_barbero) && a.estado === "Completada").length
          : 0;
        const bIngresos = 0;

        const medals = [
          { color: "bg-amber-500/20 text-amber-500 border-amber-500/40", badge: "Turno Principal", rank: 1 },
          { color: "bg-slate-300/20 text-slate-300 border-slate-300/40", badge: "Estación 2", rank: 2 },
          { color: "bg-amber-700/20 text-amber-600 border-amber-700/40", badge: "Estación 3", rank: 3 }
        ];

        return {
          rank: medals[idx].rank,
          name: `${b.nombre} ${b.apellido || ""}`.trim(),
          specialty: b.especialidad || "Estilista Profesional",
          citas: bCitas,
          ingresos: `$${bIngresos.toLocaleString("es-CO")}`,
          satisfaction: bCitas > 0 ? "100%" : "—",
          medalColor: medals[idx].color,
          badge: medals[idx].badge
        };
      });
      setTopBarbers(podium);

      // 6. Gráficas
      if (Array.isArray(sales) && sales.length > 0) {
        setSalesHistoryData([]);
      } else {
        setSalesHistoryData([]);
      }

      if (Array.isArray(apts) && apts.length > 0) {
        setServiceDemandData([]);
      } else {
        setServiceDemandData([]);
      }
    } catch {
      // Manejo seguro
    }

    // Sondeo en tiempo real del dashboard y caja cada 4 segundos
    const syncRealtime = () => {
      fetch("/api/dashboard/admin", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && json.data) {
            setKpis((prev) => ({
              ...prev,
              ingresosHoy: json.data.ventas_hoy !== undefined ? Number(json.data.ventas_hoy) : prev.ingresosHoy,
              citasHoy: json.data.citas_hoy !== undefined ? Number(json.data.citas_hoy) : prev.citasHoy,
              stockCriticoCount: json.data.productos_bajo_stock !== undefined ? Number(json.data.productos_bajo_stock) : prev.stockCriticoCount
            }));
          }
        })
        .catch(() => {});

      fetch("/api/sales", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            const freshSales = json.data;
            try {
              localStorage.setItem("barber_sales_db", JSON.stringify(freshSales));
            } catch {}
            const colombiaNow = new Date().toLocaleString("en-CA", { timeZone: "America/Bogota", hour12: false });
            const todayStr = colombiaNow.split(",")[0].trim();
            const todaySales = freshSales.filter((s) => s.fecha && s.fecha.startsWith(todayStr) && s.estado !== "Anulada");
            const totalIngresos = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
            setKpis((prev) => ({
              ...prev,
              ingresosHoy: totalIngresos
            }));
          }
        })
        .catch(() => {});
    };

    syncRealtime();
    const dashInterval = setInterval(syncRealtime, 4000);
    const onWindowFocus = () => syncRealtime();
    window.addEventListener("focus", onWindowFocus);

    return () => {
      clearInterval(dashInterval);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, []);

  // Carga de la métrica de consumo de insumos por barbero
  useEffect(() => {
    const fetchSuppliesMetrics = () => {
      fetch(`/api/dashboard/supplies?period=${suppliesPeriod}&barberId=${suppliesBarberId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && json.data) {
            setSuppliesMetrics(json.data);
          }
        })
        .catch(() => {});
    };

    fetchSuppliesMetrics();
  }, [suppliesPeriod, suppliesBarberId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isRecepcionista ? "Dashboard de Recepción" : "Dashboard Ejecutivo"}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Sistema en Línea
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRecepcionista
              ? "Control operativo de agenda, citas del día, clientes e inventario"
              : "Control financiero, agenda, podio de barberos e inventario"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Sincronización en Tiempo Real</span>
        </div>
      </div>

      {/* KPIs Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SpotlightCard>
          <KPICardContent
            title="Citas Hoy"
            value={kpis.citasHoy}
            change={kpis.citasHoy === 0 ? "Agenda libre" : `${kpis.citasHoy} turno(s) activo(s)`}
            positive={true}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            colorClass="bg-primary/10 text-primary"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Ingresos del Día"
            value={`$${kpis.ingresosHoy.toLocaleString("es-CO")}`}
            change={kpis.ingresosHoy === 0 ? "Sin cobros aún" : "+100% transacciones"}
            positive={true}
            icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
            colorClass="bg-emerald-500/10 text-emerald-500"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Clientes Registrados"
            value={kpis.totalClientes}
            change={kpis.totalClientes === 0 ? "Base limpia" : `${kpis.totalClientes} registrado(s)`}
            positive={true}
            icon={<Users className="h-5 w-5 text-amber-500" />}
            colorClass="bg-amber-500/10 text-amber-500"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Stock Crítico"
            value={kpis.stockCriticoCount}
            change={kpis.stockCriticoCount === 0 ? "Nivel óptimo" : "Requiere compra"}
            positive={kpis.stockCriticoCount === 0}
            icon={<Package className="h-5 w-5 text-rose-500" />}
            colorClass={kpis.stockCriticoCount === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}
          />
        </SpotlightCard>
      </div>

      {/* PODIO DE BARBEROS DEL MES */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Podio de Barberos Destacados</h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Rendimiento acumulado este mes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topBarbers.map((barber) => (
            <motion.div
              key={barber.rank}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-base shadow-xs ${barber.medalColor}`}>
                    #{barber.rank}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{barber.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{barber.specialty}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${barber.medalColor}`}>
                  {barber.badge}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
                <div className="p-2 bg-secondary/30 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Citas</span>
                  <span className="text-xs font-bold text-foreground">{barber.citas}</span>
                </div>
                <div className="p-2 bg-secondary/30 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Recaudado</span>
                  <span className="text-xs font-bold text-emerald-500 truncate block">{barber.ingresos}</span>
                </div>
                <div className="p-2 bg-secondary/30 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Satisfacción</span>
                  <span className="text-xs font-bold text-amber-500">{barber.satisfaction}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* GRÁFICOS: Finanzas (Ingresos vs Egresos) & Demanda de Servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Financiero */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Balance Financiero (Ingresos vs. Egresos)</h3>
              <p className="text-xs text-muted-foreground">Comparativa de Ventas vs Compras a Proveedores</p>
            </div>
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              Histórico
            </span>
          </div>

          {salesHistoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesHistoryData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A24A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A24A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
                <Legend />
                <Area type="monotone" dataKey="ventas" stroke="#C9A24A" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" name="Ingresos (Ventas)" />
                <Area type="monotone" dataKey="compras" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCompras)" name="Egresos (Compras)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-secondary/10 rounded-2xl border border-dashed border-border/80">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground">Sin movimientos financieros registrados</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                El balance entre ventas y compras se graficará automáticamente al registrar las primeras transacciones.
              </p>
            </div>
          )}
        </motion.div>

        {/* Gráfico Demanda de Servicios */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Servicios Más Demandados</h3>
              <p className="text-xs text-muted-foreground">Distribución porcentual por tipo de servicio</p>
            </div>
          </div>

          {serviceDemandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={serviceDemandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={85}
                  dataKey="value"
                >
                  {serviceDemandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-secondary/10 rounded-2xl border border-dashed border-border/80">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Scissors className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground">Sin demanda de servicios registrada</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                La gráfica de distribución porcentual se activará automáticamente a medida que se completen turnos en cabina.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* NUEVA MÉTRICA: CONSUMO DE INSUMOS POR BARBERO (SEMANA / MES) */}
      <motion.div
        variants={itemVariants}
        className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow space-y-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Consumo de Insumos por Barbero
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Gasto en Servicios
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Insumos y consumibles gastados en cabina según el barbero y período seleccionado
              </p>
            </div>
          </div>

          {/* Controles interactivos dentro de la misma métrica */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Selector de Barbero */}
            <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Barbero:</span>
              <select
                value={suppliesBarberId}
                onChange={(e) => setSuppliesBarberId(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-hidden cursor-pointer"
              >
                <option value="all">💈 Todos los Barberos</option>
                {barbersList.map((b) => (
                  <option key={b.id_barbero} value={b.id_barbero}>
                    {b.nombre} {b.apellido || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle de Período (Semana / Mes) */}
            <div className="flex items-center gap-1 p-1 bg-secondary/50 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => setSuppliesPeriod("week")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  suppliesPeriod === "week"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Esta Semana
              </button>
              <button
                type="button"
                onClick={() => setSuppliesPeriod("month")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  suppliesPeriod === "month"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Este Mes
              </button>
            </div>

            {/* Acceso Rápido al Módulo */}
            <Link
              to="/dashboard/abastecimiento"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-1"
            >
              Ver Módulo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Resumen de Valores de la Métrica */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Insumos Gastados
              </span>
              <p className="text-xl font-black text-foreground">
                {Number(suppliesMetrics.total_articulos || 0).toLocaleString("es-CO")}{" "}
                <span className="text-xs font-medium text-muted-foreground">un.</span>
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Boxes className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Costo Operativo Estimado
              </span>
              <p className="text-xl font-black text-amber-500 font-mono">
                ${Number(suppliesMetrics.total_costo_estimado || 0).toLocaleString("es-CO")}
              </p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Vales Despachados
              </span>
              <p className="text-xl font-black text-emerald-500">
                {suppliesMetrics.total_despachos || 0}{" "}
                <span className="text-xs font-medium text-muted-foreground">despacho(s)</span>
              </p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Desglose de Top Insumos Consumidos por el Barbero */}
        {suppliesMetrics.top_consumibles && suppliesMetrics.top_consumibles.length > 0 ? (
          <div className="space-y-2.5 pt-2 border-t border-border/50">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Insumos más gastados en {suppliesPeriod === "week" ? "la semana" : "el mes"} por {suppliesBarberId === "all" ? "el equipo" : "este barbero"}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {suppliesMetrics.top_consumibles.slice(0, 6).map((prod, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-background border border-border rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-foreground truncate pr-2">
                    {prod.nombre}
                  </span>
                  <span className="text-xs font-mono font-bold text-primary shrink-0">
                    {prod.total_cantidad} un.
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center rounded-xl bg-secondary/10 border border-dashed border-border/50 text-xs text-muted-foreground">
            No hay insumos despachados registrados para {suppliesBarberId === "all" ? "ningún barbero" : "este barbero"} en {suppliesPeriod === "week" ? "la semana actual" : "el mes actual"}.
          </div>
        )}
      </motion.div>

      {/* FILA: Citas de Hoy en Vivo & Semáforo de Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de Hoy */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Citas de Hoy en Tiempo Real</h3>
                <p className="text-xs text-muted-foreground">Flujo del turno activo en la barbería</p>
              </div>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {todayAppointments.map((appointment, index) => {
                  const isEnCurso = appointment.status === "En Curso";
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.15 }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isEnCurso
                          ? "border-primary bg-primary/5 shadow-xs barber-pole-badge"
                          : "bg-background border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-foreground font-mono bg-card px-2 py-1 rounded-md border border-border">
                          {appointment.time}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{appointment.client}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Scissors className="h-3 w-3 text-primary" />
                            {appointment.service} · <span className="font-medium text-foreground">{appointment.barber}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        {isEnCurso ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 pulse-gold-glow">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                            En Sillón
                          </span>
                        ) : appointment.status === "Completada" ? (
                          <span className="text-xs font-semibold text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Lista
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border">
                            {appointment.status}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-secondary/10 border border-dashed border-border/80">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-foreground">No hay citas programadas para hoy</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  La agenda se encuentra libre y lista para recibir clientes en todos los turnos.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Semáforo de Inventario Crítico */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Semáforo de Inventario (Bajo Stock)</h3>
              <p className="text-xs text-muted-foreground">Insumos y productos próximos a agotarse</p>
            </div>
            {criticalInventory.length > 0 ? (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                <AlertTriangle className="h-3.5 w-3.5" />
                Alerta Activa ({criticalInventory.length})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Niveles Óptimos
              </span>
            )}
          </div>

          {criticalInventory.length > 0 ? (
            <div className="space-y-3.5">
              {criticalInventory.map((item, idx) => (
                <div key={idx} className="p-3 bg-secondary/20 border border-border/70 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <span className="font-mono font-bold text-rose-500">
                      {item.stock} / {item.min} un.
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border/40">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Categoría: {item.category}</span>
                    <span className="font-semibold text-rose-400">¡Reponer pronto!</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-secondary/10 border border-dashed border-border/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-foreground">Inventario en niveles adecuados</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Todos los productos y herramientas de cabina cuentan con stock suficiente.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Alertas Operativas */}
      <motion.div
        variants={itemVariants}
        className="bg-card border border-border rounded-2xl p-6 shadow-xs"
      >
        <h3 className="text-base font-bold text-foreground mb-3">Alertas Operativas del Sistema</h3>
        <div className="space-y-2.5">
          <AlertItem
            type="success"
            message="Sistema operativo y en línea. Todos los módulos (Citas, Clientes, Ventas e Inventario) se encuentran sincronizados y listos para operar."
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function KPICardContent({ title, value, change, positive, icon, colorClass }) {
  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorClass}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          <AnimatedCounter value={value} />
        </h3>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className={`text-xs font-semibold flex items-center gap-1 ${positive ? "text-emerald-500" : "text-rose-500"}`}>
            <TrendingUp className={`h-3.5 w-3.5 ${!positive && "rotate-180"}`} />
            {change}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">Actualizado hoy</span>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, message }) {
  const colors = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    info: "bg-primary/10 border-primary/20 text-primary",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
  };
  return (
    <motion.div
      whileHover={{ scale: 1.008 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border ${colors[type]}`}
    >
      <AlertCircle className="h-4.5 w-4.5 mt-0.5 shrink-0" />
      <p className="text-xs font-medium text-foreground">{message}</p>
    </motion.div>
  );
}
