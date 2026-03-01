import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, User, Tag, Package, Bike, ChevronLeft, CheckCircle2, Loader2, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const PROMO_CODES: Record<string, number> = {
    "LETO2025": 10,
    "APELSINKA": 15,
    "SALE10": 10,
};

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
    const [paymentToken, setPaymentToken] = useState<string | null>(null);
    const [showPaymentWidget, setShowPaymentWidget] = useState(false);
    const [widgetError, setWidgetError] = useState<boolean>(false);
    const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [manualDeliveryCost, setManualDeliveryCost] = useState<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const isWidgetRendered = useRef(false);

    // Инициализация Yandex Maps Suggest
    useEffect(() => {
        if (deliveryType !== 'delivery') return;

        let suggestInstance: any = null;
        let checkInterval: any = null;

        const initSuggest = () => {
            const ymaps = (window as any).ymaps;
            if (!ymaps) return;

            ymaps.ready(() => {
                const inputEl = document.getElementById("address-input");
                if (!inputEl) return;

                try {
                    if (suggestInstance) suggestInstance.destroy();
                    suggestInstance = new ymaps.SuggestView("address-input", { results: 5 });
                    if (suggestInstance.state) suggestInstance.state.set('zIndex', 99999);

                    suggestInstance.events.add("select", (e: any) => {
                        const selectedAddress = e.get("item").value;
                        setAddress(selectedAddress);
                        calculateDelivery(selectedAddress);
                    });
                } catch (err) { console.error("Yandex Suggest Error:", err); }
            });
        };

        if ((window as any).ymaps) initSuggest();
        else {
            checkInterval = setInterval(() => {
                if ((window as any).ymaps) {
                    clearInterval(checkInterval);
                    initSuggest();
                }
            }, 300);
        }

        return () => {
            if (checkInterval) clearInterval(checkInterval);
            if (suggestInstance && typeof suggestInstance.destroy === 'function') suggestInstance.destroy();
        };
    }, [deliveryType]);

    const calculateDelivery = async (targetAddress: string) => {
        const ymaps = (window as any).ymaps;
        if (!ymaps || !targetAddress.trim() || deliveryType === "pickup") return;

        setIsCalculating(true);
        try {
            const route = await ymaps.route([STORE_COORDS, targetAddress]);
            const distanceInKm = Math.round(route.getLength() / 1000 * 10) / 10;
            setCalculatedDistance(distanceInKm);

            const geocodeResult = await ymaps.geocode(targetAddress);
            const firstGeoObject = geocodeResult.geoObjects.get(0);

            if (firstGeoObject && mapRef.current) {
                const targetCoords = firstGeoObject.geometry.getCoordinates();
                if (!mapInstance.current) {
                    mapInstance.current = new ymaps.Map(mapRef.current, {
                        center: targetCoords,
                        zoom: 16,
                        controls: ['zoomControl', 'fullscreenControl']
                    });
                } else {
                    mapInstance.current.setCenter(targetCoords, 16, { checkZoomRange: true, duration: 500 });
                }
                mapInstance.current.geoObjects.removeAll();
                mapInstance.current.geoObjects.add(new ymaps.Placemark(targetCoords, { balloonContent: targetAddress }, { preset: 'islands#pinkDotIcon' }));
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
        } finally { setIsCalculating(false); }
    };

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

    // Инициализация виджета ЮKassa
    useEffect(() => {
        if (!paymentToken || !showPaymentWidget) {
            isWidgetRendered.current = false;
            return;
        }

        if (isWidgetRendered.current) return;
        setWidgetError(false);

        const loadAndRenderWidget = () => {
            const YooWidget = (window as any).YooMoneyCheckoutWidget || (window as any).YooCheckout;
            if (!YooWidget) return false;

            try {
                const container = document.getElementById('payment-form');
                if (!container) return false;
                container.innerHTML = '';

                const checkout = new YooWidget({
                    confirmation_token: paymentToken,
                    return_url: window.location.origin + window.location.pathname + '?success=true',
                    error_callback: (error: any) => {
                        console.error("YooKassa Widget Error:", error);
                        setWidgetError(true);
                        isWidgetRendered.current = false;
                    }
                });

                if (typeof checkout.on === 'function') {
                    checkout.on('success', () => {
                        setShowPaymentWidget(false);
                        setStep("success");
                        clearCart();
                    });
                    checkout.on('fail', () => {
                        setShowPaymentWidget(false);
                        alert("Ошибка при оплате. Попробуйте еще раз.");
                    });
                }

                checkout.render('payment-form');
                isWidgetRendered.current = true;
                return true;
            } catch (err) {
                console.error("YooKassa Render Exception:", err);
                setWidgetError(true);
                return true;
            }
        };

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (isWidgetRendered.current) {
                clearInterval(interval);
                return;
            }

            const completed = loadAndRenderWidget();
            if (completed) clearInterval(interval);
            else if (attempts > 15) {
                clearInterval(interval);
                setWidgetError(true);
            }
        }, 200);

        return () => {
            clearInterval(interval);
        };
    }, [paymentToken, showPaymentWidget]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            setStep("success");
            clearCart();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [clearCart]);

    const handleSubmit = async (payTypeArg: 'embedded' | 'redirect' | any = 'embedded') => {
        if (!isFormValid || isSubmitting) {
            return;
        }

        // ЗАЩИТА ОТ КРУГОВЫХ ССЫЛОК и правильное определение типа
        const payType = typeof payTypeArg === 'string' ? payTypeArg : 'embedded';

        setIsSubmitting(true);

        // Создаем МАКСИМАЛЬНО чистый объект БЕЗ вложенных объектов исходного состояния
        // Собираем всё вручную, чтобы исключить попадание Proxy или объектов событий
        const cleanItems = items.map(item => ({
            name: String(item.name || ''),
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0)
        }));

        const orderData = {
            items: cleanItems,
            total: Number(finalTotal),
            deliveryCost: Number(deliveryCost),
            discount: Number(discount),
            deliveryType: String(deliveryType),
            name: String(name).trim(),
            phone: String(phone).trim(),
            address: String(address).trim(),
            comment: String(comment || '').trim(),
            type: payType, // 'embedded' или 'redirect'
            timestamp: new Date().toISOString()
        };

        try {

            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Ошибка сервера (${response.status})`);
            }

            // Сохраняем инфо в локалсторадж
            try {
                localStorage.setItem("apelsinka_user_info", JSON.stringify({
                    name: String(name),
                    phone: String(phone),
                    address: String(address),
                    deliveryType: String(deliveryType)
                }));
            } catch (e) {
            }

            if (result.confirmationToken && payType === 'embedded') {
                setPaymentToken(result.confirmationToken);
                setShowPaymentWidget(true);
                setIsSubmitting(false);
                return;
            }

            // Если пришел URL для редиректа или мы специально просили редирект
            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }

            // На случай, если оплата не требуется (например, 0 руб или другой способ)
            setIsSubmitting(false);
            setStep("success");
            clearCart();
        } catch (error: any) {
            console.error("Order submit error:", error);
            alert("Не удалось создать заказ: " + (error.message || "Неизвестная ошибка"));
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (items.length === 0 && step !== "success") navigate("/");
    }, [items.length, step, navigate]);

    if (items.length === 0 && step !== "success") return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                <div className="px-4 h-14 flex items-center justify-between max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-brand-dark/60 hover:text-brand-hot transition-colors font-bold min-w-[60px]">
                        <ChevronLeft className="w-5 h-5 shrink-0" /> <span className="text-sm">Назад</span>
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
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Способ получения</h2>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                <button onClick={() => setDeliveryType("delivery")} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "delivery" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Bike className="w-4 h-4 shrink-0" /> Доставка
                                </button>
                                <button onClick={() => setDeliveryType("pickup")} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "pickup" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Package className="w-4 h-4 shrink-0" /> Самовывоз
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                            <h2 className="font-dela text-base text-brand-dark">Контакты</h2>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
                            </div>
                        </div>

                        {deliveryType === "delivery" && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                <h2 className="font-dela text-base text-brand-dark">Адрес доставки</h2>
                                <div className="relative z-50">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input id="address-input" type="text" placeholder="Город, улица, дом" value={address} autoComplete="off" onChange={e => {
                                        setAddress(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setCalculatedDistance(null);
                                            setManualDeliveryCost(null);
                                            if (mapInstance.current) mapInstance.current.geoObjects.removeAll();
                                        }
                                    }} onBlur={() => { if (address.trim() && !calculatedDistance) calculateDelivery(address); }} className={inputClass} />
                                    {isCalculating && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 text-brand-hot animate-spin" /></div>}
                                </div>
                                <div className={`w-full overflow-hidden border border-brand-pink/20 bg-gray-50 transition-all duration-700 rounded-2xl ${address ? 'h-56 opacity-100 mt-2 shadow-inner' : 'h-0 opacity-0 mt-0'}`}><div ref={mapRef} className="w-full h-full" /></div>
                                <div className="bg-brand-pink/5 p-3 rounded-xl border border-brand-pink/10">
                                    {calculatedDistance ? (
                                        <div className="flex justify-between items-center text-xs text-brand-dark mb-2"><span className="font-bold">Расстояние:</span><span className="bg-white px-2 py-0.5 rounded-full border border-brand-pink/20 shadow-sm">{calculatedDistance} км</span></div>
                                    ) : (<p className="text-xs text-brand-dark font-bold mb-2">Тарифы (от Украинский б-р, 8с1):</p>)}
                                    <ul className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                                        <li className={calculatedDistance && calculatedDistance <= 5 ? "text-brand-hot font-bold" : ""}>• До 5 км — 500 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 5 && calculatedDistance <= 10 ? "text-brand-hot font-bold" : ""}>• От 5 до 10 км — 650 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 10 && calculatedDistance <= 20 ? "text-brand-hot font-bold" : ""}>• От 10 до 20 км — 1 000 ₽</li>
                                        <li className={calculatedDistance && calculatedDistance > 20 ? "text-brand-hot font-bold" : ""}>• Более 20 км — 1 500 ₽</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {deliveryType === "pickup" && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="flex gap-3 items-start"><MapPin className="w-5 h-5 text-brand-hot shrink-0 mt-0.5" /><div><p className="font-bold text-brand-dark text-sm">Украинский бульвар, 8с1</p><p className="text-gray-400 text-xs mt-0.5">Ежедневно 9:00 – 20:00</p></div></div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Комментарий</h2>
                            <textarea placeholder="Пожелания к заказу (необязательно)" value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-base resize-none focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Промокод</h2>
                            <div className="flex gap-2">
                                <div className="relative flex-grow"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type="text" placeholder="Введите промокод" value={promo} onChange={e => { setPromo(e.target.value); setPromoApplied(null); setPromoError(""); }} className={inputClass} /></div>
                                <button onClick={applyPromo} className="px-5 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-hot transition-colors min-h-[48px] shrink-0">OK</button>
                            </div>
                            {promoApplied && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Скидка {promoApplied}% применена</p>}
                            {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Ваш заказ</h2>
                            <div className="space-y-2">{items.map(item => (<div key={item.id} className="flex justify-between text-sm text-gray-500"><span className="truncate mr-2">{item.name} × {item.quantity}</span><span className="shrink-0 font-bold text-brand-dark">{item.price * item.quantity} ₽</span></div>))}</div>
                            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
                                {deliveryType === "delivery" && (<div className="flex justify-between text-sm text-gray-400"><span>Доставка {calculatedDistance ? `(${calculatedDistance} км)` : ""}</span><span className="text-right font-bold text-brand-dark">{manualDeliveryCost ? `${manualDeliveryCost} ₽` : "Расчет..."}</span></div>)}
                                {promoApplied && (<div className="flex justify-between text-sm text-green-600"><span>Скидка {promoApplied}%</span><span>−{discount} ₽</span></div>)}
                                <div className="flex justify-between font-dela text-xl text-brand-dark pt-1"><span>Итого</span><span>{finalTotal} ₽</span></div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit('embedded');
                            }}
                            disabled={!isFormValid || isSubmitting}
                            className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Подтвердить заказ →"}
                        </button>
                        <div className="h-8" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-14 h-14 text-green-500" /></motion.div><h2 className="font-dela text-3xl text-brand-dark">Заказ принят! 🍓</h2><p className="text-brand-dark/60 text-base leading-relaxed">Наш менеджер свяжется с вами по номеру<br /><strong className="text-brand-dark">{phone}</strong><br />в течение 5–10 минут.</p><button onClick={() => navigate("/")} className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-brand-dark transition-colors min-h-[56px]">На главную</button></motion.div>
                )}
            </main>

            {showPaymentWidget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
                        <button onClick={() => setShowPaymentWidget(false)} className="absolute top-4 right-4 z-10 p-2 text-gray-400 transition-colors hover:text-gray-600"><X size={24} /></button>
                        <div className="mb-4"><h3 className="text-xl font-bold text-gray-900 leading-tight">Оплата заказа</h3><p className="text-sm text-gray-500">Безопасный платеж через ЮKassa</p></div>
                        <div id="payment-form" className="min-h-[400px] flex items-center justify-center">
                            {widgetError ? (
                                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-red-600 font-bold mb-2">Форма оплаты заблокирована</p>
                                    <p className="text-sm text-red-500/80 leading-relaxed font-sans mb-6">
                                        Похоже, AdBlock или расширение безопасности блокирует загрузку модуля оплаты. <br /><br />
                                        <b>Ничего страшного! Вы можете оплатить напрямую на защищенной странице ЮKassa:</b>
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleSubmit('redirect');
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-brand-hot text-white rounded-xl font-bold shadow-lg hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Перейти на страницу оплаты →"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-hot" />
                                    <p className="text-sm">Загружаем безопасную форму...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
