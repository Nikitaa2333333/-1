import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, User, Tag, Package, Bike, ChevronLeft, CheckCircle2, Loader2, X, Clock, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";



const STORE_COORDS = [55.746644, 37.565883];
const inputClass = "w-full pl-10 pr-4 py-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-base focus:outline-none focus:border-brand-hot focus:bg-white transition-colors";

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, subtotal, clearCart, appliedPromo, applyPromo: applyPromoGlobal, removePromo } = useCart();

    const [step, setStep] = useState<"form" | "success">("form");
    const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [intercom, setIntercom] = useState("");
    const [entrance, setEntrance] = useState("");
    const [floor, setFloor] = useState("");
    const [promo, setPromo] = useState("");
    const [promoError, setPromoError] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentToken, setPaymentToken] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [showPaymentWidget, setShowPaymentWidget] = useState(false);
    const [widgetError, setWidgetError] = useState<boolean>(false);
    const [paymentPolling, setPaymentPolling] = useState(false);
    const pollingRef = useRef<any>(null);
    const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [manualDeliveryCost, setManualDeliveryCost] = useState<number | null>(null);
    const [deliveryTime, setDeliveryTime] = useState<"today" | "later">("today");
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [targetDate, setTargetDate] = useState("");
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
            const geocodeResult = await ymaps.geocode(targetAddress);
            const firstGeoObject = geocodeResult.geoObjects.get(0);

            if (firstGeoObject && mapRef.current) {
                const targetCoords = firstGeoObject.geometry.getCoordinates();

                // Рассчитываем ПРЯМОЕ (радиальное) расстояние, так как зоны в кабинете — это круги
                const distanceInMeters = ymaps.coordSystem.geo.getDistance(STORE_COORDS, targetCoords);
                const distanceInKm = distanceInMeters / 1000;
                setCalculatedDistance(Math.round(distanceInKm * 10) / 10);

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

                // Новая логика: 600₽ база (до 3 км включительно), далее +200₽ за каждый км
                let cost = 600;
                if (distanceInKm > 3) {
                    cost += Math.ceil(distanceInKm - 3) * 200;
                }

                setManualDeliveryCost(cost);
            }
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
                const { name, phone, address, apartment, intercom, entrance, floor, deliveryType } = JSON.parse(saved);
                if (name) setName(name);
                if (phone) setPhone(phone);
                if (address) {
                    setAddress(address);
                    if (deliveryType === "delivery") calculateDelivery(address);
                }
                if (apartment) setApartment(apartment);
                if (intercom) setIntercom(intercom);
                if (entrance) setEntrance(entrance);
                if (floor) setFloor(floor);
                if (deliveryType) setDeliveryType(deliveryType);
            } catch { }
        }
    }, []);

    const deliveryCost = deliveryType === "pickup" ? 0 : (manualDeliveryCost || 0);

    const getDeliveryTime = (km: number | null): string => {
        if (!km) return "";
        if (km <= 3) return "~30 минут";
        if (km <= 5) return "~60 минут";
        return "~90 минут";
    };
    const promoDiscount = appliedPromo ? Math.round(subtotal * appliedPromo.discount / 100) : 0;
    // Логика "Либо-Либо": если применен промокод, скидка за предзаказ отменяется (0)
    const futureDiscount = (deliveryTime === "later" && !appliedPromo) ? Math.round(subtotal * 0.1) : 0;
    const discount = promoDiscount + futureDiscount;
    const finalTotal = subtotal - discount + deliveryCost;

    // Валидация формы: доставка должна быть либо pickup, либо с рассчитанной стоимостью (manualDeliveryCost)
    const isDeliveryValid = deliveryType === "pickup" || (address.trim() && !isCalculating && manualDeliveryCost !== null);

    const isFormValid = name.trim() && phone.replace(/\D/g, '').length === 11 && isDeliveryValid && (deliveryTime === "today" || targetDate.trim());

    const handleApplyPromo = () => {
        if (!promo.trim()) return;
        const result = applyPromoGlobal(promo);
        if (result.success) {
            setPromoError("");
        } else {
            setPromoError(result.message);
        }
    };

    // Функция перехода к успешному экрану (теперь проверяет статус через API)
    const handlePaymentSuccess = async () => {
        if (!paymentId) return;

        try {
            const res = await fetch(`/api/check-payment?id=${paymentId}`);
            const data = await res.json();

            if (data.status === 'succeeded') {
                if (pollingRef.current) clearInterval(pollingRef.current);
                setPaymentPolling(false);
                setStep("success");
                setShowPaymentWidget(false);
                clearCart();
            } else {
                alert("Оплата еще не подтверждена. Пожалуйста, завершите платеж или подождите несколько секунд.");
            }
        } catch (e) {
            alert("Ошибка при проверке статуса платежа. Попробуйте нажать кнопку еще раз через 5-10 секунд.");
        }
    };

    // Polling статуса платежа (запрашиваем каждые 3 сек)
    useEffect(() => {
        if (!paymentId || !showPaymentWidget) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
        }

        setPaymentPolling(true);
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/check-payment?id=${paymentId}`);
                if (!res.ok) return;
                const data = await res.json();
                console.log('[Polling] Payment status:', data.status);
                if (data.status === 'succeeded') {
                    handlePaymentSuccess();
                }
            } catch (e) {
                // игнорируем ошибки сети
            }
        }, 3000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [paymentId, showPaymentWidget]);

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
                    error_callback: (error: any) => {
                        console.error("YooKassa Widget Error:", error);
                        setWidgetError(true);
                        isWidgetRendered.current = false;
                    }
                });

                if (typeof checkout.on === 'function') {
                    // Механизм 1: native событие виджета
                    checkout.on('success', () => {
                        console.log('🍓 [YooKassa] SUCCESS event');
                        handlePaymentSuccess();
                        try { checkout.destroy(); } catch (e) { }
                    });

                    checkout.on('complete', () => {
                        console.log('🍓 [YooKassa] COMPLETE event — проверяем статус через polling');
                        // complete может прийти и при успехе, и при закрытии — polling разберётся
                    });

                    checkout.on('fail', () => {
                        console.warn('🍓 [YooKassa] FAIL event');
                        setShowPaymentWidget(false);
                        setWidgetError(true);
                        setPromoError("Оплата не удалась или была отменена.");
                        try { checkout.destroy(); } catch (e) { }
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
            id: item.id,
            name: String(item.name || ''),
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0)
        }));

        const orderData = {
            items: cleanItems,
            total: Number(finalTotal),
            deliveryCost: Number(deliveryCost),
            discount: Number(discount),
            appliedPromo: appliedPromo ? String(appliedPromo.code) : null,
            deliveryType: String(deliveryType),
            deliveryTime: String(deliveryTime),
            targetDate: String(targetDate).trim(),
            name: String(name).trim(),
            phone: String(phone).trim(),
            address: String(address).trim(),
            apartment: String(apartment || '').trim(),
            intercom: String(intercom || '').trim(),
            entrance: String(entrance || '').trim(),
            floor: String(floor || '').trim(),
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
                    apartment: String(apartment),
                    intercom: String(intercom),
                    entrance: String(entrance),
                    floor: String(floor),
                    deliveryType: String(deliveryType)
                }));
            } catch (e) {
            }

            if (result.confirmationToken && payType === 'embedded') {
                setPaymentToken(result.confirmationToken);
                if (result.paymentId) setPaymentId(result.paymentId); // для polling
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
            console.error("Order submit error details:", error);
            let msg = "Неизвестная ошибка";
            if (typeof error === 'string') msg = error;
            else if (error.message) msg = error.message;
            else msg = JSON.stringify(error);

            alert("Ошибка при создании заказа: " + msg);
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
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-3">
                                <button onClick={() => setDeliveryType("delivery")} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "delivery" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Bike className="w-4 h-4 shrink-0" /> Доставка
                                </button>
                                <button onClick={() => setDeliveryType("pickup")} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all min-h-[48px] ${deliveryType === "pickup" ? "bg-white text-brand-dark shadow-md" : "text-gray-400"}`}>
                                    <Package className="w-4 h-4 shrink-0" /> Самовывоз
                                </button>
                            </div>

                            <h2 className="font-dela text-base text-brand-dark mb-3 mt-4">Время {deliveryType === "delivery" ? "доставки" : "самовывоза"}</h2>
                            <div className="relative z-40">
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsTimeDropdownOpen(!isTimeDropdownOpen); }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-brand-dark font-bold text-sm focus:outline-none focus:border-brand-hot transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-brand-hot" />
                                        <span>{deliveryTime === "today" ? "Сегодня (~60–90 мин)" : `На другой день ${!appliedPromo ? "(-10%)" : ""}`}</span>
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
                                                    {!appliedPromo && <span className="text-[10px] text-white bg-brand-hot px-1.5 py-0.5 rounded-full">-10%</span>}
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
                                        className="overflow-hidden mt-3"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold ml-1">Укажите дату и время</label>
                                            <input
                                                type="datetime-local"
                                                value={targetDate}
                                                onChange={(e) => setTargetDate(e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                            <h2 className="font-dela text-base text-brand-dark">Контакты</h2>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => {
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
                                }} className={inputClass} />
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

                                    {address.trim() && !isCalculating && manualDeliveryCost === null && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-pulse">
                                            ⚠️ пока так далеко не доставляем
                                        </p>
                                    )}
                                </div>

                                {address && (
                                    <div className="grid grid-cols-4 gap-2 mt-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold ml-1">Кв./офис</label>
                                            <input type="text" value={apartment} onChange={e => setApartment(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold ml-1">Домофон</label>
                                            <input type="text" value={intercom} onChange={e => setIntercom(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold ml-1">Подъезд</label>
                                            <input type="text" value={entrance} onChange={e => setEntrance(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 font-bold ml-1">Этаж</label>
                                            <input type="text" value={floor} onChange={e => setFloor(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-sm focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1 mt-3">
                                    <label className="text-[10px] text-gray-400 font-bold ml-1">Комментарий курьеру</label>
                                    <textarea placeholder="Пожелания к заказу (необязательно)" value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-brand-pink/20 bg-brand-pink/5 text-sm resize-none focus:outline-none focus:border-brand-hot focus:bg-white transition-colors" />
                                </div>
                                <div className={`w-full overflow-hidden border border-brand-pink/20 bg-gray-50 transition-all duration-700 rounded-2xl ${address ? 'h-56 opacity-100 mt-2 shadow-inner' : 'h-0 opacity-0 mt-0'}`}><div ref={mapRef} className="w-full h-full" /></div>
                                <div className="bg-brand-pink/5 p-4 rounded-2xl border border-brand-pink/20 space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-[11px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-hot mt-1 shrink-0" />
                                            <p className="text-gray-500 leading-tight"><b>От:</b> Украинский б-р, 8с1</p>
                                        </div>
                                        <div className="flex items-start gap-2 text-[11px]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                                            <p className="text-gray-500 leading-tight"><b>До:</b> {address}</p>
                                        </div>
                                    </div>

                                    {calculatedDistance ? (
                                        <div className="pt-2 border-t border-brand-pink/10">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-brand-dark">Расстояние:</span>
                                                <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-brand-pink/20 shadow-sm">{calculatedDistance} км</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-brand-dark">Доставка:</span>
                                                <span className="text-sm font-dela text-brand-hot">
                                                    {manualDeliveryCost !== null ? `${manualDeliveryCost} ₽ · ${getDeliveryTime(calculatedDistance)}` : "Недоступна"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 border-t border-brand-pink/10">
                                            <p className="text-[11px] text-brand-dark font-bold mb-1">Тарифы:</p>
                                            <ul className="text-[10px] text-gray-500 space-y-0.5">
                                                <li>• До 3 км — 600 ₽ (30 мин)</li>
                                                <li>• Свыше 3 км — 600 ₽ + 200 ₽/км (60-90 мин)</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {deliveryType === "pickup" && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-6 h-6 text-brand-hot" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-dela text-lg text-brand-dark leading-none">Apelsinka Bar</h3>
                                        <p className="text-gray-500 text-sm">Украинский бульвар, 8с1</p>
                                        <p className="text-brand-hot text-xs font-bold uppercase tracking-wider">Ежедневно 9:00 – 20:00</p>
                                    </div>
                                </div>

                                <div className="relative rounded-2xl overflow-hidden border border-brand-pink/10 shadow-inner h-64 group">
                                    <iframe
                                        src="https://yandex.ru/map-widget/v1/org/157424703728"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                        title="Apelsinka на карте"
                                    />
                                    <a
                                        href="https://yandex.ru/maps/org/apelsinka/157424703728/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-brand-hot text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-brand-dark transition-all active:scale-95"
                                    >
                                        Открыть в Картах →
                                    </a>
                                </div>

                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Промокод</h2>
                            <div className="flex gap-2">
                                <div className="relative flex-grow"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type="text" placeholder="Введите промокод" value={promo} onChange={e => { setPromo(e.target.value); setPromoError(""); }} className={inputClass} /></div>
                                <button onClick={handleApplyPromo} className="px-5 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-hot transition-colors min-h-[48px] shrink-0">OK</button>
                            </div>
                            {appliedPromo && (
                                <div className="mt-3 flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                    <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Скидка {appliedPromo.discount}% ({appliedPromo.code})
                                    </p>
                                    <button onClick={removePromo} className="text-green-600 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {promoError && <p className="text-red-500 text-xs mt-2 italic">{promoError}</p>}
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h2 className="font-dela text-base text-brand-dark mb-3">Ваш заказ</h2>
                            <div className="space-y-2">{items.map(item => (<div key={item.id} className="flex justify-between text-sm text-gray-500"><span className="truncate mr-2">{item.name} × {item.quantity}</span><span className="shrink-0 font-bold text-brand-dark">{item.price * item.quantity} ₽</span></div>))}</div>
                            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
                                {deliveryType === "delivery" && (<div className="flex justify-between text-sm text-gray-400"><span>Доставка {calculatedDistance ? `(${calculatedDistance} км)` : ""}</span><span className={manualDeliveryCost === null && !isCalculating && address ? "text-right font-bold text-red-500 text-xs max-w-[140px]" : "text-right font-bold text-brand-dark"}>{manualDeliveryCost === null && !isCalculating && address ? "Недоступна (слишком далеко)" : manualDeliveryCost !== null ? `${manualDeliveryCost} ₽ · ${getDeliveryTime(calculatedDistance)}` : "Расчет..."}</span></div>)}
                                {appliedPromo && (<div className="flex justify-between text-sm text-green-600"><span>Промокод {appliedPromo.code} (-{appliedPromo.discount}%)</span><span>−{promoDiscount} ₽</span></div>)}
                                {futureDiscount > 0 && (<div className="flex justify-between text-sm text-brand-hot font-bold"><span>Скидка за предзаказ 10%</span><span>−{futureDiscount} ₽</span></div>)}
                                <div className="flex justify-between font-dela text-xl text-brand-dark pt-1"><span>Итого</span><span>{finalTotal} ₽</span></div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit('embedded');
                            }}
                            disabled={!isFormValid || isSubmitting || (deliveryType === 'delivery' && manualDeliveryCost === null)}
                            className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-hot/20 hover:bg-brand-dark transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Подтвердить заказ →"}
                        </button>

                        {/* Support Contact Block */}
                        <div className="mt-6 bg-brand-pink/5 border border-brand-pink/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm">
                            <p className="font-sans text-brand-dark/60 text-xs font-bold">Не получается заказать или есть вопросы?</p>
                            <a
                                href="tel:+79017293919"
                                className="font-dela text-xl text-brand-dark hover:text-brand-hot transition-colors flex items-center gap-2"
                            >
                                <Phone className="w-5 h-5 text-brand-hot" /> +7 (901) 729-39-19
                            </a>
                            <a
                                href="https://t.me/gorbachevdmitry87"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 px-6 py-3 bg-[#2AABEE] text-white rounded-xl font-bold font-sans text-sm flex items-center justify-center gap-2 hover:bg-[#229ED9] transition-all shadow-[0_4px_10px_rgba(42,171,238,0.2)] w-fit"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.658-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
                                </svg>
                                Написать в Telegram
                            </a>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                                Индивидуальный предприниматель Горбачева Гахара Муриковна<br />
                                ИНН: 773015005650 | ОГРНИП: 322774600682247<br />
                                Юр. адрес: 121309, г. Москва, ул. Сеславинская, д. 28, кв. 46
                            </p>
                        </div>
                        <div className="h-8" />
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-14 h-14 text-green-500" /></motion.div><h2 className="font-dela text-3xl text-brand-dark">Заказ принят! 🍓</h2><p className="text-brand-dark/60 text-base leading-relaxed">Наш менеджер свяжется с вами по номеру<br /><strong className="text-brand-dark">{phone}</strong><br />в течение 5–10 минут.</p><button onClick={() => navigate("/")} className="w-full py-5 bg-brand-hot text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-brand-dark transition-colors min-h-[56px]">На главную</button></motion.div>
                )}
            </main>

            {showPaymentWidget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
                        <button
                            onClick={() => setShowPaymentWidget(false)}
                            className="absolute top-4 right-4 z-10 p-2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Оплата заказа</h3>
                            <p className="text-sm text-gray-500">Безопасный платеж через ЮKassa</p>
                        </div>
                        <div id="payment-form" className="min-h-[400px] flex items-center justify-center">
                            {widgetError ? (
                                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-red-600 font-bold mb-2">Форма оплаты заблокирована</p>
                                    <p className="text-sm text-red-500/80 leading-relaxed font-sans mb-6">
                                        Похоже, AdBlock или расширение безопасности блокирует загрузку модуля оплаты. <br /><br />
                                        <b>Вы можете оплатить напрямую на защищенной странице ЮKassa:</b>
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit('redirect'); }}
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
                        {/* Механизм 3: Кнопка ручного подтверждения — появляется после рендера виджета */}
                        {isWidgetRendered.current && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handlePaymentSuccess}
                                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Я уже оплатил — показать подтверждение
                                </button>
                                {paymentPolling && (
                                    <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Проверяем статус оплаты автоматически...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
