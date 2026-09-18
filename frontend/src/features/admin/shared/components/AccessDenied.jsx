import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";

export default function AccessDenied({ moduleName = "este módulo" }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Glow de acento decorativo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-destructive/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-destructive bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
            Error 403 • Acceso Restringido
          </span>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight pt-2">
            Acceso Denegado
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu rol actual no cuenta con los permisos necesarios para visualizar o administrar{" "}
            <span className="font-semibold text-foreground">{moduleName}</span>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 text-xs text-muted-foreground text-left space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A]" />
            <span>Política de Seguridad (RBAC)</span>
          </div>
          <p>
            Esta sección está reservada exclusivamente para roles con privilegios administrativos superiores.
          </p>
        </div>

        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
