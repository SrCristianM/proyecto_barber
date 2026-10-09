import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function SuppliersStats({ stats }) {
  const items = [
    {
      title: "Total Proveedores",
      value: stats.total,
      icon: <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Proveedores Activos",
      value: stats.activos,
      icon: <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Proveedores Inactivos",
      value: stats.inactivos,
      icon: <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />,
      color: "text-destructive"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-5">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className={`gold-card p-3 sm:p-5 flex items-center justify-between ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1">
              {item.title}
            </span>
            <p className={`text-xl sm:text-3xl font-extrabold ${item.color}`}>{item.value}</p>
          </div>
          <div className="p-2 sm:p-3.5 bg-secondary/50 rounded-xl sm:rounded-2xl border border-border/40 shrink-0">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
