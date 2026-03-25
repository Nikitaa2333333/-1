import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';
import fs from 'fs';

// Конфигурация переменных окружения (только для локальной разработки)
try {
    const { default: dotenv } = await import('dotenv');
    dotenv.config();
} catch (e) {
    console.log('ℹ️ Dotenv не найден или файл .env отсутствует (это нормально для сервера Timeweb)');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === Защита от кривых URL (боты-сканеры шлют невалидные пути типа /%c0) ===
app.use((req, res, next) => {
    try {
        decodeURIComponent(req.path);
        next();
    } catch (e) {
        res.status(400).send('Bad Request: Invalid URL encoding');
    }
});

// Мидлвары для обработки JSON и данных форм
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Импорты API функций (динамические, так как это Timeweb-v3 хендлеры)
import sendOrderHandler from './api/send-order.js';
import webhookHandler from './api/webhook.js';
import saveContentHandler from './api/save-content.js';
import getContentHandler from './api/get-content.js';
import checkPaymentHandler from './api/check-payment.js';
import refundHandler from './api/refund.js';

// Хелпер для адаптации кода под Express (Timeweb)
const timewebToExpress = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

// API роуты
app.post('/api/send-order', timewebToExpress(sendOrderHandler));
app.post('/api/webhook', timewebToExpress(webhookHandler));
app.post('/api/save-content', timewebToExpress(saveContentHandler));
app.get('/api/get-content', timewebToExpress(getContentHandler));
app.get('/api/check-payment', timewebToExpress(checkPaymentHandler));
app.post('/api/refund', timewebToExpress(refundHandler));

// Диагностика для нас (проверка версии кода)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'working',
        platform: 'Timeweb-v3',
        time: new Date().toISOString(),
        env: {
            hasShopId: !!process.env.YOOKASSA_SHOP_ID,
            hasSecret: !!process.env.YOOKASSA_SECRET_KEY,
            hasGitToken: !!process.env.GITHUB_TOKEN
        }
    });
});

// Раздача статических файлов фронтенда
app.use(express.static(path.join(__dirname, 'dist')));

// Для Single Page Application (React Router): все остальные запросы отдают index.html
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Run npm run build first.');
    }
});

// === Глобальный обработчик ошибок Express ===
app.use((err, req, res, next) => {
    if (err instanceof URIError) {
        return res.status(400).send('Bad Request: Invalid URL');
    }
    console.error('Unhandled Express error:', err);
    res.status(500).send('Internal Server Error');
});

// === Запуск Телеграм-бота ===
if (process.env.BOT_TOKEN) {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    const ADMIN_IDS = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

    bot.start((ctx) => {
        ctx.replyWithHTML(
            `👋 <b>Добро пожаловать в Apelsinka Bar!</b>\n\n` +
            `Оформить заказ и посмотреть наше меню можно на сайте:\n` +
            `🌐 <a href="https://apelsinkabar.ru">apelsinkabar.ru</a>\n\n` +
            `Заходите в гости за самой вкусной клубникой! 🍓`,
            Markup.inlineKeyboard([
                [Markup.button.url('🛍 Перейти на сайт', 'https://apelsinkabar.ru')]
            ])
        );
    });

    bot.on('text', (ctx) => {
        if (ctx.message.text.startsWith('/')) return;
        
        const userLink = ctx.from.username 
            ? `@${ctx.from.username}` 
            : `<a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>`;
            
        const adminMessage = `💌 <b>Новое сообщение от клиента!</b>\nОт кого: ${userLink}\nТекст:\n<i>${ctx.message.text}</i>`;

        ADMIN_IDS.forEach(adminId => {
            bot.telegram.sendMessage(adminId, adminMessage, { parse_mode: 'HTML' })
                .catch(err => console.error(`Не удалось переслать сообщение админу ${adminId}:`, err.message));
        });

        ctx.reply('Спасибо за сообщение! Мы передали его менеджеру, скоро вам ответят. 🍓');
    });

    // Сначала удаляем webhook (на случай если был установлен ранее),
    // потом запускаем polling. При 409 — ждём и пробуем снова.
    const launchBot = async (retryDelay = 5000) => {
        try {
            await bot.telegram.deleteWebhook({ drop_pending_updates: true });
            await bot.launch();
            console.log('✅ Телеграм-бот успешно запущен');
        } catch (err) {
            if (err.message && err.message.includes('409')) {
                console.warn(`⚠️ Бот занят другим процессом (409). Повтор через ${retryDelay / 1000}с...`);
                setTimeout(() => launchBot(retryDelay), retryDelay);
            } else {
                console.error('❌ Ошибка запуска бота:', err.message);
            }
        }
    };

    launchBot();

    // Безопасное завершение
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
    console.warn('⚠️ BOT_TOKEN не найден, бот не запущен');
}

// === Запуск веб-сервера ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🏠 Сайт доступен по адресу: http://localhost:${PORT}`);
});
