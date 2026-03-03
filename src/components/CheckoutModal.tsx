import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, Tag, Package, Bike, ChevronRight, CheckCircle2, Clock, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";



const DELIVERY_ZONES = [
    { label: "до 3 км", price: 150 },
    { label: "3–7 км", price: 250 },
    { label: "7–15 км", price: 400 },
    { label: "15+ км", price: null },
];

type Step = "form" | "success";

export const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { items, totalPrice, clearCart, appliedPromo, applyPromo: applyPromoGlobal, removePromo } = useCart();

    const [step, setStep] = useState<Step>("form");
    const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [intercom, setIntercom] = useState("");
    const [entrance, setEntrance] = useState("");
    const [floor, setFloor] = useState("");
    const [zone, setZone] = useState(0); // index in DELIVERY_ZONES
    const [promo, setPromo] = useState("");
    const [promoError, setPromoError] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryTime, setDeliveryTime] = useState<"today" | "later">("today");
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [targetDate, setTargetDate] = useState("");

    const deliveryCost = deliveryType === "pickup" ? 0 : (DELIVERY_ZONES[zone].price ?? 0);
    const promoDiscount = appliedPromo ? Math.round(totalPrice * appliedPromo.discount / 100) : 0;
    const futureDiscount = deliveryTime === "later" ? Math.round(totalPrice * 0.1) : 0;
    const discount = promoDiscount + futureDiscount;
    const finalTotal = totalPrice - discount + deliveryCost;

    const handleApplyPromo = () => {
        if (!promo.trim()) return;
        const result = applyPromoGlobal(promo);
        if (result.success) {
            setPromoError("");
        } else {
            setPromoError(result.message);
        }
    };

    const handleSubmit = async () => {
        if (!phone || !name || (deliveryType === "delivery" && !address)) return;
        setIsSubmitting(true);

        // 1. Отправляем на бэкенд для безопасности
        try {
            const orderData = {
                name,
                phone,
                deliveryType,
                deliveryTime,
                targetDate,
                address,
                apartment,
                intercom,
                entrance,
                floor,
                comment,
                items,
                total: finalTotal,
                discount,
                deliveryCost,
                appliedPromo: appliedPromo?.code,
                timestamp: Date.now()
            };

            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: orderData, type: 'redirect' })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка при оформлении заказа');
            }

            // Если пришла ссылка на оплату — переходим
            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }

            // Если оплата не нужна (или уже обработана)
            setStep("success");
            clearCart();
        } catch (error: any) {
            console.error("Ошибка при отправке:", error);
            alert(error.message || "Произошла ошибка при оформлении заказа. Попробуйте снова.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep("form");
        setPhone(""); setName(""); setAddress("");
        setApartment(""); setIntercom(""); setEntrance(""); setFloor("");
        setPromo("");
        setPromoError(""); setComment("");
        onClose();
    };

    const isFormValid = name.trim() && phone.replace(/\D/g, '').length === 11 && (deliveryType === "pickup" || address.trim()) && (deliveryTime === "today" || targetDate.trim());

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-brand-dark/70 z-[140]"
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
                                <div className="grid grid-cols-2 gap-2 p-1 bg-brand-pink/10 rounded-2xl mb-3">
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

                                {/* Delivery Time Toggle */}
                                <div className="relative z-40">
                                    <button
                                        onClick={(e) => { e.preventDefault(); setIsTimeDropdownOpen(!isTimeDropdownOpen); }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-brand-dark font-bold text-sm focus:outline-none focus:border-brand-hot transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-brand-hot" />
                                            <span>{deliveryTime === "today" ? "Сегодня (~60–90 мин)" : "На другой день (-10%)"}</span>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isTimeDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setDeliveryTime("today"); setIsTimeDropdownOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-bold transition-colors ${deliveryTime === "today" ? 'bg-brand-pink/10 text-brand-dark' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span>Сегодня (~60–90 мин)</span>
                                                    {deliveryTime === "today" && <CheckCircle2 className="w-5 h-5 text-brand-dark" />}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setDeliveryTime("later"); setIsTimeDropdownOpen(false); }}
                                                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-bold transition-colors border-t border-gray-100 ${deliveryTime === "later" ? 'bg-brand-pink/10 text-brand-dark' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>На другой день</span>
                                                        <span className="text-[10px] text-white bg-brand-hot px-1.5 py-0.5 rounded-full">-10%</span>
                                                    </div>
                                                    {deliveryTime === "later" && <CheckCircle2 className="w-5 h-5 text-brand-dark" />}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence>
                                    {deliveryTime === "later" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden mt-2"
                                        >
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-brand-dark/40 font-bold ml-1">Укажите дату и время</label>
                                                <input
                                                    type="datetime-local"
                                                    value={targetDate}
                                                    onChange={(e) => setTargetDate(e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all text-brand-dark"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                            onChange={(e) => {
                                                let input = e.target.value.replace(/\D/g, '');
                                                if (!input) { setPhone(''); return; }
                                                if (input[0] === '8' || input[0] === '7') input = '7' + input.slice(1);
                                                else if (input[0] === '9') input = '7' + input;
                                                else input = '7' + input;
                                                input = input.slice(0, 11);
                                                let formatted = '+7';
                                                if (input.length > 1) formatted += ' (' + input.substring(1, 4);
                                                if (input.length >= 5) formatted += ') ' + input.substring(4, 7);
                                                if (input.length >= 8) formatted += '-' + input.substring(7, 9);
                                                if (input.length >= 10) formatted += '-' + input.substring(9, 11);
                                                setPhone(formatted);
                                            }}
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

                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-brand-dark/40 font-bold ml-1">Кв./офис</label>
                                                    <input type="text" value={apartment} onChange={e => setApartment(e.target.value)} className="w-full px-2 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-xs focus:outline-none focus:border-brand-hot focus:bg-white transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-brand-dark/40 font-bold ml-1">Домофон</label>
                                                    <input type="text" value={intercom} onChange={e => setIntercom(e.target.value)} className="w-full px-2 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-xs focus:outline-none focus:border-brand-hot focus:bg-white transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-brand-dark/40 font-bold ml-1">Подъезд</label>
                                                    <input type="text" value={entrance} onChange={e => setEntrance(e.target.value)} className="w-full px-2 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-xs focus:outline-none focus:border-brand-hot focus:bg-white transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-brand-dark/40 font-bold ml-1">Этаж</label>
                                                    <input type="text" value={floor} onChange={e => setFloor(e.target.value)} className="w-full px-2 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-xs focus:outline-none focus:border-brand-hot focus:bg-white transition-all" />
                                                </div>
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
                                                onChange={(e) => {
                                                    setPromo(e.target.value);
                                                    setPromoError("");
                                                }}
                                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-brand-pink/20 bg-brand-pink/5 font-sans text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-all uppercase"
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyPromo}
                                            className="px-4 py-3.5 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-hot transition-all"
                                        >
                                            OK
                                        </button>
                                    </div>

                                    {appliedPromo && (
                                        <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                            <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Скидка {appliedPromo.discount}% ({appliedPromo.code})
                                            </p>
                                            <button onClick={removePromo} className="text-green-600 hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    {promoError && <p className="text-red-500 text-xs px-1 italic">{promoError}</p>}
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
                                    {appliedPromo && (
                                        <div className="flex justify-between font-sans text-sm text-green-600">
                                            <span>Скидка {appliedPromo.discount}%</span><span>−{promoDiscount} ₽</span>
                                        </div>
                                    )}
                                    {deliveryTime === "later" && (
                                        <div className="flex justify-between font-sans text-sm text-brand-hot font-bold">
                                            <span>Скидка за предзаказ 10%</span><span>−{futureDiscount} ₽</span>
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

                                <div className="pt-4 mt-2 border-t border-brand-pink/10 text-center">
                                    <p className="text-[10px] text-brand-dark/40 leading-relaxed font-sans">
                                        ИП Горбачева Гахара Муриковна<br />
                                        ИНН: 773015005650 | ОГРНИП: 322774600682247<br />
                                        121309, г. Москва, ул. Сеславинская, д. 28, кв. 46
                                    </p>
                                </div>
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
