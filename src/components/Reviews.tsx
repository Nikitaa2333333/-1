import { Star, MessageCircleHeart } from "lucide-react";

const reviews = [
    {
        id: 1,
        name: "Юленька Ковальски",
        date: "Февраль 2026",
        rating: 5,
        text: "Сюрприз удался. Ягоды свежие. Доставка вовремя. Спасибо.",
    },
    {
        id: 2,
        name: "Отправитель",
        date: "Февраль 2026",
        rating: 5,
        text: "Приятная атмосфера и вкусный подарок. Спасибо)",
    },
    {
        id: 3,
        name: "Отправитель",
        date: "Февраль 2026",
        rating: 5,
        text: "Приятная атмосфера, ароматный кофе и быстрая подача. Отличное место для отдыха. Спасибо!",
    },
    {
        id: 4,
        name: "Дарья",
        date: "Февраль 2026",
        rating: 5,
        text: "Вкусная клубника, спасибо большое! Получатель осталась в восторге.",
    },
    {
        id: 5,
        name: "Антон",
        date: "Февраль 2026",
        rating: 5,
        text: "Всё супер! Буду заказывать ещё.",
    }
];

export const Reviews = () => {
    return (
        <section id="reviews" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-hot/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-pink/20 rounded-full text-brand-hot text-sm font-bold tracking-widest uppercase mb-6">
                        <MessageCircleHeart className="w-5 h-5" />
                        <span>Flowwow</span>
                    </div>
                    <h2 className="font-dela text-4xl md:text-5xl lg:text-[4rem] mb-6 text-brand-dark leading-none">
                        Отзывы о <span className="text-brand-hot">нас</span>
                    </h2>
                    <p className="text-brand-dark/70 font-sans text-lg md:text-xl max-w-2xl mx-auto">
                        Что говорят наши гости? Мы собрали честные отзывы с платформы Flowwow со средней оценкой 5.0 🍓
                    </p>
                </div>

                <div className="flex w-full overflow-x-auto gap-6 pb-12 snap-x snap-mandatory hide-scrollbar md:px-0 px-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="w-[85vw] md:w-[400px] flex-none snap-center bg-white border border-brand-pink/20 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-brand-hot/30 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-pink/20 text-brand-hot rounded-full flex items-center justify-center font-dela text-xl">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-lg">{review.name}</h4>
                                        <p className="text-brand-dark/50 text-sm font-medium">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-brand-hot/10 px-3 py-1.5 rounded-full">
                                    <Star className="w-4 h-4 text-brand-hot fill-brand-hot mr-1" />
                                    <span className="font-bold text-brand-hot text-sm">{review.rating}.0</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-brand-dark/80 font-sans leading-relaxed text-base">
                                    «{review.text}»
                                </p>
                            </div>

                            <div className="mt-8 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-brand-hot/30 fill-brand-hot" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-4">
                    <a
                        href="https://flowwow.com/shop/apelsinkaf-2080/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-brand-pink/30 text-brand-dark rounded-full font-bold hover:bg-brand-hot hover:text-white hover:border-brand-hot transition-all shadow-sm cursor-pointer"
                    >
                        Читать все отзывы на Flowwow
                    </a>
                </div>
            </div>
        </section>
    );
};
