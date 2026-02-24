import { Instagram, MapPin, Send } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-brand-cream text-brand-dark py-24 relative overflow-hidden">

      {/* Decorative text */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-10 pointer-events-none">
        <h2 className="font-dela text-[20vw] whitespace-nowrap text-brand-hot -translate-y-1/2 opacity-10">
          Апельсинка Апельсинка
        </h2>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 mb-16">

          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Контакты</h3>
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-brand-hot shrink-0" />
              <div>
                <p className="font-sans text-xl font-bold">Наш адрес</p>
                <p className="text-brand-dark/70 font-sans text-lg">
                  Украинский бульвар, 8с1
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="w-12 h-12 rounded-full border border-brand-dark/20 flex items-center justify-center hover:bg-brand-hot hover:border-brand-hot hover:text-white transition-all">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-brand-dark/20 flex items-center justify-center hover:bg-brand-hot hover:border-brand-hot hover:text-white transition-all">
                <Send className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Меню</h3>
            <ul className="space-y-4 font-sans text-lg text-brand-dark/70">
              <li><a href="#" className="hover:text-brand-hot transition-colors">Клубника в шоколаде</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Подарочные наборы</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Дубайский шоколад</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">О нас</a></li>
            </ul>
          </div>



        </div>

        <div className="border-t border-brand-dark/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-brand-dark/40 font-sans text-sm">
          <p>© 2024 Апельсинка. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-dark">Политика конфиденциальности</a>
            <a href="#" className="hover:text-brand-dark">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
