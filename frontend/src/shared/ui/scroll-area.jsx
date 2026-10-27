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
    background-color: rgba(107, 114, 128, 0.28) !important;
    border-radius: 9999px !important;
    width: 5px !important;
    transition: background-color 0.2s ease !important;
  }
  
  [data-slot="scroll-area-thumb"]:hover {
    background-color: rgba(107, 114, 128, 0.5) !important;
  }

  .dark [data-slot="scroll-area-thumb"],
  html.dark [data-slot="scroll-area-thumb"] {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }

  .dark [data-slot="scroll-area-thumb"]:hover,
  html.dark [data-slot="scroll-area-thumb"]:hover {
    background-color: rgba(212, 175, 55, 0.75) !important;
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
