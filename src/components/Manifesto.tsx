import { motion } from "framer-motion";

export const Manifesto = () => {
  return (
    <section className="bg-brand-hot text-white py-32 px-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="heart-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10,15 C9,15 8,14 8,12 C8,10 9,9 10,8 C11,9 12,10 12,12 C12,14 11,15 10,15 Z" fill="currentColor" />
          </pattern>
          <rect x="0" y="0" width="100" height="100" fill="url(#heart-pattern)"></rect>
        </svg>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <p className="font-dela text-brand-hot text-xl">
            Наша миссия
          </p>

          <h2 className="font-dela text-[clamp(40px,7vw,80px)] leading-[1.1] max-w-5xl mx-auto">
            Мы делаем самую <br />
            <span className="text-brand-dark">вкусную клубнику</span> <br />
            в шоколаде
          </h2>

          <p className="font-dela text-[clamp(24px,5vw,60px)] text-white max-w-4xl mx-auto mt-12 mb-16">
            ...и доставим её прямо к 8 марта 🌹
          </p>

          <div className="pt-8">
            <div className="inline-block relative">
              <a href="#order" className="inline-block px-10 py-5 bg-white text-brand-hot rounded-full font-bold text-xl hover:bg-brand-cream active:scale-95 transition-all duration-200">
                Забронировать дату
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
