import { Boxes, PackageCheck, DollarSign, Award } from "lucide-react";
import { motion } from "motion/react";
import RollingNumber from "../../../../shared/components/RollingNumber";

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
      isNumeric: true,
      numValue: monthUnits,
      suffix: "un.",
      subtitle: "Consumidos este mes",
      icon: <Boxes className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
      color: "text-foreground"
    },
    {
      title: "Costo Estimado",
      isNumeric: true,
      numValue: monthCost,
      prefix: "$",
      subtitle: "Gasto operativo interno",
      icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />,
      color: "text-amber-500"
    },
    {
      title: "Despachos Registrados",
      isNumeric: true,
      numValue: monthDispatches,
      suffix: "vales",
      subtitle: "Vales de suministro",
      icon: <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />,
      color: "text-emerald-500"
    },
    {
      title: "Barbero Mayor Demanda",
      isNumeric: false,
      textValue: topBarber,
      subtitle: "Mayor consumo de insumos",
      icon: <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[#DFB755]" />,
      color: "text-foreground truncate max-w-[170px]"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="gold-metallic-card p-3.5 sm:p-5 flex items-center justify-between rounded-2xl cursor-default group"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
              {item.title}
            </span>
            <h3 className={`text-base sm:text-2xl font-black ${item.color}`}>
              {item.isNumeric ? (
                <RollingNumber
                  value={item.numValue}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
              ) : (
                item.textValue
              )}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium truncate">
              {item.subtitle}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-secondary/70 rounded-xl sm:rounded-2xl border border-border/50 shrink-0 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
