import { Instagram, Send } from "lucide-react";

export const OrderCTA = () => {
    return (
        <section id="order" className="py-24 bg-brand-cream relative">
            <div className="container mx-auto px-4">
                <div className="bg-brand-hot text-white rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="font-dela text-[clamp(40px,7vw,72px)] leading-[1.1]">
                            Перейти к <br /> заказу
                        </h2>
                        <p className="text-xl md:text-2xl font-sans font-medium text-white/90">
                            Напиши нам в Instagram или Telegram — мы быстро ответим, поможем подобрать идеальный набор и оформим доставку на удобное время.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <a href="#" className="flex items-center justify-center gap-3 bg-white text-brand-hot px-8 py-5 rounded-full font-bold text-xl hover:bg-brand-cream active:scale-95 transition-all duration-200">
                                <Instagram className="w-6 h-6" />
                                Написать в Instagram
                            </a>
                            <a href="#" className="flex items-center justify-center gap-3 border-2 border-white text-white px-8 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-brand-hot active:scale-95 transition-all duration-200">
                                <Send className="w-6 h-6" />
                                Написать в Telegram
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
