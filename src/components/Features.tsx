import { Award, Gift, Coffee } from "lucide-react";

const features = [
  {
    icon: <Award className="w-12 h-12 text-brand-hot" />,
    title: "Бельгийский шоколад",
    description: "Мы используем только лучший бельгийский шоколад Callebaut, чтобы каждый глоток был наслаждением."
  },
  {
    icon: <Coffee className="w-12 h-12 text-brand-hot" />,
    title: "Стильная подача",
    description: "В стильном стакане — удобно взять с собой или подарить в моменте."
  },
  {
    icon: <Gift className="w-12 h-12 text-brand-hot" />,
    title: "Идеальный подарок",
    description: "Не просто десерт, а настоящее признание в чувствах. Для любимого человека."
  }
];

export const Features = () => {
  return (
    <section id="features" className="pt-24 pb-12 bg-brand-cream relative">
      <div className="container mx-auto">
        <div className="flex w-full overflow-x-auto gap-4 px-4 pb-8 md:grid md:grid-cols-3 md:gap-12 md:overflow-x-visible md:pb-0 snap-x snap-mandatory no-scrollbar md:px-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="w-[85vw] flex-none snap-center md:w-auto bg-white px-6 py-8 md:px-8 md:py-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand-pink/30 flex flex-col items-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-brand-pink/10 p-4 md:p-6 rounded-full">
                  {/* Контейнер иконки — уменьшаем на мобильных */}
                  <div className="scale-75 md:scale-100">
                    {feature.icon}
                  </div>
                </div>
              </div>
              <h3 className="font-dela text-[18px] md:text-[24px] mb-3 md:mb-4 text-brand-dark">{feature.title}</h3>
              <p className="text-brand-dark/70 font-sans leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
