import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  AlertCircle,
  Check
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import {
  getClientServices,
  getClientPackages,
  getClientBarbers,
  getClientSchedules,
  getAvailableSlots,
  bookAppointment
} from "../services/clientStorageService";

export default function ClientBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Paso actual (1: Servicios/Paquete, 2: Barbero, 3: Fecha, 4: Horario, 5: Confirmación)
  const [currentStep, setCurrentStep] = useState(1);

  // Catálogos
  const services = useMemo(() => getClientServices(), []);
  const packages = useMemo(() => getClientPackages(), []);
  const barbers = useMemo(() => getClientBarbers(), []);
  const schedules = useMemo(() => getClientSchedules(), []);

  // Estado del agendamiento
  const [bookingType, setBookingType] = useState("services"); // 'services' | 'package'
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Búsqueda en Paso 1 y Paso 2
  const [serviceSearch, setServiceSearch] = useState("");
  const [barberSearch, setBarberSearch] = useState("");

  // Slots calculados en Paso 4
  const [availableSlots, setAvailableSlots] = useState([]);

  // Inicializar selección si viene por URL (ej: ?servicio=2 o ?paquete=1)
  useEffect(() => {
    const sId = searchParams.get("servicio");
    const pId = searchParams.get("paquete");

    if (pId) {
      setBookingType("package");
      setSelectedPackageId(Number(pId));
    } else if (sId) {
      setBookingType("services");
      setSelectedServiceIds([Number(sId)]);
    } else {
      // Preseleccionar Corte Clásico por defecto si está vacío
      if (services.length > 0 && selectedServiceIds.length === 0 && !selectedPackageId) {
        setSelectedServiceIds([services[0].id_servicio]);
      }
    }
  }, [searchParams, services]);

  // Preseleccionar primer barbero disponible si no hay seleccionado
  useEffect(() => {
    if (barbers.length > 0 && !selectedBarberId) {
      setSelectedBarberId(barbers[0].id_barbero);
    }
  }, [barbers, selectedBarberId]);

  // Inicializar fecha mínima (mañana o hoy)
  const todayStr = new Date().toISOString().split("T")[0];
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayStr);
    }
  }, [selectedDate, todayStr]);

  // Recalcular slots disponibles cuando cambia barbero o fecha
  useEffect(() => {
    if (selectedBarberId && selectedDate) {
      const slots = getAvailableSlots(selectedBarberId, selectedDate);
      setAvailableSlots(slots);

      // Si el slot actual ya no está disponible, limpiar o seleccionar el primero libre
      if (slots.length > 0) {
        const stillFree = slots.find((s) => s.hora === selectedTimeSlot && s.disponible);
        if (!stillFree) {
          const firstFree = slots.find((s) => s.disponible);
          setSelectedTimeSlot(firstFree ? firstFree.hora : "");
        }
      } else {
        setSelectedTimeSlot("");
      }
    }
  }, [selectedBarberId, selectedDate, selectedTimeSlot]);

  // Cálculos de selección
  const selectedServices = useMemo(() => {
    return selectedServiceIds
      .map((id) => services.find((s) => s.id_servicio === id))
      .filter(Boolean);
  }, [selectedServiceIds, services]);

  const selectedPackage = useMemo(() => {
    return packages.find((p) => p.id_paquete === Number(selectedPackageId)) || null;
  }, [selectedPackageId, packages]);

  const totalPrice = useMemo(() => {
    if (bookingType === "package" && selectedPackage) {
      return selectedPackage.precioFinal;
    }
    return selectedServices.reduce((sum, s) => sum + Number(s.precio || 0), 0);
  }, [bookingType, selectedPackage, selectedServices]);

  const totalDuration = useMemo(() => {
    if (bookingType === "package" && selectedPackage) {
      return selectedPackage.duracionTotal;
    }
    return selectedServices.reduce((sum, s) => sum + Number(s.duracion_minutos || 0), 0) || 30;
  }, [bookingType, selectedPackage, selectedServices]);

  const selectedBarber = useMemo(() => {
    return barbers.find((b) => b.id_barbero === Number(selectedBarberId)) || null;
  }, [selectedBarberId, barbers]);

  // Validaciones para avanzar paso a paso
  const canAdvanceFromStep1 =
    (bookingType === "services" && selectedServiceIds.length > 0) ||
    (bookingType === "package" && selectedPackageId !== null);

  const canAdvanceFromStep2 = Boolean(selectedBarberId);
  const canAdvanceFromStep3 = Boolean(selectedDate);
  const canAdvanceFromStep4 = Boolean(selectedTimeSlot);

  // Manejo de confirmación final
  const handleConfirmBooking = () => {
    if (!canAdvanceFromStep1 || !canAdvanceFromStep2 || !canAdvanceFromStep3 || !canAdvanceFromStep4) {
      toast.error("Por favor completa todos los pasos del agendamiento.");
      return;
    }

    setIsSubmitting(true);

    const title =
      bookingType === "package" && selectedPackage
        ? selectedPackage.nombre
        : selectedServices.map((s) => s.nombre).join(" + ");

    const result = bookAppointment({
      id_barbero: selectedBarberId,
      id_servicio: bookingType === "services" ? selectedServiceIds[0] : null,
      id_paquete: bookingType === "package" ? selectedPackageId : null,
      nombre_item: title,
      fecha: selectedDate,
      hora: selectedTimeSlot,
      precio: totalPrice,
      notas: bookingNotes
    });

    if (!result.success) {
      setIsSubmitting(false);
      toast.error(result.error);
      return;
    }

    // Efecto de celebración
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success("¡Cita reservada con éxito! Te esperamos en Tu Turno Barber.");

    setTimeout(() => {
      navigate("/portal/mis-citas");
    }, 1000);
  };

  const steps = [
    { num: 1, title: "Servicios", desc: "Elige tus cortes o paquete" },
    { num: 2, title: "Barbero", desc: "Selecciona tu profesional" },
    { num: 3, title: "Fecha", desc: "Día de atención" },
    { num: 4, title: "Horario", desc: "Turno disponible" },
    { num: 5, title: "Confirmar", desc: "Resumen y reserva" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* CABECERA */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Reserva en Línea</span>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground">Agendar Cita</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Reserva tu turno en pocos pasos con disponibilidad real en vivo.
        </p>
      </div>

      {/* STEPPER INDICATOR */}
      <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex flex-col items-center mx-auto text-center">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                      isCompleted
                        ? "bg-[#C9A24A] text-black shadow-md shadow-[#C9A24A]/25"
                        : isCurrent
                        ? "bg-foreground text-background ring-4 ring-[#C9A24A]/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? "text-[#C9A24A]" : "text-muted-foreground"
                  }`}>
                    {s.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > s.num ? "bg-[#C9A24A]" : "bg-border"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO DEL PASO ACTIVO */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm">
        {/* =========================================================================
            PASO 1: SELECCIONAR SERVICIO(S) O PAQUETE
            ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Paso 1: Selecciona tus Servicios o Paquete
                </h2>
                <p className="text-xs text-muted-foreground">
                  Puedes armar tu propia combinación o elegir un paquete con descuento incluido.
                </p>
              </div>

              {/* Selector de tipo */}
              <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border self-start">
                <button
                  type="button"
                  onClick={() => setBookingType("services")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingType === "services"
                      ? "bg-[#C9A24A] text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Servicios Individuales
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingType("package");
                    if (packages.length > 0 && !selectedPackageId) {
                      setSelectedPackageId(packages[0].id_paquete);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    bookingType === "package"
                      ? "bg-[#C9A24A] text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClientStarIcon className="w-3.5 h-3.5" />
                  <span>Paquetes en Promo</span>
                </button>
              </div>
            </div>

            {bookingType === "services" ? (
              <div className="space-y-4">
                {/* Buscador de servicios */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar servicios por nombre..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm"
                  />
                </div>

                {/* Chips de seleccionados */}
                {selectedServices.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Servicios Seleccionados ({selectedServices.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((s) => (
                        <span
                          key={s.id_servicio}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C9A24A]/15 text-[#C9A24A] border border-[#C9A24A]/30 text-xs font-bold"
                        >
                          <span>{s.nombre}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedServiceIds(selectedServiceIds.filter((id) => id !== s.id_servicio))
                            }
                            className="hover:text-destructive cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista interactiva de servicios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {services
                    .filter((s) => s.nombre.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map((svc) => {
                      const isSelected = selectedServiceIds.includes(svc.id_servicio);
                      return (
                        <div
                          key={svc.id_servicio}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedServiceIds(selectedServiceIds.filter((id) => id !== svc.id_servicio));
                            } else {
                              setSelectedServiceIds([...selectedServiceIds, svc.id_servicio]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-[#C9A24A]/10 border-[#C9A24A] ring-2 ring-[#C9A24A]/20"
                              : "bg-card border-border hover:border-border/80 hover:bg-accent/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                              isSelected
                                ? "bg-[#C9A24A] border-[#C9A24A] text-black"
                                : "border-muted-foreground/30 text-transparent"
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{svc.nombre}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {svc.duracion_minutos} min • {svc.categoria || "Corte"}
                              </p>
                            </div>
                          </div>

                          <span className="text-sm font-black text-[#C9A24A]">
                            ${Number(svc.precio).toLocaleString("es-CO")}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id_paquete;
                  return (
                    <div
                      key={pkg.id_paquete}
                      onClick={() => setSelectedPackageId(pkg.id_paquete)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#C9A24A]/10 border-[#C9A24A] ring-2 ring-[#C9A24A]/20 shadow-md"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#C9A24A] text-black flex items-center gap-1">
                            <ClientStarIcon className="w-3 h-3 text-black" />
                            <span>{pkg.descuento_porcentaje}% OFF</span>
                          </span>
                          <span className="text-xs font-bold text-emerald-500">
                            Ahorras ${Number(pkg.ahorro).toLocaleString("es-CO")}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-foreground">{pkg.nombre}</h3>
                        <p className="text-xs text-muted-foreground">{pkg.descripcion}</p>

                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                            Servicios:
                          </span>
                          <p className="text-xs text-foreground font-semibold">
                            {pkg.servicios.map((s) => s.nombre).join(" + ")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground line-through">
                          ${Number(pkg.precioOriginal).toLocaleString("es-CO")}
                        </span>
                        <span className="text-lg font-black text-[#C9A24A]">
                          ${Number(pkg.precioFinal).toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total acumulado */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Estimación:</span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  Duración aproximada: {totalDuration} minutos
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground font-medium">Total a pagar:</span>
                <p className="text-xl font-black text-[#C9A24A]">
                  ${Number(totalPrice).toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 2: SELECCIONAR BARBERO
            ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Paso 2: Selecciona a tu Barbero
              </h2>
              <p className="text-xs text-muted-foreground">
                Elige el profesional de tu preferencia para la atención de tu cita.
              </p>
            </div>

            {/* Buscador de barbero */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o especialidad..."
                value={barberSearch}
                onChange={(e) => setBarberSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm"
              />
            </div>

            {/* Tarjetas de barberos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers
                .filter(
                  (b) =>
                    b.nombre.toLowerCase().includes(barberSearch.toLowerCase()) ||
                    b.especialidad.toLowerCase().includes(barberSearch.toLowerCase())
                )
                .map((b) => {
                  const isSelected = Number(selectedBarberId) === b.id_barbero;
                  return (
                    <div
                      key={b.id_barbero}
                      onClick={() => setSelectedBarberId(b.id_barbero)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? "bg-[#C9A24A]/10 border-[#C9A24A] ring-2 ring-[#C9A24A]/20 shadow-md"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
                        {b.imagen_url ? (
                          <img src={b.imagen_url} alt={b.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#C9A24A]/20 text-[#C9A24A] font-bold text-base">
                            {b.nombre.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-foreground truncate">{b.nombre}</h3>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C9A24A] shrink-0" />}
                        </div>
                        <p className="text-xs text-[#C9A24A] font-semibold mt-0.5 truncate">{b.especialidad}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {b.telefono || "Barbero Oficial"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 3: SELECCIONAR FECHA
            ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Paso 3: Selecciona la Fecha
              </h2>
              <p className="text-xs text-muted-foreground">
                Indica el día en el que deseas asistir a tu cita en la barbería.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fecha de la Cita
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-input text-foreground text-base focus:ring-2 focus:ring-[#C9A24A]"
                  required
                />
              </div>

              {selectedBarber && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs space-y-1.5">
                  <p className="font-bold text-foreground">
                    Barbero seleccionado: {selectedBarber.nombre} ({selectedBarber.especialidad})
                  </p>
                  <p className="text-muted-foreground">
                    Atención de Lunes a Sábado. Los días no laborables o feriados no permitirán selección de turnos en el siguiente paso.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 4: SELECCIONAR HORARIO DISPONIBLE REAL
            ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Paso 4: Selecciona el Horario
              </h2>
              <p className="text-xs text-muted-foreground">
                Horarios en vivo para <strong>{selectedBarber?.nombre}</strong> el día <strong>{selectedDate}</strong>.
              </p>
            </div>

            {availableSlots.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#C9A24A]" />
                    <span className="text-muted-foreground">Seleccionado</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-card border border-border" />
                    <span className="text-muted-foreground">Disponible</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-muted opacity-50" />
                    <span className="text-muted-foreground">Ocupado</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.hora;
                    return (
                      <button
                        key={slot.hora}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => setSelectedTimeSlot(slot.hora)}
                        className={`py-3 px-2 rounded-xl text-xs font-black transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          !slot.disponible
                            ? "bg-muted text-muted-foreground/30 border border-border cursor-not-allowed opacity-40"
                            : isSelected
                            ? "bg-[#C9A24A] text-black shadow-lg shadow-[#C9A24A]/30 scale-105"
                            : "bg-card border border-border hover:border-[#C9A24A] text-foreground hover:bg-accent"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot.hora}</span>
                        {!slot.disponible && <span className="text-[9px] font-normal">Ocupado</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
                <h3 className="text-sm font-bold text-destructive">Sin disponibilidad para esta fecha</h3>
                <p className="text-xs text-muted-foreground">
                  El barbero seleccionado no cuenta con turnos laborales o todos sus horarios están llenos. Por favor regresa al paso 3 y selecciona otra fecha.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PASO 5: RESUMEN Y CONFIRMACIÓN
            ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Paso 5: Resumen de tu Cita
              </h2>
              <p className="text-xs text-muted-foreground">
                Revisa los datos antes de confirmar tu reserva.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-muted/30 border border-border space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {bookingType === "package" ? "Paquete Seleccionado" : "Servicios Reservados"}
                  </span>
                  <p className="text-base font-black text-foreground mt-1">
                    {bookingType === "package" && selectedPackage
                      ? selectedPackage.nombre
                      : selectedServices.map((s) => s.nombre).join(" + ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Duración estimada: {totalDuration} minutos
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Barbero Profesional
                  </span>
                  <p className="text-base font-black text-foreground mt-1">
                    {selectedBarber?.nombre} {selectedBarber?.apellido || ""}
                  </p>
                  <p className="text-xs text-[#C9A24A] font-semibold">
                    {selectedBarber?.especialidad}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
                <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Fecha</span>
                    <p className="text-xs sm:text-sm font-black text-foreground">{selectedDate}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Hora de Turno</span>
                    <p className="text-xs sm:text-sm font-black text-foreground">{selectedTimeSlot}</p>
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Notas o comentarios para el barbero (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Prefiero fade alto, arreglo suave de barba, etc."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-foreground text-xs"
                />
              </div>

              {/* Total final */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#C9A24A]/15 to-transparent border border-[#C9A24A]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block">
                    Total a pagar en barbería
                  </span>
                  <span className="text-xs text-muted-foreground">Pago en efectivo o transferencia</span>
                </div>
                <span className="text-2xl font-black text-[#C9A24A]">
                  ${Number(totalPrice).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* NAVEGACIÓN ENTRE PASOS (ANTERIOR / SIGUIENTE) */}
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              disabled={
                (currentStep === 1 && !canAdvanceFromStep1) ||
                (currentStep === 2 && !canAdvanceFromStep2) ||
                (currentStep === 3 && !canAdvanceFromStep3) ||
                (currentStep === 4 && !canAdvanceFromStep4)
              }
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#C9A24A] hover:bg-[#d8b056] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B08A33] hover:from-[#d8b056] hover:to-[#C9A24A] text-black font-extrabold text-sm shadow-xl shadow-[#C9A24A]/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Confirmando..." : "CONFIRMAR CITA"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
