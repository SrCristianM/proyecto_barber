import { Edit, Trash2, Star } from "lucide-react";

export default function BarberCard({ barber, onDelete }) {
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            {barber.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{barber.name}</h3>
            <p className="text-sm text-muted-foreground">{barber.specialty}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            barber.status === "Disponible" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          {barber.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Valoración</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-medium text-foreground">{barber.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Citas este mes</span>
          <span className="text-sm font-medium text-foreground">{barber.appointments}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
          Ver Perfil
        </button>
        <button className="p-2 border border-border rounded-lg hover:bg-accent transition-colors">
          <Edit className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={() => onDelete(barber.id)}
          className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
