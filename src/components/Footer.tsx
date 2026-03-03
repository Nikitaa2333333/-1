import { MapPin, Clock, Phone } from "lucide-react";
import data from "../data/products.json";

export const Footer = () => {
  const { contacts } = data;
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
                    {contacts?.address || "Украинский бульвар, 8, строение 1"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-7 h-7 text-brand-hot shrink-0 mt-1" />
                <div>
                  <p className="font-sans text-lg font-bold">Режим работы</p>
                  <p className="text-brand-dark/70 font-sans text-base">
                    {contacts?.schedule || "Ежедневно с 9:00 до 20:00"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-7 h-7 text-brand-hot shrink-0 mt-1" />
                <div>
                  <p className="font-sans text-lg font-bold">Телефон</p>
                  <a href={`tel:${(contacts?.phone || "+79001234567").replace(/[^\d+]/g, '')}`} className="text-brand-dark/70 hover:text-brand-hot font-sans text-base transition-colors">
                    {contacts?.phone || "+7 (900) 123-45-67"}
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
                  src="https://yandex.ru/map-widget/v1/org/157424703728"
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
                href="https://yandex.ru/maps/org/apelsinka/157424703728/"
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
            <div className="w-10 h-10 rounded-full bg-brand-cream border border-brand-dark/10 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/assets/logo.webp"
                alt="Апельсинка"
                loading="lazy"
                decoding="async"
                className="w-[85%] h-[85%] object-contain"
              />
            </div>
            <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
              <p>© 2025 Апельсинка. Все права защищены.</p>
              <div className="text-[10px] sm:text-xs text-brand-dark/40 leading-tight">
                ИП Горбачева Гахара Муриковна | ИНН: 773015005650 | ОГРНИП: 322774600682247
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://vk.ru/apelsinka_bar" target="_blank" rel="noreferrer" className="text-brand-dark/40 hover:text-brand-hot transition-colors">
              <svg width="24" height="24" viewBox="0 0 101 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.52944 7.02944C0.5 14.0589 0.5 25.3726 0.5 48V52C0.5 74.6274 0.5 85.9411 7.52944 92.9706C14.5589 100 25.8726 100 48.5 100H52.5C75.1274 100 86.4411 100 93.4706 92.9706C100.5 85.9411 100.5 74.6274 100.5 52V48C100.5 25.3726 100.5 14.0589 93.4706 7.02944C86.4411 0 75.1274 0 52.5 0H48.5C25.8726 0 14.5589 0 7.52944 7.02944ZM17.3752 30.4169C17.9168 56.4169 30.9167 72.0418 53.7084 72.0418H55.0003V57.1668C63.3753 58.0001 69.7082 64.1252 72.2498 72.0418H84.0835C80.8335 60.2085 72.2914 53.6668 66.9581 51.1668C72.2914 48.0835 79.7915 40.5835 81.5831 30.4169H70.8328C68.4995 38.6669 61.5836 46.1668 55.0003 46.8751V30.4169H44.2499V59.2501C37.5833 57.5835 29.1668 49.5002 28.7918 30.4169H17.3752Z" />
              </svg>
            </a>
            <a href="https://t.me/apelsinka_bar" target="_blank" rel="noreferrer" className="text-brand-dark/40 hover:text-brand-hot transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1.002.32.023.467.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/apelsinka.bar?igsh=NDByb3lyZTJhc2dk&utm_source=qr" target="_blank" rel="noreferrer" className="text-brand-dark/40 hover:text-brand-hot transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
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
