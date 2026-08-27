import { DollarSign, Calendar, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

export default function SalesStats({ totalToday, totalMonth, averageTicket }) {
  const items = [
    {
      title: "Ventas de Hoy",
      value: `$${Number(totalToday).toLocaleString("es-CO")}`,
      subtitle: "+12% vs ayer",
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Ventas del Mes",
      value: `$${Number(totalMonth).toLocaleString("es-CO")}`,
      subtitle: "+8% vs mes anterior",
      icon: <Calendar className="h-5 w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Ticket Promedio",
      value: `$${Number(averageTicket).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`,
      subtitle: "+5% vs promedio histórico",
      icon: <ShoppingCart className="h-5 w-5 text-warning" />,
      color: "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="gold-card p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              {item.title}
            </span>
            <h3 className={`text-3xl font-extrabold ${item.color}`}>{item.value}</h3>
            <p className="text-xs text-success mt-1 font-semibold">{item.subtitle}</p>
          </div>
          <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/40">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
