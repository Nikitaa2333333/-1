import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-brand-cream/50 pt-20">

      {/* Background massive text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-10 select-none z-0">
        <h1 className="text-[18vw] leading-none text-brand-dark font-black tracking-tighter">
          SWEET
          <br />
          BERRY
        </h1>
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-10">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-center md:text-left space-y-6"
        >
          <div className="inline-block bg-brand-hot text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider transform -rotate-2">
            Идеальный подарок
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-brand-dark uppercase">
            Клубника <br />
            <span className="text-brand-hot">в шоколаде</span>
          </h2>
          <p className="text-xl text-brand-dark/80 max-w-md mx-auto md:mx-0 font-sans font-medium">
            Настоящее признание в чувствах. Бельгийский шоколад Callebaut и отборная ягода.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <a href="#products" className="bg-brand-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-hot transition-colors flex items-center gap-2 group">
              Заказать сейчас
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#products" className="border-2 border-brand-dark text-brand-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark hover:text-white transition-colors">
              Наше меню
            </a>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-1/2 relative"
        >
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Blob background */}
            <div className="absolute inset-0 bg-brand-pink rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <img
              src="https://images.unsplash.com/photo-1543501763-7c152341933c?q=80&w=1000&auto=format&fit=crop"
              alt="Клубника в шоколаде"
              loading="eager"
              fetchPriority="high"
              width="500"
              height="500"
              className="relative w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />

            {/* Float badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-5 bg-white p-4 rounded-2xl shadow-xl rotate-6"
            >
              <span className="block text-3xl font-black text-brand-hot">100%</span>
              <span className="text-xs font-bold text-brand-dark">НАТУРАЛЬНО</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
