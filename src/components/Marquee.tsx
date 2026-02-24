import { motion } from "framer-motion";

export const Marquee = () => {
  return (
    <div className="bg-brand-hot text-white py-4 overflow-hidden border-y-4 border-brand-dark rotate-1 z-20 relative w-[110vw] -translate-x-[5vw] my-10">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-4">
            <span className="font-dela text-3xl">Свежая клубника</span>
            <span className="text-2xl opacity-50">✦</span>
            <span className="font-dela text-3xl">Belgian chocolate</span>
            <span className="text-2xl opacity-50">✦</span>
            <span className="font-dela text-3xl">Подарок к 8 марта</span>
            <span className="text-2xl opacity-50">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
