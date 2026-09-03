import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Scissors,
  Award,
  Crown,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
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

const salesData = [
  { month: "Ene", ventas: 4500, servicios: 3200, compras: 1800 },
  { month: "Feb", ventas: 5200, servicios: 3800, compras: 2100 },
  { month: "Mar", ventas: 4800, servicios: 3500, compras: 1900 },
  { month: "Abr", ventas: 6100, servicios: 4200, compras: 2400 },
  { month: "May", ventas: 5900, servicios: 4000, compras: 2200 },
  { month: "Jun", ventas: 7200, servicios: 4800, compras: 2600 }
];

const servicesData = [
  { name: "Corte Clásico", value: 35 },
  { name: "Corte + Barba", value: 28 },
  { name: "Afeitado", value: 18 },
  { name: "Diseño", value: 19 }
];

const topBarbersPodium = [
  {
    rank: 1,
    name: "Carlos Rodríguez",
    specialty: "Degradados & Diseños",
    citas: 58,
    ingresos: "$2.320.000",
    satisfaction: "99%",
    medalColor: "bg-amber-500/20 text-amber-500 border-amber-500/40",
    avatarBg: "from-amber-500/20 to-yellow-500/10",
    badge: "Top 1 del Mes"
  },
  {
    rank: 2,
    name: "Miguel Ángel",
    specialty: "Barba & Afeitado Spa",
    citas: 49,
    ingresos: "$1.960.000",
    satisfaction: "98%",
    medalColor: "bg-slate-300/20 text-slate-300 border-slate-300/40",
    avatarBg: "from-slate-400/20 to-slate-200/10",
    badge: "Top 2"
  },
  {
    rank: 3,
    name: "Javier Torres",
    specialty: "Corte Clásico & Tijera",
    citas: 44,
    ingresos: "$1.760.000",
    satisfaction: "96%",
    medalColor: "bg-amber-700/20 text-amber-600 border-amber-700/40",
    avatarBg: "from-amber-700/20 to-amber-600/10",
    badge: "Top 3"
  }
];

const criticalInventory = [
  { name: "Cera Modeladora Matte", stock: 2, min: 10, category: "Fijación", percent: 20 },
  { name: "Gel Fijador Extra Fuerte", stock: 3, min: 15, category: "Fijación", percent: 20 },
  { name: "Aceite Hidratante para Barba", stock: 4, min: 12, category: "Cuidado Barba", percent: 33 },
  { name: "Cuchillas Barbería (Caja x100)", stock: 5, min: 20, category: "Insumo", percent: 25 }
];

const COLORS = ["#C9A24A", "#10b981", "#f59e0b", "#8b5cf6"];

const todayAppointments = [
  { time: "09:00", client: "Juan Pérez", barber: "Carlos", service: "Corte Clásico", status: "Completada" },
  { time: "10:00", client: "María García", barber: "Miguel", service: "Corte + Barba", status: "En Curso" },
  { time: "11:00", client: "Pedro López", barber: "Javier", service: "Afeitado", status: "Programada" },
  { time: "12:00", client: "Ana Torres", barber: "Luis", service: "Diseño", status: "Programada" }
];

function AnimatedCounter({ value }) {
  const isCurrency = typeof value === "string" && value.startsWith("$");
  const rawNumber = parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const steps = 30;
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
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Ejecutivo</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Tiempo Real
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Control financiero, agenda, podio de barberos e inventario</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Última sincronización: Hace unos instantes</span>
        </div>
      </div>

      {/* KPIs con Spotlight Hover Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SpotlightCard>
          <KPICardContent
            title="Citas Hoy"
            value="18"
            change="+12% vs ayer"
            positive={true}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            colorClass="bg-primary/10 text-primary"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Ingresos del Día"
            value="$680.000"
            change="+18.5%"
            positive={true}
            icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
            colorClass="bg-emerald-500/10 text-emerald-500"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Margen Operativo"
            value="64%"
            change="+4.2% este mes"
            positive={true}
            icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
            colorClass="bg-amber-500/10 text-amber-500"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Stock Crítico"
            value="4"
            change="Requiere compra"
            positive={false}
            icon={<Package className="h-5 w-5 text-rose-500" />}
            colorClass="bg-rose-500/10 text-rose-500"
          />
        </SpotlightCard>
      </div>

      {/* PODIO TOP 3 BARBEROS DEL MES */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Podio de Barberos Destacados</h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Rendimiento acumulado este mes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topBarbersPodium.map((barber) => (
            <motion.div
              key={barber.rank}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden flex flex-col justify-between`}
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
        {/* Gráfico Financiero: Ventas vs Compras */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Balance Financiero (Ingresos vs. Egresos)</h3>
              <p className="text-xs text-muted-foreground">Comparativa de Ventas vs Compras a Proveedores ($K)</p>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              +63.8% Margen
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={85}
                dataKey="value"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

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
            <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alerta Activa
            </span>
          </div>

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
            type="warning"
            message="El stock de Gel Fijador Extra Fuerte y Cera Modeladora está por debajo del mínimo sugerido (3 unidades restantes)."
          />
          <AlertItem
            type="info"
            message="5 clientes Oro han agendado citas para esta semana con recordatorio enviado."
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

