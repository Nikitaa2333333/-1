import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

const FRAME_COUNT = 189;

export const ScrollSequence = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const draw = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imagesRef.current[Math.min(Math.max(0, index), FRAME_COUNT - 1)];

        if (!canvas || !ctx || !img?.complete || img.naturalWidth === 0) return;

        const cW = canvas.width, cH = canvas.height;
        const iW = img.naturalWidth, iH = img.naturalHeight;

        const iR = iW / iH, cR = cW / cH;
        let dW: number, dH: number;

        if (iR > cR) { dH = cH; dW = cH * iR; }
        else { dW = cW; dH = cW / iR; }

        const x = (cW - dW) / 2;
        const y = (cH - dH) / 2;

        ctx.clearRect(0, 0, cW, cH);
        ctx.drawImage(img, x, y, dW, dH);
    }, []);

    const resize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(Math.round(smooth.get() * (FRAME_COUNT - 1)));
    }, [draw, smooth]);

    useEffect(() => {
        const imgs = new Array<HTMLImageElement>(FRAME_COUNT);
        imagesRef.current = imgs;

        const loadFrame = (i: number): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = () => {
                    imgs[i] = img;
                    resolve();
                };
                img.src = `/sequence/frame_${i}.webp`;
            });
        };

        const initLoad = async () => {
            // 1. Грузим первый кадр для мгновенного показа (Critical Path)
            await loadFrame(0);
            setIsLoaded(true);

            // 2. Грузим первые 20 кадров быстро
            const urgentBatch = [];
            for (let i = 1; i < 20; i++) urgentBatch.push(loadFrame(i));
            await Promise.all(urgentBatch);

            // 3. Остальное догружаем пачками по 5, чтобы не блокировать сеть
            const BATCH_SIZE = 5;
            for (let i = 20; i < FRAME_COUNT; i += BATCH_SIZE) {
                const batch = [];
                for (let j = 0; j < BATCH_SIZE && (i + j) < FRAME_COUNT; j++) {
                    batch.push(loadFrame(i + j));
                }
                await Promise.all(batch);
            }
        };

        initLoad();
    }, []);

    useEffect(() => {
        const unsub = smooth.on('change', v => draw(Math.round(v * (FRAME_COUNT - 1))));
        return () => unsub();
    }, [smooth, draw]);

    useEffect(() => {
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [resize]);

    useEffect(() => { if (isLoaded) { resize(); draw(0); } }, [isLoaded, resize, draw]);

    const op = (s: number, e: number) =>
        useTransform(smooth, [s, s + (e - s) * 0.15, e - (e - s) * 0.15, e], [0, 1, 1, 0]);
    const yTransform = (s: number, e: number) =>
        useTransform(smooth, [s, s + (e - s) * 0.2, e - (e - s) * 0.2, e], [30, 0, 0, -30]);

    const opA = op(0, 0.20); const yA = yTransform(0, 0.20);
    const opB = op(0.25, 0.45); const yB = yTransform(0.25, 0.45);
    const opC = op(0.50, 0.70); const yC = yTransform(0.50, 0.70);
    const opD = op(0.75, 0.98); const yD = yTransform(0.75, 0.98);

    return (
        <div ref={containerRef} className="h-[400vh] w-full bg-[#B68D8A] relative">
            <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#B68D8A]">
                {/* Мягкая виньетка для бесшовности */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(182,141,138,0.4)_100%)]" />

                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

                {/* ── Beat A: Hero (0-20%) ── */}
                <motion.div style={{ opacity: opA, y: yA }} className="absolute inset-0 flex flex-col justify-center items-center px-[10%] pointer-events-none text-center">
                    <div className="relative z-10 max-w-4xl">
                        {/* Glow halo */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 mix-blend-screen"
                            style={{
                                background: 'radial-gradient(circle, #FF0080 0%, rgba(255, 0, 128, 0) 70%)',
                                filter: 'blur(80px)',
                                opacity: 1
                            }}
                        />
                        <h1 className="font-dela text-[clamp(32px,7vw,80px)] leading-[1.1] text-white mb-8">Привет, это «Апельсинка»</h1>
                        <p className="font-sans text-lg md:text-2xl text-white font-medium max-w-2xl mx-auto">
                            Свежая ягода в бельгийском шоколаде, полностью ручная работа.<br className="hidden md:block" />
                            А ещё — смузи, фреши и настоящий заряд витаминов из спелых фруктов каждый день.
                        </p>
                    </div>
                </motion.div>

                {/* ── Beat B: Шоколад (25-45%) ── */}
                <motion.div style={{ opacity: opB, y: yB }} className="absolute inset-0 flex flex-col justify-center items-center px-[10%] pointer-events-none text-center">
                    <div className="relative z-10 max-w-3xl">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 mix-blend-screen"
                            style={{
                                background: 'radial-gradient(circle, #FF0080 0%, rgba(255, 0, 128, 0) 70%)',
                                filter: 'blur(80px)',
                                opacity: 1
                            }}
                        />
                        <span className="inline-block text-[#FFEA00] font-bold text-sm md:text-base mb-6 tracking-widest uppercase">состав</span>
                        <h2 className="font-dela text-[clamp(36px,8vw,90px)] leading-[1.1] text-white mb-8">Бельгийский <span className="text-[#FFEA00]">шоколад</span></h2>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium max-w-2xl mx-auto">Callebaut — выбор лучших кондитеров мира.</p>
                    </div>
                </motion.div>

                {/* ── Beat C: Свежесть (50-70%) ── */}
                <motion.div style={{ opacity: opC, y: yC }} className="absolute inset-0 flex flex-col justify-center items-center px-[10%] pointer-events-none text-center">
                    <div className="relative z-10 max-w-3xl">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 mix-blend-screen"
                            style={{
                                background: 'radial-gradient(circle, #FF0080 0%, rgba(255, 0, 128, 0) 70%)',
                                filter: 'blur(80px)',
                                opacity: 1
                            }}
                        />
                        <span className="inline-block text-[#FFEA00] font-bold text-sm md:text-base mb-6 tracking-widest uppercase">свежесть</span>
                        <h2 className="font-dela text-[clamp(36px,8vw,90px)] leading-[1.1] text-white mb-8">Собрана <span className="text-[#FFEA00]">сегодня</span></h2>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium max-w-2xl mx-auto">Никакой заморозки — только спелая ягода.</p>
                    </div>
                </motion.div>

                {/* ── Beat D: Заказ (75-98%) ── */}
                <motion.div style={{ opacity: opD, y: yD }} className="absolute inset-0 flex flex-col justify-center items-center px-[10%] pointer-events-none text-center">
                    <div className="relative z-10 max-w-4xl">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 mix-blend-screen"
                            style={{
                                background: 'radial-gradient(circle, #FF0080 0%, rgba(255, 0, 128, 0) 70%)',
                                filter: 'blur(80px)',
                                opacity: 1
                            }}
                        />
                        <h2 className="font-dela text-[clamp(36px,8vw,80px)] leading-[1.1] text-white mb-8">Сделай <span className="text-[#FFEA00]">заказ</span></h2>
                        <p className="font-sans text-lg md:text-2xl text-white font-medium max-w-2xl mx-auto">Приготовим за 60 минут и доставим к твоей двери.</p>
                    </div>
                </motion.div>

                <a href="#products" className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white text-brand-dark py-4 px-10 rounded-3xl font-sans font-bold text-lg hover:bg-brand-pink transition-all active:scale-95 shadow-2xl pointer-events-auto text-center leading-tight">
                    Выбери свой <br /> вкус
                </a>
            </div>
        </div>
    );
};
