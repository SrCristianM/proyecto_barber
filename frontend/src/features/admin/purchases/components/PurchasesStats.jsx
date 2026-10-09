import { DollarSign, ShoppingBag, TrendingUp, CheckCircle } from "lucide-react";
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
      subtitle: `${countRegistradas} compras`,
      icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
      color: "text-primary"
    },
    {
      title: "Compras de Hoy",
      value: `$${Number(totalToday).toLocaleString("es-CO")}`,
      subtitle: "Inversión hoy",
      icon: <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Ticket Promedio",
      value: `$${Number(averagePurchase).toLocaleString("es-CO")}`,
      subtitle: "Por orden",
      icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />,
      color: "text-warning"
    },
    {
      title: "Estado Compras",
      value: `${countRegistradas}`,
      subtitle: `${countAnuladas} anuladas`,
      icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />,
      color: "text-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      {stats.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="gold-card p-3 sm:p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1">
              {item.title}
            </span>
            <p className={`text-base sm:text-2xl font-extrabold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium">{item.subtitle}</p>
          </div>
          <div className="p-2 sm:p-3.5 bg-secondary/50 rounded-xl sm:rounded-2xl border border-border/40 shrink-0">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
