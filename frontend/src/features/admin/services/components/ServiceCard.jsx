import { Edit, Trash2, Clock, DollarSign } from "lucide-react";

export default function ServiceCard({ service, onDelete }) {
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{service.image}</div>
        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
          {service.status}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{service.category}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duración</span>
          </div>
          <span className="text-sm font-medium text-foreground">{service.duration} min</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Precio</span>
          </div>
          <span className="text-lg font-bold text-primary">${service.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
          Ver Detalle
        </button>
        <button className="p-2 border border-border rounded-lg hover:bg-accent transition-colors">
          <Edit className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={() => onDelete(service.id)}
          className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
