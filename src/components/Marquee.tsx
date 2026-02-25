import { motion } from "framer-motion";

const phrases = [
  "Belgian Chocolate",
  "Свежая клубника",
  "Малина в шоколаде",
  "Клубника Limeberry",
  "Сублимированные фрукты",
  "Идеально на 8 марта",
  "На день рождения",
  "Без повода",
  "Для признания в любви"
];

export const Marquee = () => {
  return (
    <div className="bg-brand-hot text-white py-4 md:py-5 overflow-hidden border-y-[3px] border-brand-dark rotate-[-1deg] z-20 relative w-screen my-12 shadow-2xl">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "linear"
        }}
      >
        {/* Рендерим дважды для бесконечного цикла */}
        {[1, 2].map((group) => (
          <div key={group} className="flex items-center">
            {phrases.map((text, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-12 px-2 md:px-6">
                <span className="font-dela text-xl md:text-4xl tracking-tight uppercase">{text}</span>
                <span className="text-xl md:text-3xl opacity-40">✦</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
