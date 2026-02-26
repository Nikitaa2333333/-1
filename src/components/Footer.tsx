import { MapPin, Clock } from "lucide-react";

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
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-brand-hot shrink-0" />
                <div>
                  <p className="font-sans text-xl font-bold">Наш адрес</p>
                  <p className="text-brand-dark/70 font-sans text-lg">
                    Украинский бульвар, 8, строение 1
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-brand-hot shrink-0" />
                <div>
                  <p className="font-sans text-xl font-bold">Режим работы</p>
                  <p className="text-brand-dark/70 font-sans text-lg">
                    Ежедневно с 9:00 до 20:00
                  </p>
                </div>
              </div>

              <a
                href="https://yandex.ru/maps/?text=Украинский+бульвар+8с1+Москва"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-hot text-white rounded-xl font-bold hover:bg-brand-dark transition-all mt-2"
              >
                <MapPin className="w-5 h-5" />
                Построить маршрут
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Меню</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-lg text-brand-dark/70">
              <li><a href="#" className="hover:text-brand-hot transition-colors">Клубника в шоколаде</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Малина в шоколаде</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Limeberry</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Смузи и Фреши</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">Пончики и Хот-доги</a></li>
              <li><a href="#" className="hover:text-brand-hot transition-colors">О нас</a></li>
            </ul>
          </div>



        </div>

        <div className="border-t border-brand-dark/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-dark/40 font-sans text-sm text-center md:text-left">
          <p>© 2026 Апельсинка. Все права защищены.</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <a href="#" className="hover:text-brand-dark transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-brand-dark transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
