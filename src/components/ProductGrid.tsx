import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Клубника в шоколаде, 9 шт",
    desc: "Молочный, белый шоколад и декор",
    price: "1 500 ₽",
    image: "https://images.unsplash.com/photo-1543501763-7c152341933c?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    name: "Набор «Любовь»",
    desc: "Свежая ягода и розовый шоколад",
    price: "2 200 ₽",
    image: "https://images.unsplash.com/photo-1626201633519-20d7710b14b1?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    name: "Стаканчик клубники",
    desc: "Ассорти для прогулки",
    price: "800 ₽",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 4,
    name: "Большой набор x16",
    desc: "Микс всех видов шоколада",
    price: "2 900 ₽",
    image: "https://images.unsplash.com/photo-1588600000-000000000000?auto=format&fit=crop&q=80&w=1000"
  }
];

export const ProductGrid = () => {
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
              className="group bg-white rounded-[2rem] overflow-hidden shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <a href="https://wa.me/?text=Здравствуйте!%20Хочу%20заказать%20клубнику" target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-20 bg-brand-hot text-white p-3 rounded-full shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </a>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-dela text-xl text-brand-dark leading-tight">{product.name}</h3>
                  <span className="bg-brand-cream text-brand-dark font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    {product.price}
                  </span>
                </div>
                <p className="text-brand-dark/60 font-sans text-sm">{product.desc}</p>
                <a href="https://wa.me/?text=Здравствуйте!%20Хочу%20заказать%20клубнику" target="_blank" rel="noopener noreferrer" className="block w-full py-3 border-2 border-brand-dark rounded-xl font-bold text-sm hover:bg-brand-dark hover:text-white transition-colors text-center">
                  В корзину
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
