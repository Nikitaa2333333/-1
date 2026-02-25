import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Клубника в шоколаде",
    desc: "Свежая ягода и бельгийский шоколад Callebaut",
    price: "от 1 500 ₽",
    image: "https://images.unsplash.com/photo-1543501763-7c152341933c?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    name: "Малина в шоколаде",
    desc: "Нежная малина в изысканном сочетании",
    price: "от 1 800 ₽",
    image: "https://images.unsplash.com/photo-1626201633519-20d7710b14b1?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    name: "Клубника Limeberry",
    desc: "Освежающий вкус лайма и сладость ягод",
    price: "1 700 ₽",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 4,
    name: "Сублимированные фрукты",
    desc: "Хрустящие витамины в любое время года",
    price: "600 ₽",
    image: "https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 5,
    name: "Смузи и Фреши",
    desc: "Настоящий заряд энергии из спелых фруктов",
    price: "от 350 ₽",
    image: "https://images.unsplash.com/photo-1536304993132-054526d1be6b?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 6,
    name: "Фирменные пончики",
    desc: "Пышные, свежие и очень вкусные",
    price: "150 ₽",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 7,
    name: "Сытные хот-доги",
    desc: "Идеальный перекус для прогулки по городу",
    price: "от 250 ₽",
    image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&q=80&w=1000"
  }
];

export const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const botUsername = "apelsinkabarbot";

  return (
    <section className="py-24 bg-brand-pink/10 relative" id="products">
      <div className="container mx-auto px-4">

        <div className="text-center mb-16 space-y-4">
          <span className="font-dela text-brand-hot">Меню</span>
          <h2 className="font-dela text-[clamp(40px,7vw,72px)] text-brand-dark leading-tight">
            Выбери свой <br />
            <span className="text-brand-hot">вкус</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-dela text-xl text-brand-dark leading-tight">{product.name}</h3>
                    <span className="bg-brand-cream text-brand-dark font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap w-fit self-start">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-brand-dark/60 font-sans text-sm">{product.desc}</p>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="block w-full py-4 border-2 border-brand-dark rounded-xl font-bold text-center text-sm md:text-base hover:bg-brand-dark hover:text-white active:scale-[0.98] transition-all"
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
              className="fixed inset-0 bg-brand-dark/40 z-[100]"
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

