import { DollarSign, Calendar, ShoppingCart } from "lucide-react";

export default function SalesStats({ totalToday, totalMonth, averageTicket }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Ventas Hoy</span>
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">${totalToday.toLocaleString()}</h3>
        <p className="text-sm text-success mt-1">+12% vs ayer</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Ventas del Mes</span>
          <Calendar className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">${totalMonth.toLocaleString()}</h3>
        <p className="text-sm text-success mt-1">+8% vs mes anterior</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Ticket Promedio</span>
          <ShoppingCart className="h-5 w-5 text-warning" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">
          ${averageTicket.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
        </h3>
        <p className="text-sm text-success mt-1">+5% vs promedio</p>
      </div>
    </div>
  );
}
