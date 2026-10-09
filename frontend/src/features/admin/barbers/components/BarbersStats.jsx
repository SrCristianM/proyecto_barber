import { Users, UserCheck, Award } from "lucide-react";
import { motion } from "motion/react";

export default function BarbersStats({ barbers = [] }) {
  const total = barbers.length;
  const activos = barbers.filter((b) => b.estado === 1).length;
  const specialtiesCount = new Set(barbers.map((b) => b.especialidad).filter(Boolean)).size;

  const items = [
    {
      title: "Total Barberos",
      value: total,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Barberos Activos",
      value: activos,
      icon: <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-success" />,
      color: "text-success"
    },
    {
      title: "Especialidades",
      value: specialtiesCount,
      icon: <Award className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />,
      color: "text-warning"
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
