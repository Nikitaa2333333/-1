import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, Tag, Package, Bike, ChevronRight, CheckCircle2 } from "lucide-react";
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

    const deliveryCost = deliveryType === "pickup" ? 0 : (DELIVERY_ZONES[zone].price ?? 0);
    const discount = appliedPromo ? Math.round(totalPrice * appliedPromo.discount / 100) : 0;
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

        // 1. Формируем текст сообщения для Telegram
        let orderText = `🚨 <b>НОВЫЙ ЗАКАЗ С САЙТА!</b>\n\n`;
        orderText += `👤 <b>Клиент:</b> ${name}\n`;
        orderText += `📞 <b>Телефон:</b> ${phone}\n`;
        orderText += `🚚 <b>Тип:</b> ${deliveryType === "pickup" ? "Самовывоз" : "Доставка"}\n`;
        if (deliveryType === "delivery") {
            orderText += `📍 <b>Адрес:</b> ${address}\n`;
            if (apartment) orderText += `🏠 <b>Кв/офис:</b> ${apartment}\n`;
            if (intercom) orderText += `🔔 <b>Домофон:</b> ${intercom}\n`;
            if (entrance) orderText += `🚪 <b>Подъезд:</b> ${entrance}\n`;
            if (floor) orderText += `⬆️ <b>Этаж:</b> ${floor}\n`;
            orderText += `🗺 <b>Зона:</b> ${DELIVERY_ZONES[zone].label} (${DELIVERY_ZONES[zone].price}₽)\n`;
        }
        if (comment) orderText += `💬 <b>Комментарий:</b> ${comment}\n`;
        if (appliedPromo) orderText += `🏷 <b>Промокод:</b> ${appliedPromo.code} (-${appliedPromo.discount}%)\n`;

        orderText += `\n🛍 <b>Корзина:</b>\n`;
        items.forEach((item: any) => {
            orderText += `- ${item.name} (x${item.quantity}) = ${item.price * item.quantity}₽\n`;
        });

        orderText += `\n💰 <b>ИТОГО:</b> ${finalTotal}₽`;

        // 2. Отправляем в Telegram
        try {
            // Замените на ваш актуальный токен и Chat ID из .env (сейчас захардкодим для работы с фронта)
            // В идеале это нужно делать через серверлес функцию (как save-content), но для простоты шлем отсюда
            const BOT_TOKEN = "7544062025:AAGC-90AAN_84K5T81E6O9068K9Y3u28NCM"; // Токен из твоего старого бота
            const CHAT_ID = "1430030080";      // Твой Chat ID администратора 

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: orderText,
                    parse_mode: "HTML"
                })
            });
        } catch (error) {
            console.error("Ошибка при отправке в ТГ:", error);
        }

        setIsSubmitting(false);
        setStep("success");
        clearCart();
    };

    const handleClose = () => {
        setStep("form");
        setPhone(""); setName(""); setAddress("");
        setApartment(""); setIntercom(""); setEntrance(""); setFloor("");
        setPromo("");
        setPromoError(""); setComment("");
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
                                            <span>Скидка {appliedPromo.discount}%</span><span>−{Math.round(totalPrice * appliedPromo.discount / 100)} ₽</span>
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
