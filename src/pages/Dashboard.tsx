import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Type, TicketPercent,
    Image as ImageIcon, Save, Plus, Trash2,
    ChevronRight, ChevronLeft, Sparkles, Upload,
    Undo2, Redo2, Star, Gift, Coffee, Award, Heart, CheckCircle
} from 'lucide-react';
import data from '../data/products.json';

type Section = 'general' | 'menu' | 'promos' | 'about';

const EMPTY_ARRAY: any[] = [];

// Вспомогательный компонент для ввода с задержкой (чтобы не лагало)
const DebouncedTextarea = ({ value, onChange, className, placeholder }: any) => {
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<any>(null);

    // Синхронизируем, если значение пришло снаружи (например, Undo)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onChange(val);
        }, 300); // Задержка 300мс перед обновлением глобального стейта
    };

    return (
        <textarea
            value={localValue || ''}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
};

const DebouncedInput = ({ value, onChange, className, placeholder, type = "text" }: any) => {
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onChange(val);
        }, 300);
    };

    return (
        <input
            type={type}
            value={localValue || ''}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
};

// Компонент одного товара
const ProductRow = memo(({ product, categories, onUpdate, onDelete }: any) => {
    const [hasDiscount, setHasDiscount] = useState(!!product.oldPrice);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onUpdate(product.id, { ...product, image: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newGallery = [...(product.gallery || []), { image: base64String }];
                onUpdate(product.id, { ...product, gallery: newGallery });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = (product.gallery || []).filter((_: any, i: number) => i !== index);
        onUpdate(product.id, { ...product, gallery: newGallery });
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-brand-pink/20 p-6 rounded-[2rem] space-y-4 group hover:border-brand-hot/50 transition-all shadow-sm">
            <div className="flex gap-6">
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

                <div className="flex-grow grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Название</span>
                        <DebouncedInput
                            value={product.name}
                            onChange={(val: string) => onUpdate(product.id, { ...product, name: val })}
                            className="w-full bg-transparent border-b-2 border-brand-pink/20 py-1 font-bold text-lg outline-none focus:border-brand-hot transition-colors"
                            placeholder="Введите название..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1 border-l-2 border-brand-pink/10 pl-4">
                        <div>
                            <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Цена</span>
                            <div className="relative flex items-center">
                                <DebouncedInput
                                    value={product.price?.replace(/\D/g, '') || ''}
                                    onChange={(val: string) => onUpdate(product.id, { ...product, price: val })}
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
                                        if (!e.target.checked) onUpdate(product.id, { ...product, oldPrice: null });
                                    }}
                                    className="w-4 h-4 accent-brand-hot cursor-pointer"
                                />
                            </div>
                            {hasDiscount && (
                                <div className="relative flex items-center mt-1">
                                    <DebouncedInput
                                        value={product.oldPrice?.replace(/\D/g, '') || ''}
                                        onChange={(val: string) => onUpdate(product.id, { ...product, oldPrice: val })}
                                        className="w-full bg-transparent border-b-2 border-brand-pink/20 py-1 font-bold text-sm text-gray-400 line-through outline-none focus:border-brand-hot transition-colors pr-6"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-0 font-bold text-gray-400 pointer-events-none text-sm">₽</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1 col-span-1">
                            <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Описание товара</span>
                            <DebouncedTextarea
                                value={product.desc}
                                onChange={(val: string) => onUpdate(product.id, { ...product, desc: val })}
                                className="w-full bg-brand-pink/5 rounded-xl border-none p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-hot transition-all h-20 resize-none"
                                placeholder="Добавьте аппетитное описание..."
                            />
                        </div>

                        <div className="flex flex-col gap-1 col-span-1 md:border-l-2 md:border-brand-pink/10 md:pl-4">
                            <span className="text-[10px] font-black text-brand-hot uppercase tracking-wider">Дополнительные фото</span>
                            <div className="flex gap-2 overflow-x-auto pb-1 mt-1 custom-scrollbar">
                                {(product.gallery || []).map((g: any, i: number) => (
                                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden relative group/gal flex-shrink-0 shadow-sm">
                                        <img src={g.image} className="w-full h-full object-cover" />
                                        <div
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/gal:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => removeGalleryImage(i)}
                                        >
                                            <Trash2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                ))}
                                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-brand-pink/50 flex flex-col items-center justify-center cursor-pointer hover:border-brand-hot transition-colors flex-shrink-0 text-brand-hot/50 hover:text-brand-hot">
                                    <Plus className="w-6 h-6" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start justify-end flex-shrink-0 pt-2">
                    <button onClick={() => onDelete(product.id)} className="p-2 text-brand-dark/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-brand-pink/5 p-3 rounded-xl">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 hide-scrollbar">
                    <span className="text-[10px] font-black text-brand-dark/50 uppercase tracking-wider mr-2">Категория:</span>
                    {categories.filter((c: any) => c.id !== 'all').map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => onUpdate(product.id, { ...product, category: cat.id })}
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
                    <DebouncedInput
                        value={product.weight}
                        onChange={(val: string) => onUpdate(product.id, { ...product, weight: val })}
                        className="w-24 bg-white border border-brand-pink/20 rounded-lg px-2 py-1 text-sm font-bold text-center outline-none focus:border-brand-hot"
                        placeholder="напр. 380 гр"
                    />
                </div>
            </div>
        </div>
    );
});

export const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    const [activeTab, setActiveTab] = useState<Section>('menu');
    const [formData, setFormData] = useState(data);
    const [history, setHistory] = useState<any[]>([JSON.parse(JSON.stringify(data))]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    const historyTimer = useRef<any>(null);

    const pushHistory = useCallback((newData: any) => {
        if (historyTimer.current) clearTimeout(historyTimer.current);
        historyTimer.current = setTimeout(() => {
            const nextData = JSON.parse(JSON.stringify(newData));
            setHistory(prev => {
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(nextData);
                return newHistory.length > 30 ? newHistory.slice(1) : newHistory;
            });
            setHistoryIndex(prev => Math.min(prev + 1, 30));
        }, 1000);
    }, [historyIndex]);

    const handleLogin = useCallback(() => {
        if (passwordInput === 'klub2025') {
            setIsAuthenticated(true);
        } else {
            setLoginError('Неверный пароль, братик! Попробуй еще раз 🍓');
            setPasswordInput('');
        }
    }, [passwordInput]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setFormData(JSON.parse(JSON.stringify(prevState)));
        }
    }, [historyIndex, history]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setFormData(JSON.parse(JSON.stringify(nextState)));
        }
    }, [historyIndex, history]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsSaving(false);
                alert('Супер! Данные сохранены. Хостинг (Vercel) уже начал обновление сайта. Изменения появятся в течение 1-2 минут! 🍓');
            } else {
                const errData = await response.json();
                throw new Error(errData.error || 'Ошибка сервера');
            }
        } catch (e: any) {
            setIsSaving(false);
            alert('Ошибка при сохранении: ' + e.message);
        }
    };

    const onUpdateProduct = useCallback((id: number, updatedProduct: any) => {
        setFormData(prev => {
            const index = prev.products.findIndex(p => p.id === id);
            if (index === -1) return prev;
            const newProducts = [...prev.products];
            newProducts[index] = updatedProduct;
            const nextData = { ...prev, products: newProducts };
            pushHistory(nextData);
            return nextData;
        });
    }, [pushHistory]);

    const onDeleteProduct = useCallback((id: number) => {
        if (confirm("Точно удалить товар?")) {
            setFormData(prev => {
                const newProducts = prev.products.filter(p => p.id !== id);
                const nextData = { ...prev, products: newProducts };
                pushHistory(nextData);
                return nextData;
            });
        }
    }, [pushHistory]);

    const updateField = useCallback((path: string, value: any) => {
        setFormData(prev => {
            const nextData = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current: any = nextData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            pushHistory(nextData);
            return nextData;
        });
    }, [pushHistory]);

    const addCategory = useCallback(() => {
        const name = prompt("Введите название нового раздела (категории):");
        if (!name || name.trim() === '') return;

        const id = 'cat_' + Date.now();
        setFormData(prev => {
            const newCategories = [...(prev.categories || []), { id, name }];
            const nextData = { ...prev, categories: newCategories };
            pushHistory(nextData);
            return nextData;
        });
        setActiveCategoryFilter(id);
    }, [pushHistory]);

    const removeCategory = useCallback((idToRemove: string) => {
        if (confirm("Точно удалить этот раздел? (товары внутри останутся без категории)")) {
            setFormData(prev => {
                const newCategories = (prev.categories || []).filter((c: any) => c.id !== idToRemove);
                const nextData = { ...prev, categories: newCategories };
                pushHistory(nextData);
                return nextData;
            });
            if (activeCategoryFilter === idToRemove) {
                setActiveCategoryFilter('all');
            }
        }
    }, [activeCategoryFilter, pushHistory]);

    const moveCategory = useCallback((index: number, direction: 'left' | 'right') => {
        setFormData(prev => {
            const newCategories = [...(prev.categories || [])];
            if (direction === 'left' && index > 1) { // 0 - "All", shouldn't move before All or swap with All
                const temp = newCategories[index - 1];
                newCategories[index - 1] = newCategories[index];
                newCategories[index] = temp;
            } else if (direction === 'right' && index < newCategories.length - 1 && index > 0) {
                const temp = newCategories[index + 1];
                newCategories[index + 1] = newCategories[index];
                newCategories[index] = temp;
            } else return prev;

            const nextData = { ...prev, categories: newCategories };
            pushHistory(nextData);
            return nextData;
        });
    }, [pushHistory]);

    const addProduct = useCallback(() => {
        const newProduct = {
            id: Date.now(),
            category: activeCategoryFilter === 'all' ? "strawberry" : activeCategoryFilter,
            name: "Новый товар",
            weight: "0 гр",
            price: "1000",
            oldPrice: null,
            image: "/assets/products/strawberry-1.jpg",
            desc: "",
            gallery: []
        };
        setFormData(prev => {
            const nextData = { ...prev, products: [newProduct, ...prev.products] };
            pushHistory(nextData);
            return nextData;
        });
    }, [activeCategoryFilter, pushHistory]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 bg-brand-dark rounded-3xl flex items-center justify-center mx-auto rotate-3 shadow-xl shadow-brand-dark/20">
                        <Sparkles className="text-white w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="font-dela text-3xl text-brand-dark mb-2">Вход в Админку</h1>
                        <p className="text-brand-dark/50 text-sm font-medium uppercase tracking-widest">Введите секретный пароль</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            placeholder="Пароль..."
                            className="w-full bg-[#F4F4F6] border-2 border-brand-pink/10 rounded-2xl px-6 py-4 font-bold text-center text-lg outline-none focus:border-brand-hot transition-all"
                            autoFocus
                        />
                        {loginError && <p className="text-red-500 font-bold text-sm italic">{loginError}</p>}
                        <button onClick={handleLogin} className="w-full py-5 bg-brand-hot text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-hot/30 hover:bg-brand-dark transition-all active:scale-95">
                            ОТКРЫТЬ ДВЕРЬ 🍓
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!formData || !formData.products) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-pink/5">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-hot mx-auto"></div>
                    <p className="font-bold text-brand-dark">Загрузка данных...</p>
                </div>
            </div>
        );
    }

    const filteredProducts = activeCategoryFilter === 'all'
        ? (formData.products || [])
        : (formData.products || []).filter((p: any) => p && p.category === activeCategoryFilter);

    return (
        <div className="min-h-screen bg-[#F4F4F6] text-brand-dark flex font-sans selection:bg-brand-hot selection:text-white pb-20 md:pb-0">
            <aside className="hidden md:flex w-80 bg-white border-r border-brand-pink/20 px-6 py-8 flex-col gap-10 sticky top-0 h-screen overflow-y-auto z-20">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center rotate-3 shadow-xl">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-dela text-2xl leading-none">АДМИН</h1>
                        <span className="text-[10px] font-black uppercase text-brand-hot">KLUB Control</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-3 flex-grow">
                    <TabButton id="menu" icon={ShoppingBag} label="Товары и Меню" active={activeTab} set={setActiveTab} />
                    <TabButton id="general" icon={LayoutDashboard} label="Тексты (Бегущая)" active={activeTab} set={setActiveTab} />
                    <TabButton id="promos" icon={TicketPercent} label="Предзаказ и Баннеры" active={activeTab} set={setActiveTab} />
                    <TabButton id="about" icon={ImageIcon} label="Тексты (О нас)" active={activeTab} set={setActiveTab} />
                </nav>
            </aside>

            <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-5xl mx-auto w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-pink/10">
                    <div>
                        <h2 className="font-dela text-3xl md:text-4xl leading-none mb-2">Настройка сайта</h2>
                        <p className="text-brand-dark/50 font-medium">Изменения применятся на сайте после публикации</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-[#F4F4F6] p-1.5 rounded-full shadow-inner">
                            <button onClick={handleUndo} disabled={historyIndex === 0} className={`p-3 rounded-full ${historyIndex === 0 ? 'text-black/10' : 'text-brand-dark hover:bg-white shadow-sm'}`}><Undo2 className="w-5 h-5" /></button>
                            <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className={`p-3 rounded-full ${historyIndex === history.length - 1 ? 'text-black/10' : 'text-brand-dark hover:bg-white shadow-sm'}`}><Redo2 className="w-5 h-5" /></button>
                        </div>
                        <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm md:text-lg transition-all shadow-xl ${isSaving ? 'bg-brand-dark/20' : 'bg-brand-hot text-white hover:bg-brand-dark shadow-brand-hot/30'}`}>
                            <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
                            {isSaving ? 'СОХРАНЯЕМ...' : 'ОПУБЛИКОВАТЬ'}
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'menu' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-brand-dark text-white p-6 rounded-[2rem] gap-4">
                                    <h3 className="font-dela text-2xl">Ваше меню</h3>
                                    <div className="flex flex-wrap gap-2 items-center flex-grow">
                                        {(formData.categories || EMPTY_ARRAY).map((cat: any, index: number) => (
                                            <div key={cat.id} className="relative group/cat">
                                                <button onClick={() => setActiveCategoryFilter(cat.id)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategoryFilter === cat.id ? 'bg-brand-hot text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                                                    {cat.name}
                                                </button>
                                                {cat.id !== 'all' && activeCategoryFilter === cat.id && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-brand-pink/20 z-20 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                                        <button onClick={() => moveCategory(index, 'left')} className="p-1 hover:bg-gray-100 text-brand-dark/50 hover:text-brand-hot transition-colors" title="Влево">
                                                            <ChevronLeft className="w-3 h-3" />
                                                        </button>
                                                        <button onClick={() => removeCategory(cat.id)} className="p-1 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Удалить раздел">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                        <button onClick={() => moveCategory(index, 'right')} className="p-1 hover:bg-gray-100 text-brand-dark/50 hover:text-brand-hot transition-colors" title="Вправо">
                                                            <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={addCategory} className="px-4 py-2 rounded-full text-sm font-bold transition-all bg-white/5 text-white/50 hover:bg-brand-hot hover:text-white border border-dashed border-white/20 flex items-center gap-1 ml-2">
                                            <Plus className="w-4 h-4" /> Раздел
                                        </button>
                                    </div>
                                    <button onClick={addProduct} className="bg-white text-brand-dark px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-hot hover:text-white transition-all shadow-lg w-full md:w-auto flex-shrink-0">
                                        <Plus className="w-5 h-5" /> Товар
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredProducts.map((product: any) => (
                                        <ProductRow key={product.id} product={product} categories={formData.categories || EMPTY_ARRAY} onUpdate={onUpdateProduct} onDelete={onDeleteProduct} />
                                    ))}
                                    {filteredProducts.length === 0 && <div className="text-center py-20 text-brand-dark/40 font-bold">Пусто...</div>}
                                </div>
                            </div>
                        )}
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <GlassCard title="Бегущая строка">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Текст (через /)</label>
                                        <DebouncedTextarea value={formData.marqueeText} onChange={(val: string) => updateField('marqueeText', val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg text-brand-dark outline-none transition-all h-40" />
                                    </div>
                                </GlassCard>
                                {formData.orderCTA && (
                                    <GlassCard title="Нижний блок">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Заголовок" value={formData.orderCTA.title} onChange={(val: string) => updateField('orderCTA.title', val)} />
                                            <InputField label="Кнопка" value={formData.orderCTA.buttonText} onChange={(val: string) => updateField('orderCTA.buttonText', val)} />
                                        </div>
                                        <div className="mt-6">
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Описание</label>
                                            <DebouncedTextarea value={formData.orderCTA.text} onChange={(val: string) => updateField('orderCTA.text', val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg text-brand-dark h-32 mt-2" />
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        )}
                        {activeTab === 'promos' && (
                            <div className="space-y-8">
                                {formData.promoBanner && (
                                    <GlassCard title="Баннер Предзаказа">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Заголовок 1" value={formData.promoBanner.titleLine1} onChange={(val: string) => updateField('promoBanner.titleLine1', val)} />
                                            <InputField label="Заголовок 2" value={formData.promoBanner.titleLine2} onChange={(val: string) => updateField('promoBanner.titleLine2', val)} />
                                        </div>
                                        <div className="mt-6">
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Описание</label>
                                            <DebouncedTextarea value={formData.promoBanner.subtitle} onChange={(val: string) => updateField('promoBanner.subtitle', val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-bold text-lg h-32" />
                                        </div>
                                        <div className="mt-6">
                                            <InputField label="Кнопка" value={formData.promoBanner.buttonText} onChange={(val: string) => updateField('promoBanner.buttonText', val)} />
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        )}
                        {activeTab === 'about' && (
                            <div className="space-y-8">
                                {formData.manifesto && (
                                    <GlassCard title="О Нас">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Заголовок</label>
                                            <DebouncedTextarea value={formData.manifesto.title} onChange={(val: string) => updateField('manifesto.title', val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-dela text-2xl h-32" />
                                            <InputField label="Доставка (жирным)" value={formData.manifesto.deliveryText} onChange={(val: string) => updateField('manifesto.deliveryText', val)} />
                                            <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">История</label>
                                            <DebouncedTextarea value={formData.manifesto.history} onChange={(val: string) => updateField('manifesto.history', val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-3xl p-6 font-sans text-lg h-48" />
                                            <InputField label="Миссия" value={formData.manifesto.mission} onChange={(val: string) => updateField('manifesto.mission', val)} />
                                        </div>
                                    </GlassCard>
                                )}

                                {formData.features && (
                                    <GlassCard title="Плашки преимуществ">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {formData.features.map((feature: any, idx: number) => (
                                                <div key={idx} className="bg-brand-pink/5 p-6 rounded-[2rem] space-y-4 border border-brand-pink/10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-hot shadow-sm">
                                                            {feature.icon === 'award' && <Award className="w-5 h-5" />}
                                                            {feature.icon === 'coffee' && <Coffee className="w-5 h-5" />}
                                                            {feature.icon === 'gift' && <Gift className="w-5 h-5" />}
                                                            {feature.icon === 'star' && <Star className="w-5 h-5" />}
                                                            {feature.icon === 'heart' && <Heart className="w-5 h-5" />}
                                                            {feature.icon === 'check' && <CheckCircle className="w-5 h-5" />}
                                                        </div>
                                                        <select
                                                            value={feature.icon}
                                                            onChange={(e) => updateField(`features.${idx}.icon`, e.target.value)}
                                                            className="bg-white border border-brand-pink/10 rounded-lg px-2 py-1 text-xs font-bold text-brand-dark outline-none cursor-pointer flex-grow"
                                                        >
                                                            <option value="award">Награда</option>
                                                            <option value="coffee">Крышка/Стакан</option>
                                                            <option value="gift">Подарок</option>
                                                            <option value="star">Звезда</option>
                                                            <option value="heart">Сердце</option>
                                                            <option value="check">Галочка</option>
                                                        </select>
                                                    </div>
                                                    <InputField label="Заголовок" value={feature.title} onChange={(val: string) => updateField(`features.${idx}.title`, val)} />
                                                    <div className="space-y-1 mt-2">
                                                        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">Описание</label>
                                                        <DebouncedTextarea value={feature.description} onChange={(val: string) => updateField(`features.${idx}.description`, val)} className="w-full bg-white border-2 border-brand-pink/10 rounded-2xl p-4 font-medium text-sm text-brand-dark h-24" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-pink/20 flex justify-around p-4 pb-safe z-50">
                <MobileTab id="menu" icon={ShoppingBag} active={activeTab} set={setActiveTab} />
                <MobileTab id="general" icon={LayoutDashboard} active={activeTab} set={setActiveTab} />
            </nav>
        </div>
    );
};

const TabButton = ({ id, icon: Icon, label, active, set }: any) => (
    <button onClick={() => set(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active === id ? 'bg-brand-hot text-white shadow-lg translate-x-2' : 'text-brand-dark hover:bg-white hover:text-brand-hot'}`}>
        <Icon className="w-5 h-5" />
        <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
        {active === id && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
);

const GlassCard = ({ title, children }: any) => (
    <div className="bg-white border border-brand-pink/10 rounded-[3rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-hot/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <h3 className="font-dela text-2xl md:text-3xl mb-8 flex items-center gap-4 relative z-10"><div className="w-3 h-10 bg-brand-hot rounded-full"></div>{title}</h3>
        <div className="relative z-10">{children}</div>
    </div>
);

const InputField = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-brand-hot tracking-widest pl-2">{label}</label>
        <DebouncedInput value={value} onChange={onChange} className="w-full bg-white border-2 border-brand-pink/10 rounded-2xl px-6 py-4 font-bold text-lg outline-none transition-all shadow-sm" />
    </div>
);

const MobileTab = ({ id, icon: Icon, active, set }: any) => (
    <button onClick={() => set(id)} className={`p-4 rounded-2xl transition-all ${active === id ? 'bg-brand-hot text-white shadow-lg scale-110' : 'text-brand-dark/40'}`}>
        <Icon className="w-6 h-6" />
    </button>
);
