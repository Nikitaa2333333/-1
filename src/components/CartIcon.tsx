import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const CartIcon = () => {
    const { totalItems, totalPrice } = useCart();

    return (
        <AnimatePresence>
            {totalItems > 0 && (
                <Link to="/cart">
                    <motion.div
                        key={totalItems} // Триггерит анимацию при изменении количества
                        initial={{ scale: 0.8, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 100 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            scale: { duration: 0.2 }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[110] bg-brand-dark text-white p-3 pr-5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-brand-hot group"
                    >
                        <div className="relative">
                            <ShoppingBag className="w-5 h-5 text-brand-pink" />
                            <motion.span
                                key={totalItems}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 bg-brand-hot text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-brand-dark"
                            >
                                {totalItems}
                            </motion.span>
                        </div>
                        <div className="flex flex-col items-start leading-none ml-1">
                            <span className="text-[9px] text-brand-pink/60 font-sans uppercase tracking-wider mb-0.5">Корзина</span>
                            <span className="font-dela text-base">{totalPrice} <span className="font-sans text-[0.9em]">₽</span></span>
                        </div>
                    </motion.div>
                </Link>
            )}
        </AnimatePresence>
    );
};
