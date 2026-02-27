import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

    const goToCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-brand-dark/60 z-[120]"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[130] shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-brand-pink/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="w-6 h-6 text-brand-hot" />
                                    <h2 className="font-dela text-2xl text-brand-dark">Корзина</h2>
                                    <span className="bg-brand-pink/20 text-brand-hot font-bold px-2 py-0.5 rounded-full text-sm">
                                        {totalItems}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-brand-pink/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-brand-dark/50" />
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                        <ShoppingBag className="w-16 h-16" />
                                        <p className="font-dela text-xl">Ваша корзина пуста</p>
                                        <button
                                            onClick={onClose}
                                            className="font-sans font-bold text-brand-hot hover:underline"
                                        >
                                            Перейти к покупкам
                                        </button>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border border-brand-pink/10">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-sans font-bold text-brand-dark line-clamp-2 leading-tight">
                                                        {item.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-brand-dark/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-brand-dark/40 text-xs font-medium italic">{item.weight}</p>

                                                <div className="flex justify-between items-center pt-1">
                                                    <div className="flex items-center border border-brand-pink/20 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="p-1 px-2 hover:bg-brand-pink/5 text-brand-dark/60"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="p-1 px-2 hover:bg-brand-pink/5 text-brand-dark/60"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className="font-bold text-brand-hot">
                                                        {item.price * item.quantity} ₽
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {items.length > 0 && (
                                <div className="p-6 bg-brand-pink/5 border-t border-brand-pink/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-brand-dark/60 font-sans">Итого</span>
                                        <span className="font-dela text-2xl text-brand-dark">
                                            {totalPrice} ₽
                                        </span>
                                    </div>
                                    <button
                                        className="w-full py-4 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-all active:scale-95"
                                        onClick={goToCheckout}
                                    >
                                        Оформить заказ
                                    </button>
                                    <p className="text-center text-[10px] text-brand-dark/30 font-sans">
                                        Стоимость доставки будет рассчитана на следующем этапе
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </>
    );
};
