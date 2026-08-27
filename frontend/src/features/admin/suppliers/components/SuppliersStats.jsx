import { Building2, CheckCircle2, XCircle, FileText } from "lucide-react";
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.title}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-xl">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
