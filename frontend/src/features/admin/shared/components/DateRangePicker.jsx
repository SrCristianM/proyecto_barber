import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const MONTHS_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
const DAYS_ES = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // 0=Sun -> convert to Mon-based (0=Mon)
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}

/**
 * Calendario moderno con selección de rango de fechas.
 * Diseño premium consistente con el sistema de diseño del proyecto.
 *
 * @param {Date|null} startDate - Fecha inicio seleccionada
 * @param {Date|null} endDate - Fecha fin seleccionada
 * @param {Function} onRangeChange - Callback con ({ start, end })
 * @param {boolean} singleMode - Si true, solo selecciona 1 fecha
 * @param {Date|null} value - Para modo single
 * @param {Function} onChange - Para modo single
 */
export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  singleMode = false,
  value,
  onChange,
  label
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState("start"); // "start" | "end"

  const effectiveStart = singleMode ? value : startDate;
  const effectiveEnd = singleMode ? null : endDate;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (date) => {
    if (singleMode) {
      onChange?.(date);
      return;
    }
    if (selecting === "start" || !effectiveStart) {
      onRangeChange?.({ start: date, end: null });
      setSelecting("end");
    } else {
      if (date < effectiveStart) {
        onRangeChange?.({ start: date, end: effectiveStart });
      } else {
        onRangeChange?.({ start: effectiveStart, end: date });
      }
      setSelecting("start");
    }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewYear, viewMonth, d));
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      {/* Rango seleccionado */}
      {!singleMode && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="flex items-center gap-2 text-sm">
            <span className={effectiveStart ? "text-foreground font-medium" : "text-muted-foreground"}>
              {effectiveStart ? formatDate(effectiveStart) : "Fecha inicio"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={effectiveEnd ? "text-foreground font-medium" : "text-muted-foreground"}>
              {effectiveEnd ? formatDate(effectiveEnd) : "Fecha fin"}
            </span>
          </div>
          {(effectiveStart || effectiveEnd) && (
            <button
              type="button"
              onClick={() => { onRangeChange?.({ start: null, end: null }); setSelecting("start"); }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Calendario */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Header navegación */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {MONTHS_ES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-3">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;

              const isStart = isSameDay(date, effectiveStart);
              const isEnd = isSameDay(date, effectiveEnd);
              const isToday = isSameDay(date, today);
              const inRange = isInRange(date, effectiveStart, hoverDate || effectiveEnd);
              const isSelected = isStart || isEnd;

              let cellClass = "w-full aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all select-none ";

              if (isSelected) {
                cellClass += "bg-primary text-primary-foreground font-semibold shadow-sm";
              } else if (inRange) {
                cellClass += "bg-primary/15 text-primary font-medium rounded-none";
              } else if (isToday) {
                cellClass += "ring-1 ring-primary text-primary font-semibold hover:bg-primary/10";
              } else {
                cellClass += "text-foreground hover:bg-accent";
              }

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  className={cellClass}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer hint */}
        {!singleMode && (
          <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground text-center">
            {selecting === "start" ? "Selecciona fecha de inicio" : "Selecciona fecha de fin"}
          </div>
        )}
      </div>
    </div>
  );
}
