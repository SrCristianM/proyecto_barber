import { Boxes, PackageCheck, DollarSign, Award } from "lucide-react";
import { motion } from "motion/react";

export default function SuppliesStats({ stats }) {
  const {
    monthUnits = 0,
    monthCost = 0,
    monthDispatches = 0,
    topBarber = "—"
  } = stats || {};

  const items = [
    {
      title: "Insumos Despachados",
      value: `${Number(monthUnits).toLocaleString("es-CO")} un.`,
      subtitle: "Consumidos este mes",
      icon: <Boxes className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Costo Estimado",
      value: `$${Number(monthCost).toLocaleString("es-CO")}`,
      subtitle: "Gasto operativo interno",
      icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />,
      color: "text-amber-500"
    },
    {
      title: "Despachos Registrados",
      value: Number(monthDispatches).toLocaleString("es-CO"),
      subtitle: "Vales de suministro",
      icon: <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />,
      color: "text-emerald-500"
    },
    {
      title: "Barbero Mayor Demanda",
      value: topBarber,
      subtitle: "Mayor consumo de insumos",
      icon: <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
      color: "text-foreground truncate max-w-[170px]"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="gold-card p-3 sm:p-5 flex items-center justify-between"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              {item.title}
            </span>
            <h3 className={`text-base sm:text-2xl font-black ${item.color}`}>{item.value}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium truncate">
              {item.subtitle}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-secondary/60 rounded-xl sm:rounded-2xl border border-border/40 shrink-0">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
