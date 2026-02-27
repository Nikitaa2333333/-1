import { motion } from "framer-motion";

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
          <p className="font-dela text-white text-xl">
            О нас
          </p>

          <h2 className="font-dela text-[clamp(24px,5vw,56px)] leading-[1.2] max-w-5xl mx-auto mb-4">
            Готовим самую вкусную клубнику<StrawberryIcon /> в шоколаде в центре Москвы.<br />
            <span className="text-brand-dark">Доступен самовывоз или быстрая доставка<TruckIcon /> прямо к двери к 8 Марта.</span>
          </h2>

          <div className="max-w-4xl mx-auto text-left space-y-6 font-sans text-xl md:text-2xl leading-relaxed opacity-90 pt-4">
            <p>
              <strong className="text-brand-dark">«Апельсинка»</strong> — проект, который родился в 2025 году и впервые радовал гостей на фестивале «Лето в Москве».
            </p>
            <p>
              Проект создан людьми, для которых здоровье, витамины, молодость, солнце и радость от маленьких удовольствий — это стиль жизни.
            </p>
            <p>
              Мы верим, что витамины, фрукты и ягоды должны быть доступны каждому, поэтому создаём вкусные и полезные продукты: свежую клубнику в бельгийском шоколаде, смузи, фреши и другие фруктовые лакомства.
            </p>
            <p className="text-brand-dark/80">
              Наша миссия — дарить ощущение летнего удовольствия каждый день, независимо от сезона.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
