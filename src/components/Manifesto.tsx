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
            <a href="https://vk.ru/apelsinka_bar" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors">
              <svg width="28" height="28" viewBox="0 0 101 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.52944 7.02944C0.5 14.0589 0.5 25.3726 0.5 48V52C0.5 74.6274 0.5 85.9411 7.52944 92.9706C14.5589 100 25.8726 100 48.5 100H52.5C75.1274 100 86.4411 100 93.4706 92.9706C100.5 85.9411 100.5 74.6274 100.5 52V48C100.5 25.3726 100.5 14.0589 93.4706 7.02944C86.4411 0 75.1274 0 52.5 0H48.5C25.8726 0 14.5589 0 7.52944 7.02944ZM17.3752 30.4169C17.9168 56.4169 30.9167 72.0418 53.7084 72.0418H55.0003V57.1668C63.3753 58.0001 69.7082 64.1252 72.2498 72.0418H84.0835C80.8335 60.2085 72.2914 53.6668 66.9581 51.1668C72.2914 48.0835 79.7915 40.5835 81.5831 30.4169H70.8328C68.4995 38.6669 61.5836 46.1668 55.0003 46.8751V30.4169H44.2499V59.2501C37.5833 57.5835 29.1668 49.5002 28.7918 30.4169H17.3752Z" fill="currentColor" />
              </svg>
            </a>
            <a href="https://t.me/apelsinka_bar" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1.002.32.023.467.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/apelsinka.bar?igsh=NDByb3lyZTJhc2dk&utm_source=qr" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@apelsinka_bar?_r=1" target="_blank" rel="noreferrer" className="text-white hover:text-brand-dark transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.37-3.4-5.71.04-2.47 1.51-4.75 3.65-5.74 1.15-.55 2.45-.75 3.71-.62v4.06c-1.02-.04-2.07.25-2.85.93-.78.67-1.17 1.69-1.06 2.71.12 1.14.93 2.14 1.98 2.51.87.31 1.83.22 2.65-.18.82-.41 1.44-1.15 1.67-2.04.14-.55.15-1.13.15-1.7V.02z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
