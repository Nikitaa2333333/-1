'use client';

import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

const FRAME_COUNT = 189;

export default function StrawberrySequence() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

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
        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            imgs[i] = img;
            img.onload = img.onerror = () => {
                loaded++;
                setLoadProgress(Math.floor((loaded / FRAME_COUNT) * 100));
                if (loaded === FRAME_COUNT) setIsLoaded(true);
            };
            img.src = `/sequence/frame_${i}.png`;
        }
    }, []);

    useEffect(() => smooth.on('change', v => draw(Math.round(v * (FRAME_COUNT - 1)))), [smooth, draw]);

    useEffect(() => {
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [resize]);

    useEffect(() => { if (isLoaded) { resize(); draw(0); } }, [isLoaded, resize, draw]);

    /* ── Beat helpers ────────────────────────────────── */
    const op = (s: number, e: number) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTransform(smooth, [s, s + (e - s) * .15, e - (e - s) * .15, e], [0, 1, 1, 0]);
    const y = (s: number, e: number) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTransform(smooth, [s, s + (e - s) * .2, e - (e - s) * .2, e], [30, 0, 0, -30]);

    const opA = op(0, .20); const yA = y(0, .20);
    const opB = op(.25, .45); const yB = y(.25, .45);
    const opC = op(.50, .70); const yC = y(.50, .70);
    const opD = op(.75, .98); const yD = y(.75, .98);
    const hintOp = useTransform(smooth, [0, .06], [1, 0]);

    const label: React.CSSProperties = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        color: '#FF3366',
        textTransform: 'uppercase',
        letterSpacing: '.14em',
        marginBottom: 14,
    };

    const big: React.CSSProperties = {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 800,
        lineHeight: .92,
        letterSpacing: '-0.05em',
        color: 'rgba(255,255,255,.92)',
        fontSize: 'clamp(60px, 10vw, 136px)',
        marginBottom: 20,
    };

    const sub: React.CSSProperties = {
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: 'rgba(255,255,255,.45)',
        lineHeight: 1.65,
        maxWidth: 440,
    };

    const overlay: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        padding: '0 48px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
    };

    /* ── RENDER ──────────────────────────────────────── */
    return (
        <div ref={containerRef} style={{ height: '400vh', background: '#050505' }}>

            {/* Loading */}
            {!isLoaded && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100, background: '#050505',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                }}>
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 20, fontWeight: 700, color: '#FF3366', letterSpacing: '-0.03em' }}>
                        APELSINKA
                    </p>
                    <div style={{ width: 160, height: 2, background: 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${loadProgress}%` }}
                            transition={{ duration: .3 }}
                            style={{ height: '100%', borderRadius: 99, background: '#FF3366' }}
                        />
                    </div>
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
                        {loadProgress}%
                    </p>
                </div>
            )}

            {/* Sticky scene */}
            <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: '#050505' }}>

                <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

                {/* A — Hero */}
                <motion.div style={{ ...overlay, opacity: opA, y: yA, justifyContent: 'flex-end', paddingBottom: 64 }}>
                    <p style={label}>Premium · 2026</p>
                    <h1 style={big}>
                        КЛУБ-<br />
                        <span style={{ color: '#FF3366', fontStyle: 'italic' }}>НИКА</span>
                    </h1>
                    <p style={sub}>Свежая ягода в бельгийском шоколаде</p>
                </motion.div>

                {/* B — Шоколад */}
                <motion.div style={{ ...overlay, opacity: opB, y: yB, justifyContent: 'center' }}>
                    <p style={label}>Состав</p>
                    <h2 style={big}>БЕЛЬ-<br /><span style={{ color: '#FF3366' }}>ГИЙСКИЙ</span><br />ШОКОЛАД</h2>
                    <p style={sub}>Callebaut — выбор лучших кондитеров мира</p>
                </motion.div>

                {/* C — Свежесть */}
                <motion.div style={{ ...overlay, opacity: opC, y: yC, justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' }}>
                    <p style={label}>Свежесть</p>
                    <h2 style={big}>СОБ-<br /><span style={{ color: '#FF3366', fontStyle: 'italic' }}>РАНА</span><br />СЕГОДНЯ</h2>
                    <p style={{ ...sub, maxWidth: 400 }}>Никакой заморозки — только спелая ягода</p>
                </motion.div>

                {/* D — CTA */}
                <motion.div style={{ ...overlay, opacity: opD, y: yD, justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', paddingBottom: 64 }}>
                    <p style={label}>Готов?</p>
                    <h2 style={big}>СДЕЛАЙ<br /><span style={{ color: '#FF3366' }}>ЗАКАЗ</span></h2>
                    <p style={{ ...sub, maxWidth: 360 }}>Доставим за 60 минут</p>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            marginTop: 28,
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 15,
                            color: 'white', textDecoration: 'none',
                            background: '#FF3366', padding: '14px 32px', borderRadius: 99,
                            boxShadow: '0 4px 24px rgba(255,51,102,.35)',
                            pointerEvents: 'auto',
                        }}
                    >
                        Написать в Instagram
                    </a>
                </motion.div>

                {/* Scroll hint */}
                <motion.div style={{
                    opacity: hintOp, position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none',
                }}>
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.14em' }}>
                        Листай
                    </p>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        style={{ width: 1, height: 44, background: 'linear-gradient(180deg,#FF3366,transparent)' }}
                    />
                </motion.div>

            </div>
        </div>
    );
}
