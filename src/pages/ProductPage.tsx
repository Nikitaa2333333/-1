import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import data from "../data/products.json";
import { useEffect, useState } from "react";

export const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const product: any = data.products.find(p => p.id === Number(id));

    const [activeImage, setActiveImage] = useState(product?.image);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product) {
            setActiveImage(product.image);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-brand-pink/5">
                <h1 className="font-dela text-2xl text-brand-dark mb-4">Товар не найден</h1>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-brand-hot text-white rounded-xl font-bold"
                >
                    Вернуться на главную
                </button>
            </div>
        );
    }

    const relatedProducts = data.products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-brand-hot selection:text-white pb-20">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-pink/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-brand-dark hover:text-brand-hot transition-colors font-bold"
                    >
                        <ChevronLeft className="w-5 h-5" /> <span>Назад</span>
                    </button>
                    <img src="/assets/logo.webp" alt="Апельсинка" className="h-8 object-contain" />
                    <div className="w-10" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-brand-pink/5 aspect-square">
                            <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover" />
                            {product.oldPrice && (
                                <div className="absolute top-6 left-6 bg-brand-hot text-white px-4 py-1.5 rounded-full font-bold shadow-lg">SALE</div>
                            )}
                        </div>
                        {product.gallery && product.gallery.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                <button
                                    onClick={() => setActiveImage(product.image)}
                                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === product.image || !activeImage ? 'border-brand-hot' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={product.image} alt="Main" className="w-full h-full object-cover" />
                                </button>
                                {product.gallery.map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img.image)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.image ? 'border-brand-hot' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.image} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="font-dela text-4xl md:text-5xl lg:text-6xl text-brand-dark leading-tight">{product.name}</h1>
                            <p className="text-xl text-brand-dark/60 leading-relaxed max-w-xl">{product.desc || "Насладитесь неповторимым вкусом в премиальном бельгийском шоколаде Callebaut."}</p>
                        </div>

                        <div className="flex items-end gap-4">
                            <span className="font-dela text-4xl text-brand-dark whitespace-nowrap">{product.price} ₽</span>
                            {product.oldPrice && <span className="text-2xl text-brand-dark/30 line-through font-bold mb-1">{product.oldPrice} ₽</span>}
                            <span className="text-brand-dark/40 font-bold mb-1.5 ml-2 italic">/ {product.weight}</span>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-full sm:w-auto px-12 py-5 bg-brand-hot text-white rounded-2xl font-bold text-xl shadow-xl shadow-brand-hot/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <ShoppingCart className="w-6 h-6" /> Добавить в корзину
                        </button>

                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <div className="flex items-center gap-3 p-4 bg-brand-pink/5 rounded-2xl">
                                <Truck className="w-6 h-6 text-brand-hot" />
                                <span className="text-sm font-bold text-brand-dark leading-tight">Быстрая<br />доставка</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-brand-pink/5 rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-brand-hot" />
                                <span className="text-sm font-bold text-brand-dark leading-tight">Гарантия<br />качества</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-24 space-y-12">
                        <h2 className="font-dela text-3xl text-brand-dark text-center">Вам также понравится</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <div key={p.id} className="cursor-pointer group" onClick={() => navigate(`/product/${p.id}`)}>
                                    <div className="aspect-square rounded-3xl overflow-hidden mb-4 shadow-lg border border-brand-pink/5">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h3 className="font-dela text-sm text-brand-dark group-hover:text-brand-hot transition-colors line-clamp-1">{p.name}</h3>
                                    <p className="text-brand-hot font-bold text-sm mt-1">{p.price} ₽</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
