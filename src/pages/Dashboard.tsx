import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Type, TicketPercent,
    Image as ImageIcon, Save, Plus, Trash2,
    ChevronRight, Sparkles, Upload
} from 'lucide-react';
import data from '../data/products.json';

type Section = 'general' | 'menu' | 'promos' | 'about';

// Компонент одного товара (вынесен отдельно, чтобы не пропадал фокус при печати)
const ProductRow = ({ product, categories, onChange, onDelete }: any) => {
    const [hasDiscount, setHasDiscount] = useState(!!product.oldPrice);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Пока мы работаем без сервера, делаем локальную превьюшку
            const localUrl = URL.createObjectURL(file);
            onChange({ ...product, image: localUrl });
            alert("Фото загружено для предпросмотра! (Позже мы свяжем это с сервером для сохранения файла)");
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-brand-pink/20 p-6 rounded-[2rem] space-y-4 group hover:border-brand-hot/50 transition-all shadow-sm">
            {/* Верхний ряд: Фото и Основные данные */}
            <div className="flex gap-6">
                {/* Фото */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-pink/5 flex-shrink-0 relative group/img cursor-pointer">
                    <img src={product.image} className="w-full h-full object-cover" alt="Product" />
                    <div className="absolute inset-0 bg-brand-dark/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="w-6 h-6 text-white mb-1" />
                            <span className="text-[10px] text-white font-bold uppercase">Сменить</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                {/* Название и Цены */}
                <div className="flex-grow grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Название</span>
                        <input
                            value={product.name}
                            onChange={(e) => onChange({ ...product, name: e.target.value })}
                            className="w-full bg-transparent border-b-2 border-brand-pink/20 py-1 font-bold text-lg outline-none focus:border-brand-hot transition-colors"
                            placeholder="Введите название..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1 border-l-2 border-brand-pink/10 pl-4">
                        <div>
                            <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Цена</span>
                            <div className="relative flex items-center">
                                <input
                                    value={product.price?.replace(/\D/g, '') || ''} // Оставляем только цифры
                                    onChange={(e) => onChange({ ...product, price: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-brand-pink/20 py-1 font-bold text-lg outline-none focus:border-brand-hot transition-colors pr-6"
                                    placeholder="0"
                                />
                                <span className="absolute right-0 font-bold text-brand-dark pointer-events-none">₽</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Скидка?</span>
                                <input
                                    type="checkbox"
                                    checked={hasDiscount}
                                    onChange={(e) => {
                                        setHasDiscount(e.target.checked);
                                        if (!e.target.checked) onChange({ ...product, oldPrice: null });
                                    }}
                                    className="w-4 h-4 accent-brand-hot cursor-pointer"
                                />
                            </div>
                            {hasDiscount && (
                                <div className="relative flex items-center mt-1">
                                    <input
                                        value={product.oldPrice?.replace(/\D/g, '') || ''}
                                        onChange={(e) => onChange({ ...product, oldPrice: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-brand-pink/20 py-1 font-bold text-sm text-gray-400 line-through outline-none focus:border-brand-hot transition-colors pr-6"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-0 font-bold text-gray-400 pointer-events-none text-sm">₽</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Удаление */}
                <div className="flex items-start justify-end flex-shrink-0 pt-2">
                    <button onClick={onDelete} className="p-2 text-brand-dark/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Нижний ряд: Категории (Хештеги) и Вес */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-brand-pink/5 p-3 rounded-xl">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 hide-scrollbar">
                    <span className="text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mr-2">Категория:</span>
                    {categories.filter((c: any) => c.id !== 'all').map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => onChange({ ...product, category: cat.id })}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${product.category === cat.id
                                ? 'bg-brand-hot text-white'
                                : 'bg-white text-brand-dark/60 border border-brand-pink/20 hover:border-brand-hot'
                                }`}
                        >
                            #{cat.name}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-dark/50 uppercase tracking-wider">Вес/Объем:</span>
                    <input
                        value={product.weight || ''}
                        onChange={(e) => onChange({ ...product, weight: e.target.value })}
                        className="w-24 bg-white border border-brand-pink/20 rounded-lg px-2 py-1 text-sm font-bold text-center outline-none focus:border-brand-hot"
                        placeholder="напр. 380 гр"
                    />
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<Section>('menu');
    const [formData, setFormData] = useState(data);
    const [isSaving, setIsSaving] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setIsSaving(false);
                alert('Супер! Данные сохранены. Vercel уже собирает новую версию сайта (изменения появятся через 1-2 минуты).');
            } else {
                throw new Error(data.error || 'Неизвестная ошибка сервера');
            }
        } catch (e: any) {
            setIsSaving(false);
            if (e.message.includes('API') || e.message.includes('Token') || e.message.includes('ОШИБКА')) {
                alert('ОШИБКА ХОСТИНГА: ' + e.message);
            } else {
                alert('Сначала перезапусти сервер npm run dev, чтобы активировать локальное сохранение! Ошибка: ' + e.message);
            }
        }
    };

    const updateField = (path: string, value: any) => {
        const newConfig = { ...formData };
        const keys = path.split('.');
        let current: any = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setFormData(newConfig);
    };

    const updateProduct = (index: number, newProduct: any) => {
        const newProducts = [...formData.products];
        newProducts[index] = newProduct;
        setFormData({ ...formData, products: newProducts });
    };

    const deleteProduct = (index: number) => {
        if (confirm("Точно удалить товар?")) {
            const newProducts = formData.products.filter((_, i) => i !== index);
            setFormData({ ...formData, products: newProducts });
        }
    };

    // Вычисляем отфильтрованные продукты
    const filteredProducts = activeCategoryFilter === 'all'
        ? formData.products
        : formData.products.filter((p: any) => p.category === activeCategoryFilter);

    const addProduct = () => {
        const newProduct = {
            id: Date.now(),
            category: activeCategoryFilter === 'all' ? "strawberry" : activeCategoryFilter,
            name: "Новый товар",
            weight: "0 гр",
            price: "1000",
            oldPrice: null,
            image: "/assets/products/strawberry-1.jpg",
            desc: ""
        };
        setFormData({ ...formData, products: [newProduct, ...formData.products] });
    };

    const TabButton = ({ id, icon: Icon, label }: { id: Section, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === id
                ? 'bg-brand-hot text-white shadow-lg shadow-brand-hot/20 translate-x-2'
                : 'text-brand-dark hover:bg-white hover:text-brand-hot shadow-sm border border-transparent hover:border-brand-pink/20'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
            {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F4F4F6] text-brand-dark flex font-sans selection:bg-brand-hot selection:text-white pb-20 md:pb-0">

            {/* Sidebar */}
            <aside className="hidden md:flex w-80 bg-white border-r border-brand-pink/20 px-6 py-8 flex-col gap-10 sticky top-0 h-screen overflow-y-auto z-20 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center rotate-3 shadow-xl shadow-brand-dark/20">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-dela text-2xl leading-none text-brand-dark">АДМИН</h1>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-hot">KLUB Control</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-3 flex-grow">
                    <TabButton id="menu" icon={ShoppingBag} label="Товары и Меню" />
                    <TabButton id="general" icon={LayoutDashboard} label="Тексты (Бегущая)" />
                    <TabButton id="promos" icon={TicketPercent} label="Предзаказ и Баннеры" />
                    <TabButton id="about" icon={ImageIcon} label="Тексты (О нас)" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-5xl mx-auto w-full">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-pink/10">
                    <div>
                        <h2 className="font-dela text-3xl md:text-4xl text-brand-dark leading-none mb-2">Настройка сайта</h2>
                        <p className="text-brand-dark/50 font-medium text-sm md:text-base">Изменения применятся на сайте после публикации</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm md:text-lg transition-all shadow-xl w-full md:w-auto justify-center ${isSaving ? 'bg-brand-dark/20 text-brand-dark/50 cursor-not-allowed' : 'bg-brand-hot text-white hover:bg-brand-dark hover:scale-105 active:scale-95 shadow-brand-hot/30'
                            }`}
                    >
                        <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                        {isSaving ? 'СОХРАНЯЕМ...' : 'ОПУБЛИКОВАТЬ'}
                    </button>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Меню и Товары */}
                        {activeTab === 'menu' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-brand-dark text-white p-6 rounded-[2rem] shadow-xl gap-4">
                                    <h3 className="font-dela text-2xl">Ваше меню</h3>

                                    {/* Фильтр по категориям в админке */}
                                    <div className="flex flex-wrap gap-2">
                                        {formData.categories.map((cat: any) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategoryFilter(cat.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategoryFilter === cat.id
                                                    ? 'bg-brand-hot text-white shadow-lg'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={addProduct} className="bg-white text-brand-dark px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-hot hover:text-white transition-all active:scale-95 shadow-lg w-full md:w-auto mt-4 md:mt-0 justify-center">
                                        <Plus className="w-5 h-5" /> Новый товар
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {filteredProducts.map((product: any) => {
                                        // Находим оригинальный индекс товара в полном массиве formData.products
                                        const originalIndex = formData.products.findIndex((p: any) => p.id === product.id);
                                        return (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                categories={formData.categories}
                                                onChange={(updatedProduct: any) => updateProduct(originalIndex, updatedProduct)}
                                                onDelete={() => deleteProduct(originalIndex)}
                                            />
                                        )
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <div className="text-center py-20 text-brand-dark/40 font-bold">
                                            В этой категории пока нет товаров. Нажмите "Новый товар", чтобы добавить.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* General Section */}
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <GlassCard title="Бегущая строка">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Текст строки (через /)</label>
                                        <textarea
                                            value={formData.marqueeText}
                                            onChange={(e) => updateField('marqueeText', e.target.value)}
                                            className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg text-brand-dark focus:border-brand-hot outline-none transition-all h-40 shadow-sm"
                                        />
                                    </div>
                                </GlassCard>
                                <GlassCard title="Нижний блок (Перейти к заказу)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Заголовок" value={formData.orderCTA.title} onChange={(val) => updateField('orderCTA.title', val)} />
                                        <InputField label="Текст кнопки" value={formData.orderCTA.buttonText} onChange={(val) => updateField('orderCTA.buttonText', val)} />
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Текст описания</label>
                                        <textarea
                                            value={formData.orderCTA.text}
                                            onChange={(e) => updateField('orderCTA.text', e.target.value)}
                                            className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg text-brand-dark focus:border-brand-hot outline-none transition-all h-32 mt-2 shadow-sm"
                                        />
                                    </div>
                                </GlassCard>
                            </div>
                        )}



                        {/* Promos Section (Предзаказ) */}
                        {activeTab === 'promos' && (
                            <div className="space-y-8">
                                <GlassCard title="Баннер: Предзаказ 24 часа">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Первая строка (Заголовок)" value={formData.promoBanner.titleLine1} onChange={(val) => updateField('promoBanner.titleLine1', val)} />
                                        <InputField label="Вторая строка (Скидка)" value={formData.promoBanner.titleLine2} onChange={(val) => updateField('promoBanner.titleLine2', val)} />
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Подзаголовок (Описание акции)</label>
                                        <textarea
                                            value={formData.promoBanner.subtitle}
                                            onChange={(e) => updateField('promoBanner.subtitle', e.target.value)}
                                            className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg text-brand-dark focus:border-brand-hot outline-none transition-all h-32 shadow-sm"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <InputField label="Текст кнопки" value={formData.promoBanner.buttonText} onChange={(val) => updateField('promoBanner.buttonText', val)} />
                                    </div>
                                </GlassCard>
                            </div>
                        )}

                        {/* About Section */}
                        {activeTab === 'about' && (
                            <div className="space-y-8">
                                <GlassCard title="Секция: О Нас (Манифест)">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Главный заголовок</label>
                                            <textarea
                                                value={formData.manifesto.title}
                                                onChange={(e) => updateField('manifesto.title', e.target.value)}
                                                className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-dela text-2xl text-brand-dark focus:border-brand-hot outline-none transition-all h-32 shadow-sm mt-2"
                                            />
                                        </div>

                                        <InputField label="Текст про доставку (жирным)" value={formData.manifesto.deliveryText} onChange={(val) => updateField('manifesto.deliveryText', val)} />

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">История (Абзацы о проекте)</label>
                                            <textarea
                                                value={formData.manifesto.history}
                                                onChange={(e) => updateField('manifesto.history', e.target.value)}
                                                className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-sans font-medium text-lg text-brand-dark focus:border-brand-hot outline-none transition-all h-48 shadow-sm mt-2"
                                            />
                                        </div>

                                        <InputField label="Миссия (Нижняя строка)" value={formData.manifesto.mission} onChange={(val) => updateField('manifesto.mission', val)} />
                                    </div>
                                </GlassCard>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Мобильная навигация снизу */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-pink/20 flex justify-around p-4 pb-safe z-50">
                <MobileTab id="menu" icon={ShoppingBag} active={activeTab} set={setActiveTab} />
                <MobileTab id="general" icon={LayoutDashboard} active={activeTab} set={setActiveTab} />
            </nav>
        </div>
    );
};

// --- Helper Components ---

const GlassCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white border text-brand-dark border-brand-pink/10 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-hot/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <h3 className="font-dela text-2xl md:text-3xl mb-8 flex items-center gap-4 relative z-10">
            <div className="w-3 h-10 bg-brand-hot rounded-full"></div>
            {title}
        </h3>
        <div className="relative z-10">{children}</div>
    </div>
);

const InputField = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border-2 border-brand-pink/10 rounded-2xl px-6 py-4 font-bold text-lg text-brand-dark focus:border-brand-hot outline-none transition-all shadow-sm"
        />
    </div>
);

const MobileTab = ({ id, icon: Icon, active, set }: any) => (
    <button onClick={() => set(id)} className={`p-4 rounded-2xl transition-all ${active === id ? 'bg-brand-hot text-white shadow-lg shadow-brand-hot/30 scale-110' : 'text-brand-dark/40 hover:text-brand-hot hover:bg-brand-pink/5'}`}>
        <Icon className="w-6 h-6" />
    </button>
)
