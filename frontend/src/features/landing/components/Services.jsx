import { motion } from "motion/react";

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.5l3 3-3 3M16.5 3.5l-3 3 3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5" />
      </svg>
    ),
    title: "CORTE DE CABELLO",
    desc: "Cortes modernos y clásicos adaptados a tu estilo y personalidad.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <rect x="3" y="6" width="18" height="3" rx="1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9V6a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    title: "ARREGLO CLÁSICO",
    desc: "El estilo de siempre con la precisión y detalles que mereces.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 5 5.5 5 9c0 2.5 1 4.5 3 6l1 5h6l1-5c2-1.5 3-3.5 3-6 0-3.5-3-7-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
      </svg>
    ),
    title: "ARREGLO DE BARBA",
    desc: "Perfilado y arreglo de barba para un look impecable y profesional.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 0 3.182M4.2 15a2.25 2.25 0 0 0 0 3.182" />
      </svg>
    ),
    title: "TRATAMIENTOS",
    desc: "Cuidado profesional del cabello y cuero cabelludo con productos premium.",
  },
];

export default function Services() {
  return (
    <section style={{ backgroundColor: "#0D0D0D" }} className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-3">
          <div style={{ backgroundColor: "#C9A24A", height: "1px" }} className="w-10 flex-shrink-0" />
          <span style={{ color: "#C9A24A", letterSpacing: "0.22em", fontSize: "0.68rem" }}>NUESTROS SERVICIOS</span>
        </div>
        <h2 style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700 }} className="mb-12">
          Estilo, precisión y calidad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              style={{ backgroundColor: "#151515" }}
              className="p-8 group hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#C9A24A]/40 rounded-lg transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-[#C9A24A]/5"
            >
              <div style={{ color: "#C9A24A" }} className="mb-5 transition-transform duration-300 group-hover:scale-110">
                {s.icon}
              </div>
              <h3 style={{ color: "#FFFFFF", fontSize: "0.75rem", letterSpacing: "0.14em", fontWeight: 700 }} className="mb-3">
                {s.title}
              </h3>
              <p style={{ color: "#B5B5B5", fontSize: "0.8rem", lineHeight: 1.75 }}>{s.desc}</p>
              <div style={{ backgroundColor: "#C9A24A", height: "2px" }} className="mt-7 w-8 group-hover:w-16 transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ border: "1px solid #C9A24A", color: "#C9A24A", letterSpacing: "0.14em", fontSize: "0.72rem" }}
            className="px-8 py-3 font-bold hover:bg-[#C9A24A] hover:text-black transition-all duration-200"
          >
            VER TODOS LOS SERVICIOS
          </motion.a>
        </div>
      </div>
    </section>
  );
}