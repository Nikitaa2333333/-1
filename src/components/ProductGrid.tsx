import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import data from "../data/products.json";

const { categories, products, hero } = data;

export const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);


  return (
    <section className="py-24 bg-brand-pink/10 relative" id="products">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-16 space-y-4">
          <span className="font-dela text-brand-hot uppercase tracking-wider">Меню</span>
          <h2 className="font-dela text-[clamp(40px,7vw,72px)] text-brand-dark leading-tight">
            {hero.titleLine1} <br />
            <span className="text-brand-hot">{hero.titleLine2}</span>
          </h2>
        </div>

        {/* Переключатель категорий */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-12 pb-4 md:flex-wrap md:justify-center -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap snap-start px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold font-sans text-sm md:text-base transition-all duration-300 transform active:scale-95 flex-shrink-0 border ${activeCategory === cat.id
                ? "bg-brand-hot text-white shadow-lg shadow-brand-hot/20 border-brand-hot"
                : "bg-white text-brand-dark hover:bg-brand-pink/20 border-brand-pink/20"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Сетка товаров */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl flex flex-col border border-brand-pink/5"
            >
              <div className="relative h-40 md:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {product.oldPrice && (
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 bg-brand-hot text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                    SALE
                  </div>
                )}
              </div>

              <div className="p-3 md:p-6 flex flex-col flex-grow space-y-2 md:space-y-4">
                <div className="space-y-1 md:space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-dela text-sm md:text-lg text-brand-dark leading-tight group-hover:text-brand-hot transition-colors line-clamp-2 md:line-clamp-none">
                      {product.name}
                    </h3>
                    <span className="text-brand-dark/40 font-sans text-[10px] md:text-xs font-medium italic">
                      {product.weight}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-cream text-brand-dark font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm whitespace-nowrap shadow-sm">
                      {product.price.replace(' ₽', '')} <span className="font-sans text-[0.9em]">₽</span>
                    </span>
                    {product.oldPrice && (
                      <span className="text-brand-dark/30 line-through text-[10px] md:text-xs font-bold whitespace-nowrap">
                        {product.oldPrice.replace(' ₽', '')} <span className="font-sans text-[0.9em]">₽</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="block w-full py-2.5 md:py-4 bg-white border md:border-2 border-brand-dark rounded-xl font-bold text-center text-[10px] md:text-base hover:bg-brand-dark hover:text-white active:scale-[0.98] transition-all shadow-sm group/btn relative overflow-hidden"
                  >
                    <span className="relative z-10">Купить</span>
                    <div className="absolute inset-0 bg-brand-dark translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-brand-dark/40 font-dela">
            В этой категории пока пусто
          </div>
        )}
      </div>
    </section >
  );
};
