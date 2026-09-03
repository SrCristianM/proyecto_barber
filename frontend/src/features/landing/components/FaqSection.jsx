import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router";

const FAQS = [
  {
    id: 1,
    question: "¿Necesito reservar cita previa o puedo llegar sin cita?",
    answer:
      "Recomendamos siempre reservar a través de nuestra plataforma web para garantizar tu horario sin esperas. Sin embargo, si tenemos cupo disponible, con gusto te atenderemos por orden de llegada.",
  },
  {
    id: 2,
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos todos los medios de pago: Efectivo, Tarjetas de Débito y Crédito (Visa, Mastercard, American Express), Transferencias bancarias y billeteras digitales.",
  },
  {
    id: 3,
    question: "¿Con cuánta anticipación puedo cancelar o reagendar mi turno?",
    answer:
      "Puedes reagendar o cancelar tu turno directamente desde tu panel de usuario con al menos 2 horas de anticipación sin ningún tipo de penalidad ni recargo.",
  },
  {
    id: 4,
    question: "¿Qué incluye la experiencia de corte o barba?",
    answer:
      "Todos nuestros servicios incluyen asesoramiento de visagismo personalizado, toallas calientes aromatizadas, bebida de cortesía (café de especialidad, agua o cerveza premium) y productos de finalizado de alta gama.",
  },
  {
    id: 5,
    question: "¿Tienen paquetes especiales para novios o grupos?",
    answer:
      "¡Sí! Contamos con experiencias exclusivas a puerta cerrada para novios, padrinos y eventos empresariales. Puedes escribirnos directamente a través de WhatsApp para coordinar tu paquete a medida.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState(1);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-gold w-[400px] h-[400px] top-1/4 right-0 opacity-15" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
            <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
              RESOLVEMOS TUS DUDAS
            </span>
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
            Preguntas <span className="text-gold-gradient">Frecuentes</span>
          </h2>
          <p className="text-[#8E8E93] text-sm mt-3">
            Todo lo que necesitas saber antes de tu visita a Tu Turno Barbería.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={false}
                className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-[#141414] border-[#C9A24A]/60 shadow-[0_10px_25px_rgba(201,162,74,0.1)]"
                    : "bg-[#111111] border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-white font-bold text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen
                        ? "bg-[#C9A24A] text-black"
                        : "bg-white/5 text-[#8E8E93]"
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-[#9E9E9E] text-xs sm:text-sm leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-[#C9A24A] flex-shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">¿Tienes alguna otra consulta?</h4>
              <p className="text-[#7A7A7A] text-xs">Nuestro equipo está disponible para asesorarte de inmediato.</p>
            </div>
          </div>

          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-[#C9A24A] text-white hover:text-black border border-white/10 hover:border-[#C9A24A] font-bold text-xs tracking-wider transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ESCRIBIR POR WHATSAPP</span>
          </a>
        </div>
      </div>
    </section>
  );
}
