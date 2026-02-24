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
    <section className="py-24 bg-brand-cream relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white px-8 py-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand-pink/30 flex flex-col items-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-brand-pink/10 p-6 rounded-full">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-dela text-[clamp(18px,4vw,24px)] mb-4 text-brand-dark">{feature.title}</h3>
              <p className="text-brand-dark/70 font-sans leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
