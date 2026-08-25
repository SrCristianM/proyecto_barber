import { useState, useRef, useCallback } from "react";
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
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return t > s && t < e;
}

/**
 * Calendario con selección de rango de fechas.
 * Soporta:
 *  - Click-click para seleccionar inicio/fin
 *  - Drag (mousedown → mousemove → mouseup) para seleccionar rango arrastrando
 *  - Modo single para seleccionar una sola fecha
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
  const [selecting, setSelecting] = useState("start");

  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const [dragEnd, setDragEnd] = useState(null);

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

  // ---- Click handling ----
  const handleDayClick = (date) => {
    if (isDragging.current) return; // drag finaliza via mouseup, no click
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

  // ---- Drag handling ----
  const handleMouseDown = useCallback((date) => {
    if (singleMode) return;
    isDragging.current = false; // aún no confirmamos drag
    dragStart.current = date;
    setDragEnd(null);
  }, [singleMode]);

  const handleMouseEnter = useCallback((date) => {
    setHoverDate(date);
    if (dragStart.current) {
      isDragging.current = true; // si hay dragStart y entró a otro día, es drag
      setDragEnd(date);
    }
  }, []);

  const handleMouseUp = useCallback((date) => {
    if (!singleMode && isDragging.current && dragStart.current) {
      const start = dragStart.current < date ? dragStart.current : date;
      const end = dragStart.current < date ? date : dragStart.current;
      onRangeChange?.({ start, end });
      setSelecting("start");
    }
    isDragging.current = false;
    dragStart.current = null;
    setDragEnd(null);
  }, [singleMode, onRangeChange]);

  // Reset drag if mouse leaves calendar
  const handleMouseLeave = useCallback(() => {
    if (isDragging.current && dragStart.current) {
      // Mantener selección parcial pero limpiar drag
      isDragging.current = false;
      dragStart.current = null;
      setDragEnd(null);
    }
    setHoverDate(null);
  }, []);

  // ---- Render ----
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewYear, viewMonth, d));
  }

  // Durante drag, el rango visual usa dragStart + dragEnd
  const visualStart = dragEnd && dragStart.current
    ? (dragStart.current < dragEnd ? dragStart.current : dragEnd)
    : effectiveStart;
  const visualEnd = dragEnd && dragStart.current
    ? (dragStart.current < dragEnd ? dragEnd : dragStart.current)
    : (hoverDate || effectiveEnd);

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
      <div
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm select-none"
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-accent rounded-lg transition-colors text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {MONTHS_ES[viewMonth]} {viewYear}
          </span>
          <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-accent rounded-lg transition-colors text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;

              const isStart = isSameDay(date, visualStart);
              const isEnd = isSameDay(date, effectiveEnd) || (dragEnd && isSameDay(date, dragEnd));
              const inRange = isInRange(date, visualStart, visualEnd);
              const isSelected = isStart || isEnd;
              const isToday = isSameDay(date, today);
              const isDragPreview = Boolean(dragEnd);

              let cls = "w-full aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all ";
              if (isSelected) {
                cls += "bg-primary text-primary-foreground font-semibold shadow-sm";
              } else if (inRange) {
                cls += `${isDragPreview ? "bg-primary/20" : "bg-primary/15"} text-primary font-medium rounded-none`;
              } else if (isToday) {
                cls += "ring-1 ring-primary text-primary font-semibold hover:bg-primary/10";
              } else {
                cls += "text-foreground hover:bg-accent";
              }

              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  className={cls}
                  onClick={() => handleDayClick(date)}
                  onMouseDown={() => handleMouseDown(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  onMouseUp={() => handleMouseUp(date)}
                  onMouseLeave={() => setHoverDate(null)}
                  draggable={false}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hint */}
        {!singleMode && (
          <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground text-center">
            {dragEnd
              ? "Suelta para confirmar el rango"
              : selecting === "start"
              ? "Click o arrastra para seleccionar rango"
              : "Selecciona fecha de fin"}
          </div>
        )}
      </div>
    </div>
  );
}
