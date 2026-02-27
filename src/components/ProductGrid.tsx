import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'strawberry', name: 'Клубника в шоколаде' },
  { id: 'hotdogs', name: 'Хот-доги' },
  { id: 'donuts', name: 'Пончики' },
  { id: 'fresh', name: 'Напитки и фреши' },
  { id: 'raspberry', name: 'Малина в шоколаде' },
  { id: 'sweets', name: 'Сублимированные фрукты' },
  { id: 'oriental', name: 'Восточные сладости' }
];

const products = [
  // Клубника в шоколаде
  { id: 1, category: 'strawberry', name: "Клубника лаймберри XXL", weight: "380 гр", price: "1 799 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/00/1770067588_11315400.jpg", desc: "Свежая клубника в премиальном шоколаде" },
  { id: 2, category: 'strawberry', name: "Клубничный Dubai Box", weight: "500 гр", price: "1 404 ₽", oldPrice: "3 599 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/07/1771945788_46677407.jpg", desc: "С фисташковой пастой и шоколадом" },
  { id: 3, category: 'strawberry', name: "Набор + Мишка в подарок", weight: "380 гр", price: "1 759 ₽", oldPrice: "2 199 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/74/1769761544_47168874.jpg", desc: "Свежая ягода и мягкий сувенир" },
  { id: 4, category: 'strawberry', name: "Фондю с вафлями", weight: "500 гр", price: "1 259 ₽", oldPrice: "2 099 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/65/1771570862_37802765.jpg", desc: "Клубника и шоколадное фондю" },
  { id: 5, category: 'strawberry', name: "Клубника аля-Дубай + Мишка", weight: "400 гр", price: "1 005 ₽", oldPrice: "1 500 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/32/1769760512_69237732.jpg", desc: "Стиль Дубая и свежесть ягод" },
  { id: 6, category: 'strawberry', name: "Клубника ассорти + Мишка", weight: "400 гр", price: "2 000 ₽", oldPrice: "2 500 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/76/1769717653_93108176.jpg", desc: "Разнообразие вкусов в одном наборе" },
  { id: 7, category: 'strawberry', name: "Бенто-торт из клубники", weight: "350 гр", price: "2 879 ₽", oldPrice: "3 199 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/49/1768832663_30974749.jpg", desc: "Мини-торт из ягод в шоколаде" },
  { id: 8, category: 'strawberry', name: "Клубника в шоколаде + Мишка", weight: "330 гр", price: "1 529 ₽", oldPrice: "1 699 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/12/1769518957_32992512.jpg", desc: "Классический набор с подарком" },
  { id: 9, category: 'strawberry', name: "Клубника + Мишка (S)", weight: "300 гр", price: "1 000 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/77/1769845314_51539577.jpg", desc: "Компактный и вкусный подарок" },
  { id: 10, category: 'strawberry', name: "Голубика и клубника + Мишка", weight: "230 гр", price: "1 591 ₽", oldPrice: "1 989 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/05/1769718212_21017605.jpg", desc: "Ягодный микс в шоколаде" },
  { id: 11, category: 'strawberry', name: "Клубника в шоколаде аля-Дубай", weight: "350 гр", price: "2 890 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/49/1768997237_30439249.jpg", desc: "Премиальное качество на каждый день" },
  { id: 12, category: 'strawberry', name: "Клубника с мишкой (M)", weight: "350 гр", price: "1 523 ₽", oldPrice: "1 750 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/89/1769793978_14481389.jpg", desc: "Оптимальный выбор для подарка" },
  { id: 13, category: 'strawberry', name: "Фондю клубника-банан", weight: "500 гр", price: "1 585 ₽", oldPrice: "2 599 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/66/1771529710_77152466.jpg", desc: "Фруктовый бокс с шоколадом" },
  { id: 14, category: 'strawberry', name: "Клубника Киндер Сюрприз", weight: "350 гр", price: "2 799 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/66/1768843517_52535266.jpg", desc: "С нежным белым шоколадом" },
  { id: 15, category: 'strawberry', name: "Комбо: Клубника и банан", weight: "850 гр", price: "2 500 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/17/1769717364_27109217.jpg", desc: "Два стакана + мишка в подарок" },
  { id: 16, category: 'strawberry', name: "Бенто в белом шоколаде", weight: "350 гр", price: "2 879 ₽", oldPrice: "3 199 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/93/1768925548_87390293.jpg", desc: "Белый бельгийский шоколад" },
  { id: 17, category: 'strawberry', name: "Клубника Рафаэлло + малина", weight: "350 гр", price: "2 690 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/29/1768843641_32123929.jpg", desc: "Для истинных ценителей" },
  { id: 18, category: 'strawberry', name: "Клубника Лаймберри (Classic)", weight: "400 гр", price: "3 743 ₽", oldPrice: "4 159 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/44/1771555714_57765644.jpg", desc: "Фирменный вкус Апельсинки" },
  { id: 19, category: 'strawberry', name: "Торт из клубники Maxi", weight: "700 гр", price: "6 999 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/25/1768831853_15584025.jpg", desc: "Огромный ягодный торт в шоколаде" },
  { id: 20, category: 'strawberry', name: "Малина в шоколаде + Мишка (S)", weight: "200 гр", price: "1 530 ₽", oldPrice: "1 700 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/95/1769869376_79278995.jpg", desc: "Малина в молочном шоколаде" },

  // Фрукты, ягоды и фреши
  { id: 21, category: 'fresh', name: "Сок манго", weight: "300 мл", price: "431 ₽", oldPrice: "590 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/51/1769723408_29614151.jpg", desc: "Натуральный густой сок" },
  { id: 22, category: 'fresh', name: "Апельсиновый фреш", weight: "300 мл", price: "400 ₽", oldPrice: "500 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/10/1769724794_71833910.jpg", desc: "Свежевыжатый сок, полн витамина С" },
  { id: 23, category: 'fresh', name: "Протеиновый смузи", weight: "300 мл", price: "502 ₽", oldPrice: "590 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/47/1769724944_65574447.jpg", desc: "Заряд энергии с бананом и протеином" },

  // Малина в шоколаде
  { id: 24, category: 'raspberry', name: "Малина в миксе шоколада", weight: "250 гр", price: "2 176 ₽", oldPrice: "2 290 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/92/1768843339_83578492.jpg", desc: "Молочный и белый шоколад" },
  { id: 25, category: 'raspberry', name: "Малина в шоколаде (L)", weight: "360 гр", price: "2 800 ₽", oldPrice: null, image: "https://content2.flowwow-images.com/data/flowers/524x524/60/1768843263_61214860.jpg", desc: "Большая порция любимых ягод" },

  // Другие сладости
  { id: 26, category: 'sweets', name: "Маракуйя в шоколаде", weight: "300 гр", price: "1 868 ₽", oldPrice: "2 490 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/39/1770626775_61610539.jpg", desc: "Экзотический вкус в шоколаде" },

  // Восточные сладости
  { id: 27, category: 'oriental', name: "Финики в дубайском шоколаде", weight: "300 гр", price: "2 099 ₽", oldPrice: "2 799 ₽", image: "https://content2.flowwow-images.com/data/flowers/524x524/03/1771317988_97727503.jpg", desc: "Финики с фисташковой начинкой" },

  // Хот-доги
  { id: 28, category: 'hotdogs', name: "Французский хот-дог", weight: "160 гр", price: "300 ₽", oldPrice: null, image: "/assets/french_dog.jpg", desc: "Классический французский хот-дог в хрустящем багете с горчицей и кетчупом" },
  { id: 29, category: 'hotdogs', name: "Датский хот-дог", weight: "160 гр", price: "430 ₽", oldPrice: null, image: "/assets/danish_dog.jpg", desc: "Датский хот-дог с маринованными огурчиками, ремуладом и хрустящим луком" },
  { id: 30, category: 'hotdogs', name: "Сырный хот-дог", weight: "180 гр", price: "450 ₽", oldPrice: null, image: "/assets/cheese_dog.jpg", desc: "Сытный хот-дог с тягучим сыром и фирменным соусом" },

  // Пончики
  { id: 31, category: 'donuts', name: "Пончики с сахарной пудрой (3 шт.)", weight: "150 гр", price: "250 ₽", oldPrice: null, image: "/assets/donuts.jpg", desc: "Нежные и воздушные пончики, обильно посыпанные сахарной пудрой" }
];

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
            Выбери свой <br />
            <span className="text-brand-hot">вкус</span>
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
