import { ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-4 md:px-8">
      <div className="bg-white/70 backdrop-blur-md rounded-full px-6 py-3 flex justify-between items-center shadow-lg border border-white/40 max-w-7xl mx-auto">
        
        {/* Logo */}
        <div className="text-2xl font-black text-brand-hot tracking-tighter cursor-pointer">
          STRAWBERRY<span className="text-brand-dark">.LOVE</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 font-sans font-bold text-sm text-brand-dark uppercase">
          <a href="#" className="hover:text-brand-hot transition-colors">Главная</a>
          <a href="#products" className="hover:text-brand-hot transition-colors">Меню</a>
          <a href="#" className="hover:text-brand-hot transition-colors">О нас</a>
          <a href="#" className="hover:text-brand-hot transition-colors">Контакты</a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="relative bg-brand-dark text-white p-2 rounded-full hover:bg-brand-hot transition-colors group">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-brand-hot text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center group-hover:bg-brand-dark transition-colors">
              0
            </span>
          </button>
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-brand-dark" />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-brand-pink/95 z-40 flex flex-col items-center justify-center space-y-8 text-2xl font-black uppercase text-brand-dark">
          <button className="absolute top-8 right-8" onClick={() => setIsOpen(false)}>Close</button>
          <a href="#" onClick={() => setIsOpen(false)}>Главная</a>
          <a href="#products" onClick={() => setIsOpen(false)}>Меню</a>
          <a href="#" onClick={() => setIsOpen(false)}>О нас</a>
          <a href="#" onClick={() => setIsOpen(false)}>Контакты</a>
        </div>
      )}
    </nav>
  );
};
