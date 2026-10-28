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
  Check,
  Star,
  Share2,
  Download,
  Sun,
  Flame,
  Sparkles
} from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import BarberPoleSuccessModal from "../../../shared/components/animations/BarberPoleSuccessModal";
import {
  getClientServices,
  getClientPackages,
  getClientBarbers,
  getClientSchedules,
  getAvailableSlots,
  getBarberWorkingDays,
  isBarberWorkingOnDate,
  bookAppointment,
  getCurrentClientProfile,
  syncCatalogsFromApi
} from "../services/clientStorageService";
import { useDataSync, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";
import {
  createGoogleCalendarUrl,
  downloadIcsFile,
  createWhatsAppShareUrl
} from "../utils/calendarUtils";
import { getLocalDateString, addDays } from "../../../shared/utils/dateUtils";
import ClientBookingDatePicker from "../components/ClientBookingDatePicker";

export default function ClientBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Paso actual (1: Servicios/Paquete, 2: Barbero, 3: Fecha, 4: Horario, 5: Confirmación)
  const [currentStep, setCurrentStep] = useState(1);

  // Catálogos reactivos y perfil de cliente
  const [services, setServices] = useState(() => getClientServices());
  const [packages, setPackages] = useState(() => getClientPackages());
  const [barbers, setBarbers] = useState(() => getClientBarbers());
  const [schedules, setSchedules] = useState(() => getClientSchedules());
  const clientProfile = useMemo(() => getCurrentClientProfile(), []);

  const refreshCatalogs = () => {
    setServices(getClientServices());
    setPackages(getClientPackages());
    setBarbers(getClientBarbers());
    setSchedules(getClientSchedules());
    syncCatalogsFromApi().then(() => {
      setServices(getClientServices());
      setPackages(getClientPackages());
      setBarbers(getClientBarbers());
      setSchedules(getClientSchedules());
    });
  };

  useEffect(() => {
    refreshCatalogs();
  }, []);

  useDataSync([
    SYNC_ENTITIES.SERVICES,
    SYNC_ENTITIES.PACKAGES,
    SYNC_ENTITIES.BARBERS,
    SYNC_ENTITIES.SCHEDULES,
    SYNC_ENTITIES.APPOINTMENTS
  ], refreshCatalogs);

  // Estado del agendamiento
  const [bookingType, setBookingType] = useState("services"); // 'services' | 'package'
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAppointmentData, setSuccessAppointmentData] = useState(null);

  // Búsqueda en Paso 1 y Paso 2
  const [serviceSearch, setServiceSearch] = useState("");
  const [barberSearch, setBarberSearch] = useState("");

  // Slots calculados en Paso 4 y filtro de jornada (mañana/tarde)
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotPeriodFilter, setSlotPeriodFilter] = useState("all"); // 'all' | 'morning' | 'afternoon'

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

  // Preseleccionar barbero disponible (respetando si viene especificado en la URL)
  useEffect(() => {
    const bId = searchParams.get("barbero") || searchParams.get("barberoId");
    if (bId && barbers.some((b) => b.id_barbero === Number(bId))) {
      setSelectedBarberId(Number(bId));
    } else if (barbers.length > 0) {
      if (!selectedBarberId || !barbers.some((b) => b.id_barbero === Number(selectedBarberId))) {
        setSelectedBarberId(barbers[0].id_barbero);
      }
    }
  }, [searchParams, barbers, selectedBarberId]);

  // Inicializar o ajustar fecha seleccionada según los días que realmente labora el barbero
  const todayStr = getLocalDateString();
  useEffect(() => {
    if (!selectedBarberId) return;

    // Si la fecha actual ya es una jornada laboral activa con turnos para este barbero, mantenerla
    if (selectedDate && isBarberWorkingOnDate(selectedBarberId, selectedDate).isWorking) {
      const currentSlots = getAvailableSlots(selectedBarberId, selectedDate);
      if (currentSlots.length > 0 && currentSlots.some((s) => s.disponible)) {
        return;
      }
    }

    // De lo contrario, buscar el primer día laboral con turnos disponibles en los próximos 30 días
    let found = null;
    for (let i = 0; i <= 30; i++) {
      const nextD = addDays(todayStr, i);
      if (isBarberWorkingOnDate(selectedBarberId, nextD).isWorking) {
        const slots = getAvailableSlots(selectedBarberId, nextD);
        if (slots.length > 0 && slots.some((s) => s.disponible)) {
          found = nextD;
          break;
        }
      }
    }

    setSelectedDate(found || "");
  }, [selectedBarberId, schedules, todayStr]);

  // Recalcular slots disponibles cuando cambia barbero o fecha
  useEffect(() => {
    if (selectedBarberId && selectedDate) {
      const slots = getAvailableSlots(selectedBarberId, selectedDate);
      setAvailableSlots(slots);

      setSelectedTimeSlot((prev) => {
        if (!prev) {
          const firstFree = slots.find((s) => s.disponible);
          return firstFree ? firstFree.hora : "";
        }
        const stillFree = slots.find((s) => s.hora === prev && s.disponible);
        if (stillFree) return prev;
        const firstFree = slots.find((s) => s.disponible);
        return firstFree ? firstFree.hora : "";
      });
    }
  }, [selectedBarberId, selectedDate]);

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

  // Verificar si un barbero es especialista en el servicio/paquete actual
  const isBarberSpecialist = useMemo(() => {
    return (barber) => {
      if (!barber || !barber.especialidad) return false;
      const spec = barber.especialidad.toLowerCase();
      if (bookingType === "package" && selectedPackage) {
        return spec.includes("corte") || spec.includes("fade") || spec.includes("diseño");
      }
      return selectedServices.some((s) => {
        const name = (s.nombre || "").toLowerCase();
        const cat = (s.categoria || "").toLowerCase();
        if (cat.includes("barba") && spec.includes("barba")) return true;
        if (cat.includes("corte") && (spec.includes("corte") || spec.includes("fade"))) return true;
        if (name.includes("color") && spec.includes("color")) return true;
        return spec.includes(name);
      });
    };
  }, [bookingType, selectedPackage, selectedServices]);

  // Filtrado de slots de Paso 4 por jornada (Mañana / Tarde)
  const filteredSlots = useMemo(() => {
    return availableSlots.filter((slot) => {
      if (slotPeriodFilter === "all") return true;
      const hour = parseInt(slot.hora.split(":")[0], 10);
      if (slotPeriodFilter === "morning") return hour < 12;
      if (slotPeriodFilter === "afternoon") return hour >= 12;
      return true;
    });
  }, [availableSlots, slotPeriodFilter]);

  const morningFreeCount = useMemo(() => {
    return availableSlots.filter((s) => s.disponible && parseInt(s.hora.split(":")[0], 10) < 12).length;
  }, [availableSlots]);

  const afternoonFreeCount = useMemo(() => {
    return availableSlots.filter((s) => s.disponible && parseInt(s.hora.split(":")[0], 10) >= 12).length;
  }, [availableSlots]);

  // Disponibilidad de la fecha seleccionada
  const dateAvailability = useMemo(() => {
    if (!selectedBarberId || !selectedDate) return null;
    const slots = getAvailableSlots(selectedBarberId, selectedDate);
    if (slots.length === 0) {
      return { valid: false, reason: "El profesional no presta servicio en este día de la semana." };
    }
    if (slots.every((s) => s.bloqueadoPorNovedad)) {
      return {
        valid: false,
        reason: `El profesional tiene una novedad aprobada (${slots[0]?.novedadMotivo || "Permiso"}) en esta fecha.`
      };
    }
    const freeCount = slots.filter((s) => s.disponible).length;
    if (freeCount === 0) {
      return { valid: false, reason: "Todos los horarios de este día ya se encuentran ocupados." };
    }
    return { valid: true, freeCount };
  }, [selectedBarberId, selectedDate, schedules]);

  // Validaciones para avanzar paso a paso
  const canAdvanceFromStep1 =
    (bookingType === "services" && selectedServiceIds.length > 0) ||
    (bookingType === "package" && selectedPackageId !== null);

  const canAdvanceFromStep2 = Boolean(selectedBarberId);
  const selectedBarberWorkingDays = useMemo(() => {
    return selectedBarberId ? getBarberWorkingDays(selectedBarberId) : null;
  }, [selectedBarberId, schedules]);

  const canAdvanceFromStep3 =
    Boolean(selectedDate) &&
    Boolean(selectedBarberWorkingDays?.hasSchedules) &&
    (!dateAvailability || dateAvailability.valid);
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

    // Desplazar suavemente a una altura media equilibrada para apreciar la animación en el centro
    window.scrollTo({ top: 140, behavior: "smooth" });

    toast.success("¡Cita reservada con éxito! Te esperamos en Tu Turno Barber.");

    setSuccessAppointmentData({
      id_cita: result.id_cita || 101,
      cliente_nombre: clientProfile ? `${clientProfile.nombre} ${clientProfile.apellido || ""}`.trim() : "Cliente",
      barbero_nombre: `${selectedBarber?.nombre} ${selectedBarber?.apellido || ""}`.trim(),
      servicio_nombre: title,
      fecha: selectedDate,
      hora: selectedTimeSlot,
      precio: totalPrice
    });
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
        <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">Reserva en Línea</span>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground">Agendar Cita</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Reserva tu turno en pocos pasos con disponibilidad real en vivo.
        </p>
      </div>

      {/* STEPPER INDICATOR CON TIJERA CORTADORA */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex flex-col items-center mx-auto text-center relative">
                  {/* Tijera cortadora animada sobre el paso actual */}
                  {isCurrent && (
                    <motion.div
                      layoutId="bookingScissorsIndicator"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute -top-7 text-[#DFB755] flex flex-col items-center z-30 pointer-events-none"
                    >
                      <motion.div
                        animate={{ rotate: [-20, 20, -10, 10, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                        <Scissors className="w-5 h-5 text-[#DFB755] filter drop-shadow-[0_2px_4px_rgba(223,183,85,0.4)]" />
                      </motion.div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DFB755] mt-0.5" />
                    </motion.div>
                  )}

                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
                      isCompleted
                        ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md shadow-[#DDAE41]/25"
                        : isCurrent
                        ? "bg-foreground text-background ring-4 ring-[#DFB755]/30 font-black"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 hidden sm:block ${
                    isCurrent ? "text-[#DDAE41] dark:text-[#E8C466] font-black" : "text-muted-foreground"
                  }`}>
                    {s.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-1.5 sm:mx-3 rounded-full bg-muted/70 overflow-hidden relative">
                    <motion.div
                      initial={false}
                      animate={{
                        width: currentStep > s.num ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-[#E8C466] to-[#DDAE41]"
                    />
                  </div>
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
                      ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm"
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
                      ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm focus:ring-2 focus:ring-[#DFB755]"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#DFB755]/15 text-[#DDAE41] dark:text-[#E8C466] border border-[#DFB755]/30 text-xs font-bold"
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
                              ? "bg-[#DFB755]/10 border-[#DFB755] ring-2 ring-[#DFB755]/20"
                              : "bg-card border-border hover:border-[#DFB755]/50 hover:bg-accent/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                              isSelected
                                ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] border-[#DFB755] text-black"
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

                          <span className="text-sm font-black text-[#DDAE41] dark:text-[#E8C466]">
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
                          ? "bg-[#DFB755]/10 border-[#DFB755] ring-2 ring-[#DFB755]/20 shadow-md"
                          : "bg-card border-border hover:border-[#DFB755]/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black flex items-center gap-1 shadow-sm">
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
                        <span className="text-lg font-black text-[#DDAE41] dark:text-[#E8C466]">
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
                <p className="text-xl font-black text-[#DDAE41] dark:text-[#E8C466]">
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

            {/* Tarjetas de barberos con diseño premium y detección de especialidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers
                .filter(
                  (b) =>
                    (b.nombre || "").toLowerCase().includes(barberSearch.toLowerCase()) ||
                    ((b.apellido || "") && `${b.nombre} ${b.apellido}`.toLowerCase().includes(barberSearch.toLowerCase())) ||
                    (b.especialidad || "").toLowerCase().includes(barberSearch.toLowerCase())
                )
                .map((b) => {
                  const isSelected = Number(selectedBarberId) === b.id_barbero;
                  const isMatch = isBarberSpecialist(b);
                  const schedInfo = getBarberWorkingDays(b.id_barbero);

                  return (
                    <motion.div
                      key={b.id_barbero}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBarberId(b.id_barbero)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-[#DFB755]/15 via-card to-[#E8C466]/10 border-[#DFB755] ring-2 ring-[#DFB755]/30 shadow-lg shadow-[#DFB755]/15"
                          : "bg-card border-border hover:border-[#DFB755]/60 hover:shadow-md"
                      }`}
                    >
                      {/* Badge recomendación de especialista */}
                      {isMatch && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Especialista</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border border-border shadow-xs">
                            {b.imagen_url ? (
                              <img
                                src={b.imagen_url}
                                alt={b.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#DFB755]/20 text-[#DFB755] font-black text-lg">
                                {b.nombre.charAt(0)}
                              </div>
                            )}
                          </div>
                          {/* Anillo de disponibilidad en vivo */}
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-card flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-foreground truncate">{b.nombre}</h3>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-[#DFB755]" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{b.especialidad}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500">
                              <Star className={`w-3 h-3 ${Number(b.reviewsCount || b.total_calificaciones || 0) > 0 ? "fill-amber-500" : "text-amber-500/50"}`} />
                              {Number(b.rating ?? b.calificacion ?? 0).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {Number(b.reviewsCount || b.total_calificaciones || 0) === 0
                                ? "(0 opiniones)"
                                : `(${Number(b.reviewsCount || b.total_calificaciones || 0)}+ citas)`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] gap-2">
                        <span className={`flex items-center gap-1 truncate ${schedInfo.hasSchedules ? "text-muted-foreground" : "text-amber-500 font-medium"}`}>
                          {schedInfo.hasSchedules ? <Clock className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{schedInfo.summary}</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {schedInfo.hasSchedules ? (b.nextSlot || "Agenda activa") : "Sin horario"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 3: SELECCIONAR FECHA CON CALENDARIO INTERACTIVO Y ANIMACIONES
            ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Paso 3: Selecciona la Fecha
              </h2>
              <p className="text-xs text-muted-foreground">
                Explora el calendario interactivo con disponibilidad en vivo para agendar tu cita.
              </p>
            </div>

            {!selectedBarberWorkingDays?.hasSchedules ? (
              <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-foreground">
                  {selectedBarber?.nombre} aún no tiene horarios asignados
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  El administrador todavía no ha configurado las jornadas laborales para este barbero. Por favor regresa al paso 2 y selecciona otro barbero disponible.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#DFB755] text-zinc-950 font-bold text-xs shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  Elegir Otro Barbero
                </button>
              </div>
            ) : (
              <ClientBookingDatePicker
                selectedDate={selectedDate}
                onDateChange={(newDate) => setSelectedDate(newDate)}
                selectedBarber={selectedBarber}
                schedules={schedules}
                onContinue={() => {
                  if (canAdvanceFromStep3) {
                    setCurrentStep(4);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }
                }}
              />
            )}
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
              availableSlots.every((s) => s.bloqueadoPorNovedad) ? (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Agenda No Disponible por Novedad Autorizada</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                      <strong>{selectedBarber?.nombre}</strong> tiene una novedad aprobada (<strong>{availableSlots[0]?.novedadMotivo}</strong>) para la fecha seleccionada ({selectedDate}).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    Elegir Otra Fecha
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SEGMENTACIÓN POR JORNADA: TODOS / MAÑANA / TARDE */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSlotPeriodFilter("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          slotPeriodFilter === "all"
                            ? "bg-[#DFB755] text-zinc-950 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Todos ({availableSlots.filter((s) => s.disponible).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlotPeriodFilter("morning")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          slotPeriodFilter === "morning"
                            ? "bg-[#DFB755] text-zinc-950 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Mañana ({morningFreeCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlotPeriodFilter("afternoon")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          slotPeriodFilter === "afternoon"
                            ? "bg-[#DFB755] text-zinc-950 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tarde ({afternoonFreeCount})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DFB755]" />
                        <span>Seleccionado</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Libre</span>
                      </span>
                    </div>
                  </div>

                  {filteredSlots.length > 0 ? (
                    <motion.div
                      layout
                      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5"
                    >
                      {filteredSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.hora;
                        const isPopular = ["10:00", "11:00", "15:00", "16:00", "17:00"].includes(slot.hora);
                        return (
                          <motion.button
                            key={slot.hora}
                            type="button"
                            disabled={!slot.disponible}
                            whileHover={slot.disponible ? { scale: 1.05, y: -2 } : {}}
                            whileTap={slot.disponible ? { scale: 0.95 } : {}}
                            onClick={() => setSelectedTimeSlot(slot.hora)}
                            className={`py-3.5 px-2 rounded-2xl text-xs font-black transition-all text-center flex flex-col items-center justify-center gap-0.5 relative cursor-pointer ${
                              !slot.disponible
                                ? "bg-muted/40 text-muted-foreground/30 border border-border cursor-not-allowed opacity-40"
                                : isSelected
                                ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 shadow-lg shadow-[#DFB755]/30 ring-2 ring-[#DFB755] scale-105 font-black"
                                : "bg-card border border-border/80 hover:border-[#DFB755] text-foreground hover:bg-accent/40 shadow-xs"
                            }`}
                          >
                            {isPopular && slot.disponible && !isSelected && (
                              <span className="absolute -top-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-gradient-to-r from-amber-500 to-[#DFB755] text-zinc-950 shadow-xs flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-zinc-950" />
                                <span>Top</span>
                              </span>
                            )}
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-mono font-bold text-xs">{slot.hora}</span>
                            {!slot.disponible ? (
                              <span className="text-[9px] font-normal">
                                {slot.bloqueadoPorNovedad ? "Permiso" : "Ocupado"}
                              </span>
                            ) : (
                              <span className={`text-[8.5px] font-bold ${isSelected ? "text-zinc-950/80" : "text-emerald-500"}`}>
                                {isSelected ? "Elegido" : "Libre"}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center text-xs text-muted-foreground">
                      No hay turnos disponibles en esta jornada seleccionada. Prueba con la otra jornada.
                    </div>
                  )}
                </div>
              )
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
                  <p className="text-xs text-[#DDAE41] dark:text-[#E8C466] font-semibold">
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

              {/* Titular registrado de la Cita */}
              <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DFB755]/15 text-[#DFB755] flex items-center justify-center font-black text-sm">
                    {clientProfile?.nombre?.charAt(0) || "C"}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                      Titular de la Cita (Tus Datos Registrados)
                    </span>
                    <p className="text-xs sm:text-sm font-black text-foreground">
                      {clientProfile ? `${clientProfile.nombre} ${clientProfile.apellido || ""}`.trim() : "Cliente Registrado"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="block font-semibold text-foreground">{clientProfile?.telefono || "Sin teléfono"}</span>
                  <span className="text-[11px]">{clientProfile?.correo || ""}</span>
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
                  className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-foreground text-xs focus:ring-2 focus:ring-[#DFB755]"
                />
              </div>

              {/* Total final */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DFB755]/15 to-transparent border border-[#DFB755]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block">
                    Total a pagar en barbería
                  </span>
                  <span className="text-xs text-muted-foreground">Pago en efectivo o transferencia</span>
                </div>
                <span className="text-2xl font-black text-[#DDAE41] dark:text-[#E8C466]">
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-sm shadow-xl shadow-[#DDAE41]/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Confirmando..." : "CONFIRMAR CITA"}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL ANIMADO DE CONFIRMACIÓN CON BARBER POLE 3D */}
      <BarberPoleSuccessModal
        isOpen={!!successAppointmentData}
        onClose={() => {
          setSuccessAppointmentData(null);
          navigate("/portal/mis-citas");
        }}
        appointmentData={successAppointmentData}
      />
    </div>
  );
}
