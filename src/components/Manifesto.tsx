import { motion } from "framer-motion";
import data from "../data/products.json";

const StrawberryIcon = () => (
  <svg className="inline-block w-[0.9em] h-[0.9em] align-baseline mb-[-0.1em] mx-2" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 60C32 60 10 46 10 28C10 16 18 8 32 8C46 8 54 16 54 28C54 46 32 60 32 60Z" fill="#FFF" />
    <path d="M32 12C32 12 28 2 20 4C12 6 24 14 24 14L32 12Z" fill="#22C55E" opacity="0.9" />
    <path d="M32 12C32 12 36 2 44 4C52 6 40 14 40 14L32 12Z" fill="#22C55E" opacity="0.9" />
    <circle cx="24" cy="28" r="2" fill="#FF4D8D" />
    <circle cx="40" cy="28" r="2" fill="#FF4D8D" />
    <circle cx="32" cy="40" r="2" fill="#FF4D8D" />
    <circle cx="24" cy="44" r="2" fill="#FF4D8D" />
    <circle cx="40" cy="44" r="2" fill="#FF4D8D" />
  </svg>
);

const TruckIcon = () => (
  <svg className="inline-block w-[0.9em] h-[0.9em] align-baseline mb-[-0.05em] mx-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export const Manifesto = () => {
  const { manifesto } = data;

  return (
    <section className="bg-brand-hot text-white py-16 md:py-24 px-4 overflow-hidden relative" id="about">
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
          className="space-y-3"
        >
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo.webp"
                alt="Апельсинка"
                loading="lazy"
                decoding="async"
                className="w-[85%] h-[85%] object-contain"
              />
            </div>
          </div>
          <p className="font-dela text-white text-xl">
            О нас
          </p>

          <h2 className="font-dela text-[clamp(24px,5vw,56px)] leading-[1.2] max-w-5xl mx-auto mb-4">
            {manifesto.title}<StrawberryIcon /><br />
            <span className="text-brand-dark">{manifesto.deliveryText}<TruckIcon /></span>
          </h2>

          <div className="max-w-4xl mx-auto text-left space-y-6 font-sans text-xl md:text-2xl leading-relaxed opacity-90 pt-4">
            <p>
              <strong className="text-brand-dark">{manifesto.brandName}</strong> — {manifesto.history}
            </p>
            <p className="text-brand-dark/80 font-bold mt-8 md:text-3xl">
              {manifesto.mission}
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-white/20 max-w-sm mx-auto">
            <a href="https://vk.ru/apelsinka_bar" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors scale-125 hover:scale-150 duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 2.129 2.519 3.618 2.519h2.1c.539 0 1.122-.228 1.122-.888 0-.825-1.122-2.152-2.316-3.376-1.296-1.332-1.476-1.574-.18-3.072 1.836-2.128 2.808-3.456 3.12-4.104.312-.648-.156-.96-.864-.96h-2.34c-.66 0-.852.3-1.056.684-1.02 2.352-2.424 4.548-3.924 6.228-.624.708-.948.864-1.248.648-.492-.36-.456-1.908-.456-2.58 0-1.896.348-3.264-1.032-3.66-1.092-.312-3.468-.216-4.596.396-.684.372-1.008 1.056-.636 1.08.492.036 1.188.24 1.548 1.008.456.96.396 2.544.396 2.544s.132 1.632-.576 2.016c-.924.492-2.28-1.512-3.348-3.612-.468-.924-.708-1.332-1.08-1.332H2.202c-.528 0-.756.24-.756.636 0 .54.672 2.4 2.892 5.568 2.904 4.14 6.012 6.78 8.824 6.78z" />
              </svg>
            </a>
            <a href="https://t.me/apelsinka_bar" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors scale-125 hover:scale-150 duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1.002.32.023.467.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/apelsinka.bar?igsh=NDByb3lyZTJhc2dk&utm_source=qr" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors scale-125 hover:scale-150 duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
