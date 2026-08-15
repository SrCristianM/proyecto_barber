import { Link } from "react-router";
import { Scissors, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const HERO_IMG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function Hero() {
  return (
    <section className="pt-16 min-h-screen flex items-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center w-full py-20">
        {/* Left: copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <p style={{ color: "#C9A24A", letterSpacing: "0.28em", fontSize: "0.68rem" }} className="mb-5 font-semibold">
            MÁS QUE UN CORTE
          </p>
          <h1 style={{ lineHeight: 1.08 }}>
            <span
              className="block text-white"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              UNA EXPERIENCIA
            </span>
            <span
              className="block"
              style={{ color: "#C9A24A", fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              A TU ESTILO
            </span>
          </h1>
          <p style={{ color: "#B5B5B5", fontSize: "0.88rem", lineHeight: 1.8 }} className="mt-7 mb-9 max-w-md">
            En Tu Turno Barbería combinamos pasión, precisión y estilo para ofrecerte siempre lo mejor. Tu imagen merece nuestros mejores servicios.
          </p>
          <Link
            to="/login"
            style={{ backgroundColor: "#C9A24A", color: "#0D0D0D", letterSpacing: "0.1em", fontSize: "0.8rem" }}
            className="inline-flex items-center gap-2 px-8 py-3.5 font-bold hover:bg-[#E0B85C] transition-colors duration-200"
          >
            RESERVAR CITA <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: image */}
        <div className="relative h-[420px] lg:h-[580px] order-1 lg:order-2">
          <ImageWithFallback
            src={HERO_IMG}
            alt="Barbero cortando el cabello con precisión"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.8)" }}
          />
          <div
            style={{ backgroundColor: "#C9A24A" }}
            className="absolute bottom-8 -left-4 hidden lg:flex w-24 h-24 items-center justify-center"
          >
            <Scissors className="w-10 h-10 text-black" />
          </div>
          <div
            style={{ backgroundColor: "#C9A24A", top: 0, right: 0, width: "3px", height: "55%" }}
            className="absolute hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
}