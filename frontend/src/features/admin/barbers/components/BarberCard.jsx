import { Edit, Trash2, User } from "lucide-react";

export default function BarberCard({ barber, onEdit, onDelete }) {
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {barber.imagen_url ? (
            <img
              src={barber.imagen_url}
              alt={`${barber.nombre} ${barber.apellido}`}
              className="w-12 h-12 rounded-full object-cover border border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
              <User className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{barber.nombre} {barber.apellido}</h3>
            <p className="text-sm text-muted-foreground">{barber.especialidad || "General"}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            barber.estado === 1 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          {barber.estado === 1 ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Correo</span>
          <span className="text-sm font-medium text-foreground">{barber.correo}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Teléfono</span>
          <span className="text-sm font-medium text-foreground">{barber.telefono || "N/A"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit && onEdit(barber)}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-1"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(barber)}
          className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
