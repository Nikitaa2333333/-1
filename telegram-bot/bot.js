const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Список администраторов (берем из .env, разделенных запятой)
const ADMIN_IDS = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

// ─── /start ────────────────────────────────────────────────────────────────────
bot.start((ctx) => {
    ctx.replyWithHTML(
        `👋 <b>Добро пожаловать в Apelsinka Bar!</b>\n\n` +
        `Оформить заказ и посмотреть наше актуальное меню можно на сайте:\n` +
        `🌐 <a href="https://apelsinkabar.ru">apelsinkabar.ru</a>\n\n` +
        `📍 <b>Наш адрес:</b>\n` +
        `Украинский бульвар, 8, строение 1\n` +
        `<i>Ежедневно с 9:00 до 20:00</i>\n\n` +
        `📞 <b>Телефон:</b>\n` +
        `+7 (901) 729-39-19\n\n` +
        `📱 <b>Наши соцсети:</b>\n` +
        `• <a href="https://vk.ru/apelsinka_bar">ВКонтакте</a>\n` +
        `• <a href="https://www.instagram.com/apelsinka.bar">Instagram</a>\n` +
        `• <a href="https://www.tiktok.com/@apelsinka_bar?_r=1">TikTok</a>\n\n` +
        `Заходите в гости за самой вкусной клубникой! 🍓`,
        Markup.inlineKeyboard([
            [Markup.button.url('🛍 Перейти на сайт', 'https://apelsinkabar.ru')]
        ])
    );
});

// ─── Кнопка Товаров ────────────────────────────────────────────────────────────
bot.hears('🍓 Посмотреть наши товары', (ctx) => {
    ctx.replyWithHTML(
        `Посмотреть все наши товары можно по ссылке на нашем сайте:`,
        Markup.inlineKeyboard([
            [Markup.button.url('Перейти на сайт', 'https://apelsinkabar.ru')] // Заменить на правильный урл, если есть другой
        ])
    );
});

// ─── Обработка текстовых сообщений вне сценария (Поддержка) ──────────────────
bot.on('text', (ctx) => {
    // Игнорируем команды
    if (ctx.message.text.startsWith('/')) {
        return;
    }

    // Если он просто что-то написал — пересылаем админу
    const userLink = ctx.from.username ? `@${ctx.from.username}` : `<a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>`;
    const adminMessage = `💌 <b>Новое сообщение от клиента!</b>\nОт кого: ${userLink}\nТекст:\n<i>${ctx.message.text}</i>\n\nНомер телефона возьми в футере сайта, если нужно.`;

    ADMIN_IDS.forEach(adminId => {
        bot.telegram.sendMessage(adminId, adminMessage, { parse_mode: 'HTML' })
            .catch(err => console.error(`Не удалось переслать сообщение админу ${adminId}:`, err.message));
    });

    // Отвечаем клиенту
    ctx.reply('Спасибо за сообщение! Мы передали его менеджеру, скоро вам ответят. 🍓');
});

// ─── Запуск ────────────────────────────────────────────────────────────────────
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ Apelsinka Bot запущен!');
