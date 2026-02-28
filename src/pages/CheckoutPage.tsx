import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, User, Tag, Package, Bike, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const PROMO_CODES: Record<string, number> = {
    "LETO2025": 10,
    "APELSINKA": 15,
    "SALE10": 10,
};



// text-base обязателен на iOS — иначе Safari зумит страницу при фокусе на input
const STORE_COORDS = [55.746644, 37.565883];
const inputClass = "w-full pl-10 pr-4 py-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-base focus:outline-none focus:border-brand-hot focus:bg-white transition-colors";

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();

    const [step, setStep] = useState<"form" | "success">("form");
    const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [promo, setPromo] = useState("");
    const [promoApplied, setPromoApplied] = useState<number | null>(null);
    const [promoError, setPromoError] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [manualDeliveryCost, setManualDeliveryCost] = useState<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    // Инициализация Yandex Maps Suggest с ожиданием загрузки и привязкой к режиму доставки
    useEffect(() => {
        if (deliveryType !== 'delivery') return;

        let suggestInstance: any = null;
        let attempts = 0;

        const initSuggest = () => {
            const ymaps = (window as any).ymaps;
            const inputEl = document.getElementById("address-input");

            if (!ymaps || !inputEl) {
                if (attempts < 30) {
                    attempts++;
                    setTimeout(initSuggest, 400);
                }
                return;
            }

            ymaps.ready(() => {
                try {
                    // Если уже есть инстанс, не создаем дубликат
                    suggestInstance = new ymaps.SuggestView("address-input", {
                        results: 5,
                        container: document.body
                    });

                    suggestInstance.events.add("select", (e: any) => {
                        const selectedAddress = e.get("item").value;
                        setAddress(selectedAddress);
                        calculateDelivery(selectedAddress);
                    });
                } catch (err) {
                    console.error("Yandex Suggest Error:", err);
                }
            });
        };

        const timer = setTimeout(initSuggest, 500);

        return () => {
            clearTimeout(timer);
            suggestInstance = null;
        };
    }, [deliveryType]); // Переинициализируем при смене типа доставки

    const calculateDelivery = async (targetAddress: string) => {
        const ymaps = (window as any).ymaps;
        if (!ymaps || !targetAddress.trim() || deliveryType === "pickup") return;

        setIsCalculating(true);
        try {
            const route = await ymaps.route([STORE_COORDS, targetAddress]);
            const distanceInKm = Math.round(route.getLength() / 1000 * 10) / 10;
            setCalculatedDistance(distanceInKm);

            // Работа с картой
            if (mapRef.current) {
                if (!mapInstance.current) {
                    mapInstance.current = new ymaps.Map(mapRef.current, {
                        center: STORE_COORDS,
                        zoom: 12,
                        controls: ['zoomControl', 'fullscreenControl']
                    });
                }

                mapInstance.current.geoObjects.removeAll();

                // Настраиваем внешний вид маршрута
                route.getPaths().options.set({
                    strokeColor: 'ff4d94',
                    strokeWidth: 5,
                    opacity: 0.8
                });

                mapInstance.current.geoObjects.add(route);

                // Масштабируем
                mapInstance.current.setBounds(route.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: 50
                });
            }

            let cost = 500;
            if (distanceInKm > 20) cost = 1500;
            else if (distanceInKm > 10) cost = 1000;
            else if (distanceInKm > 5) cost = 650;
            else cost = 500;

            setManualDeliveryCost(cost);
        } catch (err) {
            console.error("Route calculation error:", err);
            setManualDeliveryCost(null);
            setCalculatedDistance(null);
            if (mapInstance.current) {
                mapInstance.current.geoObjects.removeAll();
            }
        } finally {
            setIsCalculating(false);
        }
    };

    // Загружаем сохранённые данные при открытии формы
    useEffect(() => {
        const saved = localStorage.getItem("apelsinka_user_info");
        if (saved) {
            try {
                const { name, phone, address, deliveryType } = JSON.parse(saved);
                if (name) setName(name);
                if (phone) setPhone(phone);
                if (address) {
                    setAddress(address);
                    if (deliveryType === "delivery") calculateDelivery(address);
                }
                if (deliveryType) setDeliveryType(deliveryType);
            } catch { }
        }
    }, []);

    const deliveryCost = deliveryType === "pickup" ? 0 : (manualDeliveryCost || 0);
    const discount = promoApplied ? Math.round(totalPrice * promoApplied / 100) : 0;
    const finalTotal = totalPrice - discount + deliveryCost;
    const isFormValid = name.trim() && phone.trim().length >= 6 && (deliveryType === "pickup" || (address.trim() && !isCalculating));

    const applyPromo = () => {
        const code = promo.trim().toUpperCase();
        if (PROMO_CODES[code]) {
            setPromoApplied(PROMO_CODES[code]);
            setPromoError("");
        } else {
            setPromoApplied(null);
            setPromoError("Промокод не найден");
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setIsSubmitting(true);

        const orderData = {
            items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            total: finalTotal,
            deliveryCost,
            discount,
            deliveryType,
            name,
            phone,
            address,
            comment,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Ошибка при отправке заказа');
            }

            // Сохраняем данные пользователя для следующего заказа
            localStorage.setItem("apelsinka_user_info", JSON.stringify({ name, phone, address, deliveryType }));
            setIsSubmitting(false);
            setStep("success");
            clearCart();
        } catch (error: any) {
            console.error("Order error:", error);
            alert("Произошла ошибка при отправке заказа: " + error.message);
            setIsSubmitting(false);
        }
    };

    if (items.length === 0 && step !== "success") {
        navigate("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header — компактный, не ломается на маленьких экранах */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                <div className="px-4 h-14 flex items-center justify-between max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-brand-dark/60 hover:text-brand-hot transition-colors font-bold min-w-[60px]"
                    >
                        <ChevronLeft className="w-5 h-5 shrink-0" />
                        <span className="text-sm">Назад</span>
                    </button>

                    <span className="font-dela text-sm md:text-base text-brand-dark truncate px-2">Оформление заказа</span>

                    <div className="min-w-[60px] flex justify-end">
                        <img src="/assets/logo.webp" alt="Апельсинка" className="h-7 object-contain" />
                    </div>
                </div>
            </header>

            <main className="px-4 py-6 max-w-2xl mx-auto space-y-4 pb-10">
                {step === "form" ? (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                        {/* Способ получения */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Способ получения</h2>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button onClick={() => setDeliveryType("delivery")}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "delivery" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Bike className="w-4 h-4 shrink-0" /> Доставка
                                </button>
                                <button onClick={() => setDeliveryType("pickup")}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "pickup" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Package className="w-4 h-4 shrink-0" /> Самовывоз
                                </button>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                            <h2 className="font-dela text-base text-brand-dark">Контакты</h2>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="text" placeholder="Ваше имя" value={name}
                                    onChange={e => setName(e.target.value)} className={inputClass} />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="tel" placeholder="+7 (___) ___-__-__" value={phone}
                                    onChange={e => setPhone(e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        {/* Адрес (только для доставки) */}
                        {deliveryType === "delivery" && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                <h2 className="font-dela text-base text-brand-dark">Адрес доставки</h2>
                                <div className="relative z-50">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        id="address-input"
                                        type="text"
                                        placeholder="Город, улица, дом"
                                        value={address}
                                        autoComplete="off"
                                        onChange={e => {
                                            setAddress(e.target.value);
                                            // Если адрес очищен — сбрасываем расчеты
                                            if (!e.target.value.trim()) {
                                                setCalculatedDistance(null);
                                                setManualDeliveryCost(null);
                                                if (mapInstance.current) mapInstance.current.geoObjects.removeAll();
                                            }
                                        }}
                                        onBlur={() => {
                                            // Дополнительная проверка при потере фокуса, если не выбрали из списка
                                            if (address.trim() && !calculatedDistance) {
                                                calculateDelivery(address);
                                            }
                                        }}
                                        className={inputClass}
                                    />
                                    {isCalculating && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 text-brand-hot animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Карта Яндекса */}
                                <div
                                    className={`w-full overflow-hidden border border-brand-pink/20 bg-gray-50 transition-all duration-700 rounded-2xl ${address ? 'h-56 opacity-100 mt-2 shadow-inner' : 'h-0 opacity-0 mt-0'}`}
                                >
                                    <div ref={mapRef} className="w-full h-full" />
                                </div>

                                <div className="bg-brand-pink/5 p-3 rounded-xl border border-brand-pink/10">
                                    {calculatedDistance ? (
                                        <div className="flex justify-between items-center text-xs text-brand-dark mb-2">
                                            <span className="font-bold">Расстояние:</span>
                                            <span className="bg-white px-2 py-0.5 rounded-full border border-brand-pink/20 shadow-sm">{calculatedDistance} км</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-brand-dark font-bold mb-2">Тарифы (от Украинский б-р, 8с1):</p>
                                    )}
                                    <ul className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                                        <li className={calculatedDistance && calculatedDistance <= 5 ? "text-brand-hot font-bold" : ""}>• До 5 км — 500 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 5 && calculatedDistance <= 10 ? "text-brand-hot font-bold" : ""}>• От 5 до 10 км — 650 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 10 && calculatedDistance <= 20 ? "text-brand-hot font-bold" : ""}>• От 10 до 20 км — 1 000 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 20 ? "text-brand-hot font-bold" : ""}>• Более 20 км — 1 500 ₽</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Самовывоз */}
                        {deliveryType === "pickup" && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="flex gap-3 items-start">
                                    <MapPin className="w-5 h-5 text-brand-hot shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-brand-dark text-sm">Украинский бульвар, 8с1</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Ежедневно 9:00 – 20:00</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Комментарий */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Комментарий</h2>
                            <textarea placeholder="Пожелания к заказу (необязательно)" value={comment}
                                onChange={e => setComment(e.target.value)} rows={3}
                                className="w-full px-4 py-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-base resize-none focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                        </div>

                        {/* Промокод */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Промокод</h2>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input type="text" placeholder="Введите промокод" value={promo}
                                        onChange={e => { setPromo(e.target.value); setPromoApplied(null); setPromoError(""); }}
                                        className={inputClass} />
                                </div>
                                <button onClick={applyPromo}
                                    className="px-5 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-hot transition-colors min-h-[48px] shrink-0">
                                    OK
                                </button>
                            </div>
                            {promoApplied && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Скидка {promoApplied}% применена</p>}
                            {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                        </div>

                        {/* Итого */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Ваш заказ</h2>
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm text-gray-500">
                                        <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                                        <span className="shrink-0 font-bold text-brand-dark">{item.price * item.quantity} ₽</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
                                {deliveryType === "delivery" && (
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Доставка {calculatedDistance ? `(${calculatedDistance} км)` : ""}</span>
                                        <span className="text-right font-bold text-brand-dark">
                                            {manualDeliveryCost ? `${manualDeliveryCost} ₽` : "Расчет..."}
                                        </span>
                                    </div>
                                )}
                                {promoApplied && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Скидка {promoApplied}%</span><span>−{discount} ₽</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-dela text-xl text-brand-dark pt-1">
                                    <span>Итого</span><span>{finalTotal} ₽</span>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка — большая, удобная для тапа на телефоне */}
                        <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}
                            className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]">
                            {isSubmitting
                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : "Подтвердить заказ →"}
                        </button>

                        {/* Отступ для iPhone Home Indicator */}
                        <div className="h-8" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 space-y-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-14 h-14 text-green-500" />
                        </motion.div>
                        <h2 className="font-dela text-3xl text-brand-dark">Заказ принят! 🍓</h2>
                        <p className="text-brand-dark/60 text-base leading-relaxed">
                            Наш менеджер свяжется с вами по номеру<br />
                            <strong className="text-brand-dark">{phone}</strong><br />
                            в течение 5–10 минут.
                        </p>
                        <button onClick={() => navigate("/")}
                            className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-brand-dark transition-colors min-h-[56px]">
                            На главную
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
};
