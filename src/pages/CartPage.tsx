import { ArrowLeft, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const CartPage = () => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

    const goToCheckout = () => {
        navigate("/checkout");
    };

    return (
        <div className="min-h-screen bg-brand-pink/5 font-sans pb-40">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 -ml-2 hover:bg-brand-pink/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-brand-dark" />
                        </Link>
                        <h1 className="font-dela text-xl text-brand-dark flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-brand-hot" />
                            Корзина
                        </h1>
                        {totalItems > 0 && (
                            <span className="bg-brand-pink/10 text-brand-hot font-bold px-2 py-0.5 rounded-full text-xs">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                        <ShoppingBag className="w-16 h-16 text-brand-hot" />
                        <p className="font-dela text-xl">Ваша корзина пуста</p>
                        <Link
                            to="/"
                            className="font-sans font-bold text-brand-hot hover:underline"
                        >
                            Перейти к покупкам
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm flex gap-4 border border-brand-pink/10 items-stretch">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h4 className="font-sans font-bold text-brand-dark leading-tight text-sm">
                                                {item.name}
                                            </h4>
                                            <p className="text-brand-dark/40 text-xs font-medium italic mt-1">{item.weight}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-1 -mt-1 -mr-1 text-brand-dark/20 hover:text-brand-hot transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center bg-brand-pink/5 rounded-full border border-brand-pink/10">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-2 px-3 hover:bg-brand-pink/10 text-brand-dark/60 rounded-l-full transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-6 text-center font-bold text-sm select-none">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-2 px-3 hover:bg-brand-pink/10 text-brand-dark/60 rounded-r-full transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="font-dela text-brand-hot text-base">
                                            {item.price * item.quantity} <span className="font-sans text-sm">₽</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-brand-pink/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pt-6 pb-6 px-4 z-50">
                    <div className="container mx-auto max-w-2xl space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <span className="text-brand-dark/60 font-sans text-sm">Итого</span>
                            <span className="font-dela text-[28px] text-brand-dark leading-none">
                                {totalPrice} <span className="font-sans text-xl">₽</span>
                            </span>
                        </div>
                        <button
                            className="w-full py-4 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-hot/20 hover:bg-brand-dark transition-all active:scale-95"
                            onClick={goToCheckout}
                        >
                            Оформить заказ
                        </button>
                        <p className="text-center text-[10px] text-brand-dark/30 font-sans">
                            Стоимость доставки будет рассчитана на следующем этапе
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
