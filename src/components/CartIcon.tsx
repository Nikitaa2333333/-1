import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartIcon = ({ onClick }: { onClick: () => void }) => {
    const { totalItems, totalPrice } = useCart();

    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <motion.button
                    initial={{ scale: 0, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 100 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClick}
                    className="fixed bottom-8 right-8 z-[110] bg-brand-dark text-white p-4 pr-6 rounded-full shadow-2xl flex items-center gap-3 border-2 border-brand-hot group"
                >
                    <div className="relative">
                        <ShoppingBag className="w-6 h-6 text-brand-pink" />
                        <span className="absolute -top-2 -right-2 bg-brand-hot text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-dark">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-brand-pink/60 font-sans uppercase tracking-wider mb-0.5">Корзина</span>
                        <span className="font-dela text-lg">{totalPrice} ₽</span>
                    </div>

                    {/* Pulse effect */}
                    <div className="absolute inset-0 bg-brand-hot rounded-full opacity-20 animate-ping -z-10 group-hover:hidden"></div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
