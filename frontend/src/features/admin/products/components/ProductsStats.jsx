import { Package, PackageCheck, AlertTriangle } from "lucide-react";

export default function ProductsStats({ products = [] }) {
  const total = products.length;
  const activos = products.filter((p) => p.estado === 1).length;
  const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Productos</span>
          <Package className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{total}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Productos Activos</span>
          <PackageCheck className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-3xl font-bold text-foreground">{activos}</h3>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Stock Bajo / Agotado</span>
          <AlertTriangle className={`h-5 w-5 ${lowStock > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <h3 className={`text-3xl font-bold ${lowStock > 0 ? "text-destructive" : "text-foreground"}`}>{lowStock}</h3>
      </div>
    </div>
  );
}
