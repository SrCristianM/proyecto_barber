import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export default function RolesStats({ roles = [] }) {
  const total = roles.length;
  const activos = roles.filter((r) => r.estado === 1).length;
  const inactivos = roles.filter((r) => r.estado === 0).length;

  const items = [
    {
      title: "Total Roles",
      value: total,
      icon: <Shield className="h-5 w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Roles Activos",
      value: activos,
      icon: <ShieldCheck className="h-5 w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Roles Inactivos",
      value: inactivos,
      icon: <ShieldAlert className="h-5 w-5 text-warning" />,
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
          </div>
          <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/40">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
