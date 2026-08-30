import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, Package, TrendingUp, Clock, AlertCircle, Sparkles, CheckCircle2, Scissors } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";
import SpotlightCard from "../../features/admin/shared/components/SpotlightCard";

const salesData = [
  { month: "Ene", ventas: 4500, servicios: 3200 },
  { month: "Feb", ventas: 5200, servicios: 3800 },
  { month: "Mar", ventas: 4800, servicios: 3500 },
  { month: "Abr", ventas: 6100, servicios: 4200 },
  { month: "May", ventas: 5900, servicios: 4000 },
  { month: "Jun", ventas: 7200, servicios: 4800 }
];

const servicesData = [
  { name: "Corte Clásico", value: 35 },
  { name: "Corte + Barba", value: 28 },
  { name: "Afeitado", value: 18 },
  { name: "Diseño", value: 19 }
];

const barberPerformance = [
  { name: "Carlos", citas: 45, ingresos: 1800 },
  { name: "Miguel", citas: 38, ingresos: 1520 },
  { name: "Javier", citas: 42, ingresos: 1680 },
  { name: "Luis", citas: 35, ingresos: 1400 }
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Tiempo Real
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Resumen de operaciones y métricas de la barbería</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Última sincronización: Hace unos instantes</span>
        </div>
      </div>

      {/* KPIs con Spotlight Hover Effect y Contadores */}
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
            icon={<DollarSign className="h-5 w-5 text-success" />}
            colorClass="bg-success/10 text-success"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Clientes Nuevos"
            value="8"
            change="+25%"
            positive={true}
            icon={<Users className="h-5 w-5 text-amber-500" />}
            colorClass="bg-amber-500/10 text-amber-500"
          />
        </SpotlightCard>

        <SpotlightCard>
          <KPICardContent
            title="Stock en Alerta"
            value="3"
            change="-2 resueltos"
            positive={false}
            icon={<Package className="h-5 w-5 text-destructive" />}
            colorClass="bg-destructive/10 text-destructive"
          />
        </SpotlightCard>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Ventas y Servicios</h3>
              <p className="text-xs text-muted-foreground">Evolución semestral en miles ($K)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#C9A24A" strokeWidth={3} name="Ventas ($K)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="servicios" stroke="#10b981" strokeWidth={2.5} name="Servicios ($K)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Servicios Más Demandados</h3>
              <p className="text-xs text-muted-foreground">Distribución porcentual por tipo de corte</p>
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

      {/* Charts Row 2 & Citas Activas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Rendimiento por Barbero</h3>
              <p className="text-xs text-muted-foreground">Citas atendidas vs Ingresos generados</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barberPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
              <Legend />
              <Bar dataKey="citas" fill="#C9A24A" name="Citas" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos ($K)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Citas de Hoy en Tiempo Real</h3>
                <p className="text-xs text-muted-foreground">Estado y flujo del turno actual</p>
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
                        <span className="text-xs font-semibold text-success px-2.5 py-1 rounded-full bg-success/10 border border-success/20 flex items-center gap-1">
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
      </div>

      {/* Alertas */}
      <motion.div
        variants={itemVariants}
        className="bg-card border border-border rounded-2xl p-6 shadow-xs"
      >
        <h3 className="text-base font-bold text-foreground mb-3">Alertas Operativas</h3>
        <div className="space-y-2.5">
          <AlertItem
            type="warning"
            message="El stock de Gel Fijador Premium está bajo (3 unidades restantes en almacén)."
          />
          <AlertItem
            type="info"
            message="3 clientes agendaron citas online para el turno de la tarde."
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
          <span className={`text-xs font-semibold flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
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
    warning: "bg-warning/10 border-warning/20 text-warning",
    info: "bg-primary/10 border-primary/20 text-primary",
    success: "bg-success/10 border-success/20 text-success"
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
