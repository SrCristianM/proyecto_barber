import { Package, PackageCheck, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

export default function ProductsStats({ products = [] }) {
  const total = products.length;
  const activos = products.filter((p) => p.estado === 1).length;
  const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

  const items = [
    {
      title: "Total Productos",
      value: total,
      icon: <Package className="h-5 w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Productos Activos",
      value: activos,
      icon: <PackageCheck className="h-5 w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Stock Bajo / Agotado",
      value: lowStock,
      icon: <AlertTriangle className={`h-5 w-5 ${lowStock > 0 ? "text-destructive" : "text-muted-foreground"}`} />,
      color: lowStock > 0 ? "text-destructive" : "text-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-5">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className={`gold-card p-3 sm:p-5 flex items-center justify-between ${
            index === 2 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              {item.title}
            </span>
            <h3 className={`text-xl sm:text-3xl font-extrabold ${item.color}`}>{item.value}</h3>
          </div>
          <div className="p-2 sm:p-3.5 bg-secondary/50 rounded-xl sm:rounded-2xl border border-border/40 shrink-0">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
