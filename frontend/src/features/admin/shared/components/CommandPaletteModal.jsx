import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Calendar,
  DollarSign,
  Package,
  Scissors,
  Users,
  Clock,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
} from "../../../../shared/ui/command";

export default function CommandPaletteModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

  // Cargar catálogos reales desde almacenamiento/BD para indexación instantánea
  useEffect(() => {
    if (open) {
      try {
        const rawClients = localStorage.getItem("barber_clients_db");
        const rawProducts = localStorage.getItem("barber_products_db");
        const rawServices = localStorage.getItem("barber_services_db");
        const rawBarbers = localStorage.getItem("barber_barbers_db");

        if (rawClients) setClients(JSON.parse(rawClients).filter((c) => c.estado === 1));
        if (rawProducts) setProducts(JSON.parse(rawProducts).filter((p) => p.estado === 1));
        if (rawServices) setServices(JSON.parse(rawServices).filter((s) => s.estado === 1));
        if (rawBarbers) setBarbers(JSON.parse(rawBarbers).filter((b) => b.estado === 1));
      } catch (err) {
        console.error("Error cargando índices de búsqueda rápida:", err);
      }
    }
  }, [open]);

  const handleSelect = (callback) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog
      title="Búsqueda Rápida y Acciones"
      description="Presiona una acción o busca cualquier cliente, servicio o producto..."
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput placeholder="Escribe para buscar o ejecutar una acción rápida (Ctrl+K)..." />
      <CommandList className="max-h-[380px] p-2">
        <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
          No se encontraron resultados coincidentes.
        </CommandEmpty>

        {/* Acciones Rápidas Operativas */}
        <CommandGroup heading="Acciones Frecuentes">
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard/appointments?new=1"))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-foreground text-xs sm:text-sm">Nueva Cita</span>
              <span className="text-[10px] text-muted-foreground">Agendar un nuevo turno en la barbería</span>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">
              NC
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard/sales?new=1"))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-emerald-500/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-foreground text-xs sm:text-sm">Registrar Venta</span>
              <span className="text-[10px] text-muted-foreground">Cobro directo o liquidación de cita</span>
            </div>
            <CommandShortcut className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">
              NV
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard/products?new=1"))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-foreground text-xs sm:text-sm">Nuevo Producto</span>
              <span className="text-[10px] text-muted-foreground">Crear ítem en el catálogo de inventario</span>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard/services?tab=packages&new=1"))}
            className="flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer hover:bg-purple-500/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-foreground text-xs sm:text-sm">Crear Paquete Combo</span>
              <span className="text-[10px] text-muted-foreground">Armar paquete con descuento promocional</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1.5" />

        {/* Módulos Principales de Navegación */}
        <CommandGroup heading="Módulos del Sistema">
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard"))}
            className="py-1.5 px-3 rounded-lg text-xs cursor-pointer flex items-center gap-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Dashboard Principal</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/dashboard/schedules"))}
            className="py-1.5 px-3 rounded-lg text-xs cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Horarios y Turnos de Barberos</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1.5" />

        {/* Clientes Registrados */}
        {clients.length > 0 && (
          <CommandGroup heading="Clientes">
            {clients.slice(0, 5).map((c) => (
              <CommandItem
                key={c.id_cliente}
                onSelect={() => handleSelect(() => navigate(`/dashboard/clients?search=${encodeURIComponent(c.nombre)}`))}
                className="py-2 px-3 rounded-lg cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {c.nombre} {c.apellido || ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Tel: {c.telefono || "Sin teléfono"} • {c.nivel_fidelidad || "Nuevo"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-50 shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Productos en Inventario */}
        {products.length > 0 && (
          <CommandGroup heading="Productos en Inventario">
            {products.slice(0, 5).map((p) => (
              <CommandItem
                key={p.id_producto}
                onSelect={() => handleSelect(() => navigate(`/dashboard/products?search=${encodeURIComponent(p.nombre)}`))}
                className="py-2 px-3 rounded-lg cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Stock: {p.stock} • ${Number(p.precio).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-50 shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Catálogo de Servicios */}
        {services.length > 0 && (
          <CommandGroup heading="Servicios">
            {services.slice(0, 4).map((s) => (
              <CommandItem
                key={s.id_servicio}
                onSelect={() => handleSelect(() => navigate(`/dashboard/services?search=${encodeURIComponent(s.nombre)}`))}
                className="py-2 px-3 rounded-lg cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Scissors className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-foreground block truncate">
                      {s.nombre}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ⏱️ {s.duracion_minutos} min • ${Number(s.precio).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-50 shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
