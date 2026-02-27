import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, Tag, Package, Bike, ChevronRight, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const PROMO_CODES: Record<string, number> = {
    "LETO2025": 10,
    "APELSINKA": 15,
    "SALE10": 10,
};

const DELIVERY_ZONES = [
    { label: "до 3 км", price: 150 },
    { label: "3–7 км", price: 250 },
    { label: "7–15 км", price: 400 },
    { label: "15+ км", price: null },
];

type Step = "form" | "success";

export const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { totalPrice, clearCart } = useCart();

    const [step, setStep] = useState<Step>("form");
    const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [zone, setZone] = useState(0); // index in DELIVERY_ZONES
    const [promo, setPromo] = useState("");
    const [promoApplied, setPromoApplied] = useState<number | null>(null);
    const [promoError, setPromoError] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deliveryCost = deliveryType === "pickup" ? 0 : (DELIVERY_ZONES[zone].price ?? 0);
    const discount = promoApplied ? Math.round(totalPrice * promoApplied / 100) : 0;
    const finalTotal = totalPrice - discount + deliveryCost;

    const applyPromo = () => {
        const code = promo.trim().toUpperCase();
        if (PROMO_CODES[code]) {
            setPromoApplied(PROMO_CODES[code]);
            setPromoError("");
        } else {
            setPromoApplied(null);
            setPromoError("Промокод не найден или уже истёк");
        }
    };

    const handleSubmit = async () => {
        if (!phone || !name || (deliveryType === "delivery" && !address)) return;
        setIsSubmitting(true);
        // Имитация отправки
        await new Promise((r) => setTimeout(r, 1200));
        setIsSubmitting(false);
        setStep("success");
        clearCart();
    };

    const handleClose = () => {
        setStep("form");
        setPhone(""); setName(""); setAddress(""); setPromo("");
        setPromoApplied(null); setPromoError(""); setComment("");
        onClose();
    };

    const isFormValid = name.trim() && phone.trim().length >= 6 && (deliveryType === "pickup" || address.trim());

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-brand-dark/50 z-[140] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.96 }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg z-[150] max-h-[90dvh] overflow-y-auto no-scrollbar rounded-3xl bg-white shadow-2xl"
                    >
                        {step === "form" ? (
                            <div className="p-6 md:p-8 space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="font-dela text-2xl text-brand-dark">Оформление заказа</h2>
                                    <button onClick={handleClose} className="p-2 hover:bg-brand-pink/10 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-brand-dark/40" />
                                    </button>
                                </div>

                                {/* Delivery / Pickup toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-brand-pink/10 rounded-2xl">
                                    <button
                                        onClick={() => setDeliveryType("delivery")}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-sans text-sm transition-all ${deliveryType === "delivery" ? "bg-white text-brand-dark shadow-md" : "text-brand-dark/40 hover:text-brand-dark"}`}
                                    >
                                        <Bike className="w-4 h-4" /> Доставка
                                    </button>
                                    <button
                                        onClick={() => setDeliveryType("pickup")}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-sans text-sm transition-all ${deliveryType === "pickup" ? "bg-white text-brand-dark shadow-md" : "text-brand-dark/40 hover:text-brand-dark"}`}
                                    >
                                        <Package className="w-4 h-4" /> Самовывоз
                                    </button>
                                </div>

                                {/* Fields */}
                                <div className="space-y-3">
                                    {/* Name */}
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                                        <input
                                            type="text"
                                            placeholder="Ваше имя"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                                        <input
                                            type="tel"
                                            placeholder="+7 (___) ___-__-__"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Address (delivery only) */}
                                    {deliveryType === "delivery" && (
                                        <>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                                                <input
                                                    type="text"
                                                    placeholder="Адрес доставки"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all"
                                                />
                                            </div>

                                            {/* Delivery zone */}
                                            <div>
                                                <p className="text-xs text-brand-dark/40 font-sans mb-2 px-1">Зона доставки</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {DELIVERY_ZONES.slice(0, 3).map((z, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setZone(i)}
                                                            className={`py-2 px-1 rounded-xl text-xs font-bold font-sans transition-all ${zone === i ? "bg-brand-hot text-white shadow-lg shadow-brand-hot/20" : "bg-brand-pink/10 text-brand-dark/60 hover:bg-brand-pink/20"}`}
                                                        >
                                                            {z.label}<br />
                                                            <span className={zone === i ? "text-white/80" : "text-brand-dark/40"}>{z.price} ₽</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Pickup address */}
                                    {deliveryType === "pickup" && (
                                        <div className="flex gap-3 p-4 bg-brand-pink/5 rounded-xl border border-brand-pink/10">
                                            <MapPin className="w-5 h-5 text-brand-hot shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-brand-dark font-sans text-sm">Украинский бульвар, 8с1</p>
                                                <p className="text-brand-dark/50 text-xs font-sans">Ежедневно с 9:00 до 20:00</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comment */}
                                    <textarea
                                        placeholder="Комментарий к заказу (необязательно)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm resize-none focus:outline-none focus:border-brand-hot focus:bg-white transition-all"
                                    />

                                    {/* Promo code */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/30" />
                                            <input
                                                type="text"
                                                placeholder="Промокод"
                                                value={promo}
                                                onChange={(e) => { setPromo(e.target.value); setPromoApplied(null); setPromoError(""); }}
                                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={applyPromo}
                                            className="px-4 py-3.5 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-hot transition-all"
                                        >
                                            Применить
                                        </button>
                                    </div>

                                    {promoApplied && (
                                        <p className="text-green-600 text-xs font-bold px-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Промокод применён: скидка {promoApplied}%
                                        </p>
                                    )}
                                    {promoError && <p className="text-red-500 text-xs px-1">{promoError}</p>}
                                </div>

                                {/* Summary */}
                                <div className="bg-brand-pink/5 rounded-2xl p-4 space-y-2 border border-brand-pink/10">
                                    <div className="flex justify-between font-sans text-sm text-brand-dark/60">
                                        <span>Товары</span><span>{totalPrice} ₽</span>
                                    </div>
                                    {deliveryType === "delivery" && (
                                        <div className="flex justify-between font-sans text-sm text-brand-dark/60">
                                            <span>Доставка</span><span>{deliveryCost} ₽</span>
                                        </div>
                                    )}
                                    {promoApplied && (
                                        <div className="flex justify-between font-sans text-sm text-green-600">
                                            <span>Скидка {promoApplied}%</span><span>−{discount} ₽</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-dela text-xl text-brand-dark border-t border-brand-pink/20 pt-2 mt-2">
                                        <span>Итого</span><span>{finalTotal} ₽</span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || isSubmitting}
                                    className="w-full py-4 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Подтвердить заказ <ChevronRight className="w-5 h-5" /></>
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* Success */
                            <div className="p-8 text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle2 className="w-14 h-14 text-green-500" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="font-dela text-3xl text-brand-dark">Заказ принят!</h2>
                                    <p className="font-sans text-brand-dark/60 text-lg">
                                        Наш менеджер свяжется с вами по номеру<br />
                                        <strong className="text-brand-dark">{phone}</strong> в течение 5–10 минут.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-full py-4 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-all"
                                >
                                    Отлично! 🍓
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
