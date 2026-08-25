import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, Package, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";

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

const COLORS = ["#DAA520", "#10b981", "#f59e0b", "#8b5cf6"];

const todayAppointments = [
  { time: "09:00", client: "Juan Pérez", barber: "Carlos", service: "Corte Clásico", status: "Completada" },
  { time: "10:00", client: "María García", barber: "Miguel", service: "Corte + Barba", status: "Programada" },
  { time: "11:00", client: "Pedro López", barber: "Javier", service: "Afeitado", status: "Programada" },
  { time: "12:00", client: "Ana Torres", barber: "Luis", service: "Diseño", status: "Reprogramada" }
];

function AnimatedCounter({ value }) {
  const isCurrency = typeof value === "string" && value.startsWith("$");
  const rawNumber = parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu barbería</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: Hace 5 minutos</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Citas Hoy"
          value="12"
          change="+8%"
          positive={true}
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
        <KPICard
          title="Ingresos Hoy"
          value="$480.000"
          change="+12%"
          positive={true}
          icon={<DollarSign className="h-6 w-6 text-success" />}
        />
        <KPICard
          title="Clientes Nuevos"
          value="5"
          change="+20%"
          positive={true}
          icon={<Users className="h-6 w-6 text-warning" />}
        />
        <KPICard
          title="Stock Bajo"
          value="3"
          change="-2"
          positive={false}
          icon={<Package className="h-6 w-6 text-destructive" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-lg p-6 shadow-xs"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Ventas y Servicios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#DAA520" strokeWidth={2} name="Ventas ($K)" />
              <Line type="monotone" dataKey="servicios" stroke="#10b981" strokeWidth={2} name="Servicios ($K)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-lg p-6 shadow-xs"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Servicios Más Populares</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-lg p-6 shadow-xs"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Rendimiento de Barberos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barberPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend />
              <Bar dataKey="citas" fill="#DAA520" name="Citas" />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos ($K)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-lg p-6 shadow-xs"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Citas de Hoy</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {todayAppointments.map((appointment, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-foreground">{appointment.time}</div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{appointment.client}</p>
                    <p className="text-xs text-muted-foreground">{appointment.service} - {appointment.barber}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === "Completada"
                      ? "bg-success/10 text-success"
                      : appointment.status === "Programada"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {appointment.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div
        variants={itemVariants}
        className="bg-card border border-border rounded-lg p-6 shadow-xs"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Alertas y Notificaciones</h3>
        <div className="space-y-3">
          <AlertItem
            type="warning"
            message="El stock de gel para cabello está bajo (2 unidades restantes)"
          />
          <AlertItem
            type="info"
            message="Tienes 3 citas programadas para mañana"
          />
          <AlertItem
            type="success"
            message="Has alcanzado tu meta de ventas del mes"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function KPICard({ title, value, change, positive, icon }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card border border-border rounded-lg p-6 shadow-xs hover:shadow-md transition-shadow cursor-default"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="p-2 bg-secondary/50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between mt-3">
        <h3 className="text-3xl font-bold text-foreground tracking-tight">
          <AnimatedCounter value={value} />
        </h3>
        <span className={`text-sm font-medium flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
          <TrendingUp className={`h-4 w-4 ${!positive && "rotate-180"}`} />
          {change}
        </span>
      </div>
    </motion.div>
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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]}`}
    >
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </motion.div>
  );
}
