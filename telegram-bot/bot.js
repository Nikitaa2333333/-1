const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Список администраторов (берем из .env, разделенных запятой)
const ADMIN_IDS = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

const products = {
    'prod_1': { name: "Клубника в шоколаде", price: 1500 },
    'prod_2': { name: "Малина в шоколаде", price: 1800 },
    'prod_3': { name: "Клубника Limeberry", price: 1700 },
    'prod_4': { name: "Сублимированные фрукты", price: 600 },
    'prod_5': { name: "Смузи и Фреши", price: 350 },
    'prod_6': { name: "Фирменные пончики", price: 150 },
    'prod_7': { name: "Сытные хот-доги", price: 250 }
};

const userSessions = {};

// Генерация уникального номера заказа
const generateOrderId = () => `APL-${Date.now().toString().slice(-6)}`;

// Сброс сессии
const resetSession = (id) => { delete userSessions[id]; };

// ─── /start ────────────────────────────────────────────────────────────────────
bot.start((ctx) => {
    const payload = ctx.startPayload;
    resetSession(ctx.from.id);

    if (payload && products[payload]) {
        const product = products[payload];
        userSessions[ctx.from.id] = { step: 'welcome', product };

        ctx.replyWithHTML(
            `🍓 <b>Отличный выбор!</b>\n\nВы выбрали: <b>${product.name}</b>\nЦена: <b>${product.price} ₽</b>\n\nНачнем оформление?`,
            Markup.keyboard([['🚀 Начать оформление'], ['❌ Отмена']]).resize()
        );
    } else {
        ctx.replyWithHTML(
            `👋 <b>Добро пожаловать в Apelsinka Bar!</b>\n\nЯ помогу вам оформить заказ быстро и без лишних звонков.`,
            Markup.keyboard([['🍓 Посмотреть меню']]).resize()
        );
    }
});

// ─── Шаг 1: Телефон ────────────────────────────────────────────────────────────
bot.hears('🚀 Начать оформление', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;

    session.step = 'phone';
    ctx.reply(
        `Шаг 1 из 3 📞\n\nДля связи нам нужен ваш номер телефона. Нажмите кнопку ниже — он отправится автоматически:`,
        Markup.keyboard([
            [Markup.button.contactRequest('📞 Отправить номер телефона')],
            ['❌ Отмена']
        ]).resize()
    );
});

// ─── Шаг 2: Адрес ──────────────────────────────────────────────────────────────
bot.on('contact', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (session && session.step === 'phone') {
        session.phone = ctx.message.contact.phone_number;
        session.step = 'address';

        ctx.reply(
            `✅ Телефон получен!\n\nШаг 2 из 3 📍\n\nНапишите адрес доставки:\n<i>Пример: ул. Ленина 5, кв. 12, подъезд 3</i>`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
    }
});

// ─── Текстовый ввод (Адрес → Время → Оплата → Подтверждение) ─────────────────
bot.on('text', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;

    const text = ctx.message.text;

    // Отмена в любой момент
    if (text === '❌ Отмена') {
        resetSession(ctx.from.id);
        return ctx.reply('Заказ отменен. Ждем вас снова! 🍓', Markup.removeKeyboard());
    }

    // ── Адрес ──
    if (session.step === 'address') {
        session.address = text;
        session.step = 'time';

        return ctx.reply(
            `📍 Адрес принят!\n\nШаг 3 из 3 🕒\n\nКогда вам доставить?`,
            Markup.keyboard([
                ['⚡ Как можно скорее'],
                ['🕒 В течение часа'],
                ['📅 На конкретное время'],
                ['❌ Отмена']
            ]).resize()
        );
    }

    // ── Время (кнопка или ручной ввод) ──
    if (session.step === 'time') {
        // Если выбрал "На конкретное время" — просим уточнить
        if (text === '📅 На конкретное время') {
            session.step = 'time_custom';
            return ctx.reply(
                `Напишите удобное время доставки (например: "Сегодня в 19:30"):`,
                Markup.keyboard([['❌ Отмена']]).resize()
            );
        }

        session.deliveryTime = text;
        return sendOrderSummary(ctx, session);
    }

    // ── Ручной ввод времени ──
    if (session.step === 'time_custom') {
        session.deliveryTime = text;
        return sendOrderSummary(ctx, session);
    }

    // ── "Оплатил" ──
    if (session.step === 'awaiting_payment') {
        if (text === '✅ Я оплатил') {
            return confirmPayment(ctx, session);
        }
    }
});

// ─── Отправка итогового чека ────────────────────────────────────────────────────
function sendOrderSummary(ctx, session) {
    session.orderId = generateOrderId();
    session.step = 'awaiting_payment';

    const summary =
        `📦 <b>ВАШИ ДАННЫЕ — ПРОВЕРЬТЕ</b>
─────────────────────
<b>Товар:</b> ${session.product.name}
<b>Сумма:</b> ${session.product.price} ₽

<b>Имя:</b> ${ctx.from.first_name}
<b>Телефон:</b> ${session.phone}
<b>Адрес:</b> ${session.address}
<b>Время:</b> ${session.deliveryTime}
─────────────────────
<b>№ заказа:</b> <code>${session.orderId}</code>

<i>Нажмите кнопку оплаты ниже. После оплаты нажмите «Я оплатил».</i>`;

    ctx.replyWithHTML(
        summary,
        Markup.inlineKeyboard([
            [Markup.button.url('💳 Оплатить заказ', 'https://example.com/payment_mock')],
            [Markup.button.callback('❌ Отменить заказ', 'cancel_order')]
        ])
    );

    // Показываем кнопку "Я оплатил" отдельным сообщением
    ctx.reply(
        `После того как оплатите — нажмите кнопку:`,
        Markup.keyboard([['✅ Я оплатил'], ['❌ Отмена']]).resize()
    );
}

// ─── Подтверждение оплаты ───────────────────────────────────────────────────────
function confirmPayment(ctx, session) {
    const { orderId, product, phone, address, deliveryTime } = session;

    // Клиенту — красивое подтверждение
    ctx.replyWithHTML(
        `🎉 <b>Спасибо! Оплата получена.</b>

✅ Заказ <b>#${orderId}</b> принят в работу!
🚚 Ждите доставки: <b>${deliveryTime}</b>

Если возникнут вопросы — пишите нам сюда же.
Хорошего настроения! 🍓`,
        Markup.removeKeyboard()
    );

    // Уведомление всем администраторам
    const adminMessage =
        `💰 <b>НОВЫЙ ОПЛАЧЕННЫЙ ЗАКАЗ!</b>
─────────────────────
<b>№ заказа:</b> ${orderId}
<b>Товар:</b> ${product.name} — ${product.price} ₽
<b>Клиент:</b> ${ctx.from.first_name} (@${ctx.from.username || 'нет'})
<b>Телефон:</b> ${phone}
<b>Адрес:</b> ${address}
<b>Время:</b> ${deliveryTime}
─────────────────────
<i>Заказ подтвержден клиентом!</i>`;

    ADMIN_IDS.forEach(adminId => {
        bot.telegram.sendMessage(adminId, adminMessage, { parse_mode: 'HTML' })
            .catch(err => console.error(`Не удалось отправить уведомление на ${adminId}:`, err.message));
    });

    resetSession(ctx.from.id);
}

// ─── Отмена через inline-кнопку ────────────────────────────────────────────────
bot.action('cancel_order', (ctx) => {
    resetSession(ctx.from.id);
    ctx.editMessageText('Заказ отменен 🗑');
    ctx.reply('Если передумаете — мы всегда здесь! 🍓', Markup.removeKeyboard());
});

// ─── Меню ──────────────────────────────────────────────────────────────────────
bot.hears('🍓 Посмотреть меню', (ctx) => {
    let menu = "🛍 <b>Наше меню:</b>\n\n";
    Object.values(products).forEach(p => {
        menu += `• ${p.name} — ${p.price} ₽\n`;
    });
    ctx.replyWithHTML(
        menu,
        Markup.inlineKeyboard(
            Object.keys(products).map(id => [
                Markup.button.callback(`Заказать: ${products[id].name}`, `order_${id}`)
            ])
        )
    );
});

bot.action(/order_(.+)/, (ctx) => {
    const productId = ctx.match[1];
    const product = products[productId];
    userSessions[ctx.from.id] = { step: 'welcome', product };

    ctx.answerCbQuery();
    ctx.replyWithHTML(
        `Вы выбрали: <b>${product.name}</b> — ${product.price} ₽\n\nГотовы оформить?`,
        Markup.keyboard([['🚀 Начать оформление'], ['❌ Отмена']]).resize()
    );
});

// ─── Запуск ────────────────────────────────────────────────────────────────────
bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ Apelsinka Bot запущен!');
