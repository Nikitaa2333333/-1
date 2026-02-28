import { motion } from 'framer-motion';
import data from '../data/products.json';

export const PromoBanner = () => {
    const { promoBanner } = data;

    return (
        <section className="pt-12 pb-24 bg-brand-cream overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-brand-hot rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-white overflow-hidden shadow-2xl"
                >
                    {/* Content */}
                    <div className="flex-1 z-10 text-center md:text-left space-y-4">
                        <h2 className="font-dela text-3xl md:text-5xl leading-tight">
                            {promoBanner.titleLine1} <br className="hidden md:block" />
                            <span className="text-brand-cream">{promoBanner.titleLine2}</span>
                        </h2>
                        <p className="font-sans text-lg md:text-xl opacity-90 max-w-md mx-auto md:mx-0 font-medium">
                            {promoBanner.subtitle}
                        </p>
                    </div>

                    {/* Action */}
                    <div className="z-10 flex-shrink-0">
                        <a
                            href="#products"
                            className="inline-block bg-white text-brand-hot py-5 px-12 rounded-full font-sans font-black text-lg md:text-xl hover:bg-brand-cream transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.1)] tracking-wider"
                        >
                            {promoBanner.buttonText}
                        </a>
                    </div>

                    {/* Minimalist Strawberry Accent */}
                    <div className="absolute -bottom-12 -left-12 opacity-15 rotate-[-15deg] pointer-events-none select-none">
                        <span className="text-[180px] md:text-[240px]">🍓</span>
                    </div>

                    <div className="absolute -top-12 -right-12 opacity-10 rotate-[25deg] pointer-events-none select-none">
                        <span className="text-[140px] md:text-[180px]">🍓</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
