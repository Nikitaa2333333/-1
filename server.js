import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs';

// Конфигурация переменных окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Мидлвары для обработки JSON и данных форм
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Импорты API функций (динамические, так как это Vercel-style хендлеры)
import sendOrderHandler from './api/send-order.js';
import webhookHandler from './api/webhook.js';
import saveContentHandler from './api/save-content.js';
import checkPaymentHandler from './api/check-payment.js';
import refundHandler from './api/refund.js';

// Хелпер для адаптации Vercel хендлеров под Express
const vercelToExpress = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

// API роуты
app.post('/api/send-order', vercelToExpress(sendOrderHandler));
app.post('/api/webhook', vercelToExpress(webhookHandler));
app.post('/api/save-content', vercelToExpress(saveContentHandler));
app.get('/api/check-payment', vercelToExpress(checkPaymentHandler));
app.post('/api/refund', vercelToExpress(refundHandler));

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

    bot.launch().then(() => {
        console.log('✅ Телеграм-бот успешно запущен');
    }).catch(err => {
        console.error('❌ Ошибка запуска бота:', err.message);
    });

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
