import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  CalendarCheck,
  Sun,
  Flame,
  ArrowRight,
  Info,
  UserCheck
} from "lucide-react";
import {
  getLocalDateString,
  parseLocalDate,
  addDays,
  formatDateDisplay
} from "../../../shared/utils/dateUtils.js";
import {
  getAvailableSlots,
  getBarberWorkingDays,
  isBarberWorkingOnDate
} from "../services/clientStorageService.js";

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS_ES = [
  { short: "Lun", full: "Lunes" },
  { short: "Mar", full: "Martes" },
  { short: "Mié", full: "Miércoles" },
  { short: "Jue", full: "Jueves" },
  { short: "Vie", full: "Viernes" },
  { short: "Sáb", full: "Sábado", isWeekend: true },
  { short: "Dom", full: "Domingo", isWeekend: true }
];

export default function ClientBookingDatePicker({
  selectedDate,
  onDateChange,
  selectedBarber,
  schedules = [],
  onContinue
}) {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const todayDate = useMemo(() => parseLocalDate(todayStr), [todayStr]);

  // Inicializar mes y año de vista basado en la fecha seleccionada o la actual
  const initialViewDate = useMemo(() => {
    return selectedDate ? parseLocalDate(selectedDate) : todayDate;
  }, [selectedDate, todayDate]);

  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth()); // 0-indexed
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Sincronizar vista si cambia externamente la fecha seleccionada
  React.useEffect(() => {
    if (selectedDate) {
      const parsed = parseLocalDate(selectedDate);
      if (parsed.getFullYear() !== viewYear || parsed.getMonth() !== viewMonth) {
        // Solo ajustar si el usuario está en otro año o mes muy alejado
        // setViewYear(parsed.getFullYear());
        // setViewMonth(parsed.getMonth());
      }
    }
  }, [selectedDate]);

  // Manejadores de navegación de mes
  const handlePrevMonth = () => {
    setDirection(-1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setDirection(viewYear > todayDate.getFullYear() || (viewYear === todayDate.getFullYear() && viewMonth > todayDate.getMonth()) ? -1 : 1);
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
  };

  const isCurrentMonthView =
    viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth();

  const isPastMonthView =
    viewYear < todayDate.getFullYear() ||
    (viewYear === todayDate.getFullYear() && viewMonth < todayDate.getMonth());

  // Construcción de la cuadrícula de días para el mes actual
  const monthData = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // En JS getDay(): 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Ajustar para que Lunes = 0 y Domingo = 6
    const firstDayJs = new Date(viewYear, viewMonth, 1).getDay();
    const firstDayIndex = (firstDayJs + 6) % 7;

    const days = [];
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayIso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const isPast = dayIso < todayStr;
      const isToday = dayIso === todayStr;
      const isSelected = dayIso === selectedDate;

      // Calcular disponibilidad para este barbero
      let status = "available";
      let freeCount = 0;
      let reason = "";

      if (!isPast && selectedBarber?.id_barbero) {
        const workingCheck = isBarberWorkingOnDate(selectedBarber.id_barbero, dayIso);
        if (!workingCheck.isWorking) {
          status = "non-working";
          reason = "No labora";
        } else {
          const slots = getAvailableSlots(selectedBarber.id_barbero, dayIso);
          if (slots.length === 0) {
            status = "non-working";
            reason = "No labora";
          } else if (slots.every((s) => s.bloqueadoPorNovedad)) {
            status = "novelty";
            reason = slots[0]?.novedadMotivo || "Permiso";
          } else {
            freeCount = slots.filter((s) => s.disponible).length;
            if (freeCount === 0) {
              status = "full";
              reason = "Lleno";
            } else {
              status = "available";
            }
          }
        }
      }

      days.push({
        dayNum,
        dayIso,
        isPast,
        isToday,
        isSelected,
        status,
        freeCount,
        reason
      });
    }

    return { daysInMonth, firstDayIndex, days };
  }, [viewYear, viewMonth, todayStr, selectedDate, selectedBarber, schedules]);

  // Accesos rápidos inteligentes (Chips exclusivamente en días laborales del barbero)
  const quickChips = useMemo(() => {
    const barberId = selectedBarber?.id_barbero;
    if (!barberId) return [];

    const chips = [];

    // 1. Hoy (solo si labora hoy)
    if (isBarberWorkingOnDate(barberId, todayStr).isWorking) {
      const todaySlots = getAvailableSlots(barberId, todayStr);
      const todayFree = todaySlots.filter((s) => s.disponible).length;
      chips.push({
        id: "today",
        label: "Hoy",
        dateStr: todayStr,
        badgeText: todayFree > 0 ? `${todayFree} turnos` : "Lleno",
        isAvailable: todayFree > 0,
        icon: Sun
      });
    }

    // 2. Mañana (solo si labora mañana)
    const tomorrowStr = addDays(todayStr, 1);
    if (isBarberWorkingOnDate(barberId, tomorrowStr).isWorking) {
      const tomorrowSlots = getAvailableSlots(barberId, tomorrowStr);
      const tomorrowFree = tomorrowSlots.filter((s) => s.disponible).length;
      chips.push({
        id: "tomorrow",
        label: "Mañana",
        dateStr: tomorrowStr,
        badgeText: tomorrowFree > 0 ? `${tomorrowFree} turnos` : "Lleno",
        isAvailable: tomorrowFree > 0,
        icon: CalendarIcon
      });
    }

    // 3. Buscar los siguientes días laborables reales con turnos disponibles
    const existingDates = new Set(chips.map((c) => c.dateStr));

    for (let i = 1; i <= 28 && chips.length < 4; i++) {
      const testDate = addDays(todayStr, i);
      if (existingDates.has(testDate)) continue;

      if (isBarberWorkingOnDate(barberId, testDate).isWorking) {
        const testSlots = getAvailableSlots(barberId, testDate);
        const free = testSlots.filter((s) => s.disponible).length;
        if (free > 0) {
          existingDates.add(testDate);
          const parsed = parseLocalDate(testDate);
          const dayName = WEEKDAYS_ES[(parsed.getDay() + 6) % 7].short;
          const dayNumber = parsed.getDate();
          chips.push({
            id: `chip-${testDate}`,
            label: `${dayName} ${dayNumber}`,
            dateStr: testDate,
            badgeText: `${free} turnos`,
            isAvailable: true,
            icon: Sparkles
          });
        }
      }
    }

    return chips;
  }, [selectedBarber, todayStr, schedules]);


  // Información del día actualmente seleccionado
  const selectedDayInfo = useMemo(() => {
    if (!selectedDate || !selectedBarber?.id_barbero) return null;
    const slots = getAvailableSlots(selectedBarber.id_barbero, selectedDate);
    const isPast = selectedDate < todayStr;
    const isToday = selectedDate === todayStr;

    if (isPast) {
      return {
        isValid: false,
        status: "past",
        message: "No puedes agendar citas en fechas pasadas.",
        freeCount: 0
      };
    }

    if (slots.length === 0) {
      return {
        isValid: false,
        status: "non-working",
        message: `${selectedBarber.nombre} no presta servicio en este día de la semana.`,
        freeCount: 0
      };
    }

    if (slots.every((s) => s.bloqueadoPorNovedad)) {
      return {
        isValid: false,
        status: "novelty",
        message: `${selectedBarber.nombre} tiene una novedad aprobada (${slots[0]?.novedadMotivo || "Permiso"}) en esta fecha.`,
        freeCount: 0
      };
    }

    const freeCount = slots.filter((s) => s.disponible).length;
    if (freeCount === 0) {
      return {
        isValid: false,
        status: "full",
        message: "Todos los turnos de este día ya han sido reservados.",
        freeCount: 0
      };
    }

    return {
      isValid: true,
      status: "available",
      message: `¡Excelente! Hay ${freeCount} horario(s) disponible(s) para ti.`,
      freeCount,
      isToday
    };
  }, [selectedDate, selectedBarber, todayStr]);

  const handleSelectDay = (dayIso, status, isPast) => {
    if (isPast || status === "non-working" || status === "novelty") return;
    onDateChange(dayIso);

    // Si el día seleccionado está en otro mes, ajustar vista
    const parsed = parseLocalDate(dayIso);
    if (parsed.getMonth() !== viewMonth || parsed.getFullYear() !== viewYear) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  };

  const barberScheduleSummary = useMemo(() => {
    if (!selectedBarber?.id_barbero) return "Sin horario asignado";
    return getBarberWorkingDays(selectedBarber.id_barbero).summary;
  }, [selectedBarber, schedules]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. CHIPS DE ACCESO RÁPIDO (RECOMENDADOS)
          ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DFB755] animate-pulse" />
            Accesos Rápidos Recomendados
          </span>
          <span className="text-[11px] text-muted-foreground">
            Elige con un solo toque
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickChips.map((chip) => {
            const isChipSelected = selectedDate === chip.dateStr;
            const Icon = chip.icon;

            return (
              <motion.button
                key={chip.id}
                type="button"
                whileHover={chip.isAvailable ? { y: -2, scale: 1.02 } : {}}
                whileTap={chip.isAvailable ? { scale: 0.96 } : {}}
                onClick={() => {
                  if (!chip.isAvailable) return;
                  onDateChange(chip.dateStr);
                  const parsed = parseLocalDate(chip.dateStr);
                  setViewYear(parsed.getFullYear());
                  setViewMonth(parsed.getMonth());
                }}
                disabled={!chip.isAvailable}
                className={`group relative p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  !chip.isAvailable
                    ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/50"
                    : isChipSelected
                    ? "bg-gradient-to-br from-[#DFB755]/15 via-card to-[#E8C466]/10 border-[#DFB755] shadow-md shadow-[#DFB755]/15 ring-2 ring-[#DFB755]/40"
                    : "bg-card/70 hover:bg-card border-border/80 hover:border-[#DFB755]/50 shadow-sm cursor-pointer"
                }`}
              >
                {/* Glow decorativo activo */}
                {isChipSelected && (
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#DFB755]/20 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex items-start justify-between w-full mb-1">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isChipSelected
                        ? "bg-[#DFB755] text-zinc-950 font-bold"
                        : "bg-muted text-muted-foreground group-hover:text-[#DFB755] group-hover:bg-[#DFB755]/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isChipSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full bg-[#DFB755] text-zinc-950 flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </motion.div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground line-clamp-1">
                    {chip.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {chip.dateStr.split("-").reverse().slice(0, 2).join("/")}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      chip.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold truncate ${
                      chip.isAvailable
                        ? isChipSelected
                          ? "text-[#DFB755] dark:text-[#E8C466]"
                          : "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {chip.badgeText}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. CALENDARIO MENSUAL DE ALTO DISEÑO CON ANIMACIÓN
          ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/90 shadow-xl shadow-black/5 relative overflow-hidden backdrop-blur-sm">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#DFB755]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* CABECERA DE CONTROL DE MES */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/70 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#DFB755]" />
                <span>
                  {MONTH_NAMES_ES[viewMonth]} {viewYear}
                </span>
              </h3>

              {!isCurrentMonthView && (
                <button
                  type="button"
                  onClick={handleResetToCurrentMonth}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DFB755]/15 text-[#DFB755] hover:bg-[#DFB755]/25 transition-colors border border-[#DFB755]/30"
                >
                  Ir a mes actual
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Toca un día para agendar con{" "}
              <strong className="text-foreground font-semibold">
                {selectedBarber?.nombre || "tu barbero"}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border border-border/80">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevMonth}
              disabled={isPastMonthView}
              className={`p-2 rounded-xl transition-all ${
                isPastMonthView
                  ? "opacity-30 cursor-not-allowed text-muted-foreground"
                  : "hover:bg-card hover:text-foreground text-muted-foreground hover:shadow-sm"
              }`}
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm transition-all"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* NOMBRES DE DÍAS DE LA SEMANA */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center relative z-10">
          {WEEKDAYS_ES.map((w) => (
            <div
              key={w.short}
              className={`py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider ${
                w.isWeekend
                  ? "text-[#DFB755] dark:text-[#E8C466]/90"
                  : "text-muted-foreground"
              }`}
            >
              {w.short}
            </div>
          ))}
        </div>

        {/* GRILLA DE DÍAS CON ANIMACIÓN DE ENTRADA */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 25 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid grid-cols-7 gap-1.5 sm:gap-2 relative z-10"
          >
            {/* Días vacíos de relleno para el inicio del mes */}
            {Array.from({ length: monthData.firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[56px] sm:min-h-[64px] rounded-2xl opacity-0 pointer-events-none"
              />
            ))}

            {/* Días del mes */}
            {monthData.days.map((day) => {
              const {
                dayNum,
                dayIso,
                isPast,
                isToday,
                isSelected,
                status,
                freeCount,
                reason
              } = day;

              // Clases y estilos condicionales según el estado
              let cellClasses = "";
              let badgeColor = "";
              let badgeLabel = "";

              if (isSelected) {
                cellClasses =
                  "bg-gradient-to-br from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black shadow-lg shadow-[#DFB755]/30 ring-2 ring-[#DFB755] ring-offset-2 ring-offset-background z-20 scale-[1.04]";
              } else if (isPast) {
                cellClasses =
                  "opacity-30 bg-muted/20 text-muted-foreground/70 cursor-not-allowed border border-transparent";
              } else if (status === "non-working") {
                cellClasses =
                  "opacity-40 bg-muted/20 text-muted-foreground/60 border border-dashed border-border/60 cursor-not-allowed select-none";
                badgeLabel = "No labora";
                badgeColor = "text-muted-foreground/60";
              } else if (status === "novelty") {
                cellClasses =
                  "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/15 cursor-not-allowed select-none";
                badgeLabel = reason || "Permiso";
                badgeColor = "text-amber-600 dark:text-amber-400";
              } else if (status === "full") {
                cellClasses =
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 hover:bg-rose-500/15 cursor-not-allowed";
                badgeLabel = "Lleno";
                badgeColor = "text-rose-500";
              } else {
                // Disponible
                cellClasses =
                  "bg-card/80 hover:bg-card border border-border/80 hover:border-[#DFB755]/70 text-foreground shadow-sm hover:shadow-md cursor-pointer group";
                badgeLabel = `${freeCount} cupos`;
                badgeColor = "text-emerald-600 dark:text-emerald-400";
              }

              const isSelectable = !isPast && status !== "non-working" && status !== "novelty";

              return (
                <motion.button
                  key={dayIso}
                  type="button"
                  whileHover={isSelectable ? { y: -2, scale: 1.03 } : {}}
                  whileTap={isSelectable ? { scale: 0.95 } : {}}
                  onClick={() => handleSelectDay(dayIso, status, isPast)}
                  disabled={!isSelectable}
                  className={`min-h-[58px] sm:min-h-[66px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between items-center transition-all duration-200 relative overflow-hidden ${cellClasses}`}
                >
                  {/* Etiqueta de "HOY" si no está seleccionado */}
                  {isToday && !isSelected && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DFB755] ring-2 ring-background animate-pulse" />
                  )}

                  {/* Número de día */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        isSelected ? "text-zinc-950" : ""
                      }`}
                    >
                      {dayNum}
                    </span>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3.5 h-3.5 rounded-full bg-zinc-950 text-white flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Micro Badge inferior */}
                  <div className="w-full flex items-center justify-center mt-auto">
                    {isSelected ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-950/90 truncate">
                        Elegido
                      </span>
                    ) : badgeLabel ? (
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] font-bold leading-none truncate max-w-full ${badgeColor}`}
                      >
                        {badgeLabel}
                      </span>
                    ) : (
                      <span className="h-2" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* GUÍA DE CONVENCIONES / LEYENDA */}
        <div className="mt-5 pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Turnos Disponibles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DFB755]" />
            <span className="font-semibold text-foreground">Seleccionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
            <span>Descanso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Novedad/Permiso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Sin Turnos</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. TARJETA DINÁMICA DE ESTADO Y CONFIRMACIÓN DE LA FECHA SELECCIONADA
          ========================================================================= */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
              selectedDayInfo?.isValid
                ? "bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                : "bg-gradient-to-br from-destructive/10 via-card to-card border-destructive/30 shadow-lg shadow-destructive/5"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    selectedDayInfo?.isValid
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-destructive/15 text-destructive border border-destructive/20"
                  }`}
                >
                  {selectedDayInfo?.isValid ? (
                    <CalendarCheck className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Fecha Seleccionada
                    </span>
                    {selectedDayInfo?.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DFB755] text-zinc-950">
                        HOY
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedDayInfo?.isValid
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {selectedDayInfo?.isValid
                        ? `${selectedDayInfo.freeCount} turnos libres`
                        : "No disponible"}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-foreground capitalize">
                    {formatDateDisplay(selectedDate)}
                  </h4>

                  <p
                    className={`text-xs ${
                      selectedDayInfo?.isValid
                        ? "text-muted-foreground"
                        : "text-destructive font-medium"
                    }`}
                  >
                    {selectedDayInfo?.message}
                  </p>
                </div>
              </div>

              {selectedDayInfo?.isValid && onContinue && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onContinue}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-zinc-950 font-black text-xs sm:text-sm shadow-md shadow-[#DFB755]/20 flex items-center justify-center gap-2 shrink-0 hover:brightness-105 transition-all"
                >
                  <span>Continuar a Horario</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Aviso informativo de barbero */}
            {selectedBarber && (
              <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <UserCheck className="w-3.5 h-3.5 text-[#DFB755]" />
                  Barbero asignado:{" "}
                  <strong>
                    {selectedBarber.nombre} ({selectedBarber.especialidad})
                  </strong>
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  Jornada: {barberScheduleSummary}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
