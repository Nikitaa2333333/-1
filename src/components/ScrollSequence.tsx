import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

const FRAME_COUNT = 189;

export const ScrollSequence = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    /* ── Scroll progress ─────────────────────────────── */
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    /* ── Draw ────────────────────────────────────────── */
    const draw = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imagesRef.current[Math.min(Math.max(0, index), FRAME_COUNT - 1)];
        if (!canvas || !ctx || !img?.complete) return;

        const cW = canvas.width, cH = canvas.height;
        const iR = img.width / img.height, cR = cW / cH;
        let dW: number, dH: number;

        if (iR > cR) { dH = cH; dW = cH * iR; }
        else { dW = cW; dH = cW / iR; }

        ctx.clearRect(0, 0, cW, cH);
        ctx.drawImage(img, (cW - dW) / 2, (cH - dH) / 2, dW, dH);
    }, []);

    const resize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(Math.round(smooth.get() * (FRAME_COUNT - 1)));
    }, [draw, smooth]);

    /* ── Preload ─────────────────────────────────────── */
    useEffect(() => {
        let loaded = 0;
        const imgs = new Array<HTMLImageElement>(FRAME_COUNT);
        imagesRef.current = imgs;

        // Разрешаем отрисовку сразу после первого кадра
        const QUICK_LOAD_THRESHOLD = 1;

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            imgs[i] = img;
            img.onload = img.onerror = () => {
                loaded++;

                // Как только загружен первый кадр — можем рендерить
                if (loaded === QUICK_LOAD_THRESHOLD) {
                    setIsLoaded(true);
                }
            };
            img.src = `/sequence/frame_${i}.webp`;
        }
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

    /* ── Beat helpers ────────────────────────────────── */
    const op = (s: number, e: number) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTransform(smooth, [s, s + (e - s) * 0.15, e - (e - s) * 0.15, e], [0, 1, 1, 0]);
    const y = (s: number, e: number) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTransform(smooth, [s, s + (e - s) * 0.2, e - (e - s) * 0.2, e], [30, 0, 0, -30]);

    const opA = op(0, 0.20); const yA = y(0, 0.20);
    const opB = op(0.25, 0.45); const yB = y(0.25, 0.45);
    const opC = op(0.50, 0.70); const yC = y(0.50, 0.70);
    const opD = op(0.75, 0.98); const yD = y(0.75, 0.98);
    const hintOp = useTransform(smooth, [0, 0.06], [1, 0]);

    /* ── RENDER ──────────────────────────────────────── */
    return (
        <div ref={containerRef} className="h-[400vh] w-full bg-[#050505] relative">



            {/* Sticky scene */}
            <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#050505]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

                {/* ── Beat A: Hero (0-20%) ── */}
                <motion.div style={{ opacity: opA, y: yA }} className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12 pointer-events-none text-center">
                    <div className="relative z-10 max-w-3xl flex flex-col items-center">
                        {/* Glow halo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-brand-hot/15 blur-[100px] rounded-full -z-10" />

                        <h1 className="font-dela text-[clamp(36px,9vw,100px)] leading-[1.1] text-white mb-6 whitespace-nowrap px-4">
                            Привет!<br />Это Апельсинка
                        </h1>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium max-w-lg leading-snug">
                            Свежая ягода в бельгийском шоколаде. Полностью ручная работа.
                        </p>
                    </div>
                </motion.div>

                {/* ── Beat B: Шоколад (25-45%) ── */}
                <motion.div style={{ opacity: opB, y: yB }} className="absolute inset-0 flex flex-col justify-center items-end p-6 md:p-12 pointer-events-none text-right">
                    <div className="relative z-10 max-w-2xl">
                        {/* Glow halo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-brand-hot/40 blur-[100px] rounded-full -z-10" />

                        <span className="inline-block text-brand-hot font-bold text-sm mb-4">Состав</span>
                        <h2 className="font-dela text-[clamp(36px,8vw,90px)] leading-[1.1] text-white mb-6 px-4">
                            Бельгийский<br />
                            <span className="text-brand-hot">шоколад</span>
                        </h2>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium max-w-lg ml-auto leading-snug">
                            Callebaut — выбор лучших кондитеров мира.
                        </p>
                    </div>
                </motion.div>

                {/* ── Beat C: Свежесть (50-70%) ── */}
                <motion.div style={{ opacity: opC, y: yC }} className="absolute inset-0 flex flex-col justify-center items-start p-6 md:p-12 pointer-events-none text-left">
                    <div className="relative z-10 max-w-2xl">
                        {/* Glow halo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-brand-hot/40 blur-[100px] rounded-full -z-10" />

                        <span className="inline-block text-brand-hot font-bold text-sm mb-4">Свежесть</span>
                        <h2 className="font-dela text-[clamp(36px,8vw,90px)] leading-[1.1] text-white mb-6 px-4">
                            Собрана<br />
                            <span className="text-brand-hot">сегодня</span>
                        </h2>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium max-w-lg leading-snug">
                            Никакой заморозки — только спелая ягода.
                        </p>
                    </div>
                </motion.div>

                {/* ── Beat D: Заказ (75-98%) ── */}
                <motion.div style={{ opacity: opD, y: yD }} className="absolute inset-0 flex flex-col justify-end items-center p-6 md:p-12 pb-32 md:pb-40 pointer-events-none text-center">
                    <div className="relative z-10 max-w-2xl flex flex-col items-center">
                        {/* Glow halo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-brand-hot/40 blur-[100px] rounded-full -z-10" />

                        <h2 className="font-dela text-[clamp(40px,10vw,100px)] leading-[1.1] text-white mb-6 px-4">
                            Сделай<br />
                            <span className="text-brand-hot">заказ</span>
                        </h2>
                        <p className="font-sans text-xl md:text-3xl text-white font-medium leading-snug">
                            Доставим за 60 минут к твоей двери.
                        </p>
                    </div>
                </motion.div>

                {/* ── Scroll Hint ── */}
                <motion.div
                    style={{ opacity: hintOp }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                >
                    <span className="text-[10px] font-bold text-white/30">Листай</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                        className="w-0.5 h-10 bg-gradient-to-b from-brand-hot to-transparent"
                    />
                </motion.div>

                {/* ── FIXED BUTTON "ВЫБРАТЬ КЛУБНИКУ" ── */}
                <a
                    href="#order"
                    className="absolute bottom-6 left-6 right-6 text-center md:left-auto md:bottom-10 md:right-10 md:w-auto z-50 bg-white text-brand-dark py-5 px-8 md:py-4 rounded-full font-sans font-bold text-base md:text-lg hover:bg-brand-pink transition-colors"
                >
                    Выбрать клубнику
                </a>

            </div>
        </div>
    );
};
