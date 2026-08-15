"use client";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "./utils";

// Estilos inline para ocultar las flechitas del scroll y hacerlo minimalista
const scrollStyles = `
  [data-slot="scroll-area-scrollbar"] {
    background: transparent !important;
    padding: 0 !important;
  }
  
  [data-slot="scroll-area-scrollbar"] button,
  [data-slot="scroll-area-scrollbar"] [data-radix-scroll-area-scroll-area-button] {
    display: none !important;
    visibility: hidden !important;
  }
  
  [data-slot="scroll-area-thumb"] {
    background-color: rgba(107, 114, 128, 0.2) !important;
    border-radius: 1px !important;
    width: 4px !important;
  }
  
  [data-slot="scroll-area-thumb"]:hover {
    background-color: rgba(107, 114, 128, 0.35) !important;
  }
`;

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <>
      <style>{scrollStyles}</style>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        data-slot="scroll-area-scrollbar"
        orientation={orientation}
        className={cn(
          "flex touch-none p-px transition-colors select-none !bg-transparent",
          orientation === "vertical" && "h-full w-2 border-l border-transparent",
          orientation === "horizontal" && "h-2 flex-col border-t border-transparent",
          className
        )}
        {...props}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb
          data-slot="scroll-area-thumb"
          className="bg-gray-400/20 hover:bg-gray-400/35 transition-colors relative flex-1 rounded-xs"
        />

      </ScrollAreaPrimitive.ScrollAreaScrollbar>
    </>
  );
}
