import { DollarSign, ShoppingBag, TrendingUp, CheckCircle, Ban } from "lucide-react";
import { motion } from "motion/react";

export default function PurchasesStats({
  totalToday,
  totalMonth,
  averagePurchase,
  countRegistradas,
  countAnuladas
}) {
  const stats = [
    {
      title: "Compras del Mes",
      value: `$${Number(totalMonth).toLocaleString("es-CO")}`,
      subtitle: `${countRegistradas} compras activas`,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      color: "text-primary"
    },
    {
      title: "Compras de Hoy",
      value: `$${Number(totalToday).toLocaleString("es-CO")}`,
      subtitle: "Inversión del día",
      icon: <ShoppingBag className="h-5 w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Ticket Promedio",
      value: `$${Number(averagePurchase).toLocaleString("es-CO")}`,
      subtitle: "Promedio por orden",
      icon: <TrendingUp className="h-5 w-5 text-warning" />,
      color: "text-warning"
    },
    {
      title: "Estado de Compras",
      value: `${countRegistradas}`,
      subtitle: `${countAnuladas} anuladas`,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      color: "text-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.title}</p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtitle}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
