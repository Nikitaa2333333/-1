import { MapPin, Clock, Phone } from "lucide-react";

export const Footer = () => {
  const navLinks = [
    { label: "Главная", href: "#hero" },
    { label: "О нас", href: "#about" },
    { label: "Преимущества", href: "#features" },
    { label: "Меню", href: "#products" },
    { label: "Заказать", href: "#order" },
  ];

  return (
    <footer className="bg-brand-cream text-brand-dark py-24 relative overflow-hidden" id="contacts">

      {/* Decorative text */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-10 pointer-events-none">
        <h2 className="font-dela text-[20vw] whitespace-nowrap text-brand-hot -translate-y-1/2 opacity-10">
          Апельсинка Апельсинка
        </h2>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

          {/* Контакты */}
          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Контакты</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-7 h-7 text-brand-hot shrink-0 mt-1" />
                <div>
                  <p className="font-sans text-lg font-bold">Наш адрес</p>
                  <p className="text-brand-dark/70 font-sans text-base">
                    Украинский бульвар, 8, строение 1
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-7 h-7 text-brand-hot shrink-0 mt-1" />
                <div>
                  <p className="font-sans text-lg font-bold">Режим работы</p>
                  <p className="text-brand-dark/70 font-sans text-base">
                    Ежедневно с 9:00 до 20:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-7 h-7 text-brand-hot shrink-0 mt-1" />
                <div>
                  <p className="font-sans text-lg font-bold">Телефон</p>
                  <a href="tel:+79001234567" className="text-brand-dark/70 hover:text-brand-hot font-sans text-base transition-colors">
                    +7 (900) 123-45-67
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Навигация</h3>
            <ul className="space-y-4 font-sans text-lg">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-brand-dark/70 hover:text-brand-hot transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Мини-карта */}
          <div className="space-y-6">
            <h3 className="font-dela text-3xl mb-8">Мы на карте</h3>
            <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-brand-pink/10">
              <div className="aspect-[4/3] w-full">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A&source=constructorLink&ll=37.576333%2C55.742028&z=16&pt=37.576333%2C55.742028%2Cpm2rdl"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  title="Апельсинка на карте"
                  loading="lazy"
                />
              </div>
              {/* Overlay с адресом */}
              <a
                href="https://yandex.ru/maps/?text=Украинский+бульвар+8с1+Москва"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/50 to-transparent p-4 pt-10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold font-sans text-sm">Украинский бул., 8с1</p>
                    <p className="text-white/60 font-sans text-xs">Построить маршрут →</p>
                  </div>
                  <div className="w-10 h-10 bg-brand-hot rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-brand-dark/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-dark/40 font-sans text-sm text-center md:text-left">
          <div className="flex items-center gap-4">
            <img
              src="/assets/logo.webp"
              alt="Апельсинка"
              className="h-10 object-contain opacity-70"
            />
            <p>© 2025 Апельсинка. Все права защищены.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <a href="#" className="hover:text-brand-dark transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-brand-dark transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
