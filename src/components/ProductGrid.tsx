import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'strawberry', name: 'Клубника в шоколаде' },
  { id: 'hotdogs', name: 'Хот-доги' },
  { id: 'donuts', name: 'Пончики' },
  { id: 'fresh', name: 'Напитки и фреши' },
  { id: 'raspberry', name: 'Малина в шоколаде' },
  { id: 'sweets', name: 'Сладости' },
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
  { id: 28, category: 'hotdogs', name: "Французский хот-дог", weight: "160 гр", price: "300 ₽", oldPrice: null, image: "/assets/french_dog.png", desc: "Классический французский хот-дог в хрустящем багете с горчицей и кетчупом" },
  { id: 29, category: 'hotdogs', name: "Датский хот-дог", weight: "160 гр", price: "430 ₽", oldPrice: null, image: "/assets/danish_dog.png", desc: "Датский хот-дог с маринованными огурчиками, ремуладом и хрустящим луком" },
  { id: 30, category: 'hotdogs', name: "BBQ Хот-дог", weight: "180 гр", price: "450 ₽", oldPrice: null, image: "/assets/bbq_dog.png", desc: "Сытный BBQ хот-дог с пикантным соусом, беконом и сыром" },

  // Пончики
  { id: 31, category: 'donuts', name: "Пончики с сахарной пудрой (3 шт.)", weight: "150 гр", price: "250 ₽", oldPrice: null, image: "/assets/donuts.png", desc: "Нежные и воздушные пончики, обильно посыпанные сахарной пудрой" }
];

export const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const botUsername = "apelsinkabarbot";

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
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl font-bold font-sans transition-all duration-300 transform active:scale-95 ${activeCategory === cat.id
                ? "bg-brand-hot text-white shadow-lg shadow-brand-hot/20 scale-105"
                : "bg-white text-brand-dark hover:bg-brand-pink/20 border border-brand-pink/20"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Сетка товаров */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col border border-brand-pink/5"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.oldPrice && (
                    <div className="absolute top-4 left-4 z-20 bg-brand-hot text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      SALE
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-dela text-lg text-brand-dark leading-tight group-hover:text-brand-hot transition-colors">
                          {product.name}
                        </h3>
                        <span className="text-brand-dark/40 font-sans text-xs mt-1 font-medium italic">
                          {product.weight}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-brand-cream text-brand-dark font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-sm">
                          {product.price}
                        </span>
                        {product.oldPrice && (
                          <span className="text-brand-dark/30 line-through text-xs font-bold px-1">
                            {product.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-brand-dark/60 font-sans text-sm line-clamp-2">{product.desc}</p>
                  </div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="block w-full py-4 bg-white border-2 border-brand-dark rounded-xl font-bold text-center text-sm md:text-base hover:bg-brand-dark hover:text-white active:scale-[0.98] transition-all shadow-sm"
                    >
                      Оформить заказ
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-brand-dark/40 font-dela">
            В этой категории пока пусто
          </div>
        )}
      </div>

      {/* Окно оформления заказа в Telegram */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-brand-dark/40 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
            >
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl relative border border-brand-pink/20">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 p-2 text-brand-dark/50 hover:text-brand-dark transition-colors rounded-full hover:bg-brand-pink/10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6 pt-4">
                  <div className="w-20 h-20 bg-brand-pink/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-brand-hot" />
                  </div>

                  <h3 className="font-dela text-2xl text-brand-dark leading-tight">
                    Оформление заказа
                  </h3>

                  <div className="space-y-4">
                    <p className="font-sans text-brand-dark/80 text-lg leading-relaxed">
                      Принимаем заказы через нашего бота. Это самый быстрый способ — к вам сразу подключится менеджер.
                    </p>
                    <div className="p-4 bg-brand-pink/5 rounded-2xl border border-brand-pink/10">
                      <p className="text-brand-hot font-bold text-lg">{selectedProduct.name}</p>
                      <p className="text-brand-dark/40 text-sm">{selectedProduct.weight} • {selectedProduct.price}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={`https://t.me/${botUsername}?start=prod_${selectedProduct.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-[#24A1DE] text-white rounded-xl font-bold text-lg hover:bg-[#208aba] active:scale-95 transition-all shadow-lg shadow-[#24A1DE]/20"
                      onClick={() => setSelectedProduct(null)}
                    >
                      <Send className="w-5 h-5" />
                      Написать в Telegram
                    </a>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="mt-4 text-brand-dark/50 hover:text-brand-dark font-sans text-sm font-medium transition-colors"
                    >
                      Вернуться в каталог
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

