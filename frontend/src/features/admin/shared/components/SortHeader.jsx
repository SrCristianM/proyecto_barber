import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function SortHeader({ label, field, current, dir, onSort }) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
    >
      {label}
      <span className={`transition-colors ${active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`}>
        {active ? (
          dir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
