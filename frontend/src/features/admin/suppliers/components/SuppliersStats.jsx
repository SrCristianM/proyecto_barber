import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function SuppliersStats({ stats }) {
  const items = [
    {
      title: "Total Proveedores",
      value: stats.total,
      icon: <Building2 className="h-5 w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Proveedores Activos",
      value: stats.activos,
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Proveedores Inactivos",
      value: stats.inactivos,
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      color: "text-destructive"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
            <p className={`text-3xl font-extrabold ${item.color}`}>{item.value}</p>
          </div>
          <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/40">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
