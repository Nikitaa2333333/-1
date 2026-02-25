const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

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

// Функция для сброса сессии
const resetSession = (id) => { delete userSessions[id]; };

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
            `👋 <b>Добро пожаловать в Apelsinka Bar!</b>\n\nЯ помогу вам оформить заказ без лишних звонков.`,
            Markup.keyboard([['🍓 Посмотреть меню'], ['📦 Мои заказы']]).resize()
        );
    }
});

// 1. Сбор телефона
bot.hears('🚀 Начать оформление', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;

    session.step = 'phone';
    ctx.reply(
        `Шаг 1/3: Для связи нам нужен ваш номер телефона. Нажмите кнопку ниже:`,
        Markup.keyboard([[Markup.button.contactRequest('📞 Отправить номер телефона')], ['❌ Отмена']]).resize()
    );
});

// Обработка контакта -> Переход к Адресу
bot.on('contact', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (session && session.step === 'phone') {
        session.phone = ctx.message.contact.phone_number;
        session.step = 'address';

        ctx.reply(
            `✅ Номер получен!\n\nШаг 2/3: Напишите адрес доставки (Улица, дом, квартира, подъезд):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
    }
});

// Обработка текста (Адрес и Время)
bot.on('text', (ctx) => {
    const session = userSessions[ctx.from.id];
    if (!session) return;

    if (ctx.message.text === '❌ Отмена') {
        resetSession(ctx.from.id);
        return ctx.reply('Заказ отменен. Ждем вас снова!', Markup.removeKeyboard());
    }

    // Если ввели адрес -> Переход к Времени
    if (session.step === 'address') {
        session.address = ctx.message.text;
        session.step = 'time';
        ctx.reply(
            `📍 Адрес записан: ${session.address}\n\nШаг 3/3: Когда доставить?`,
            Markup.keyboard([
                ['🔥 Как можно скорее'],
                ['🕒 В течение часа'],
                ['📅 На конкретное время'],
                ['❌ Отмена']
            ]).resize()
        );
        return;
    }

    // Если ввели время (или нажали кнопку) -> Итоговый чек
    if (session.step === 'time') {
        session.deliveryTime = ctx.message.text;
        session.step = 'confirm';

        const total = session.product.price;
        const summary = `
📦 <b>ВАШ ЗАКАЗ СФОРМИРОВАН</b>
─────────────────────
<b>Товар:</b> ${session.product.name}
<b>Цена:</b> ${total} ₽

<b>Получатель:</b> ${ctx.from.first_name}
<b>Телефон:</b> ${session.phone}
<b>Адрес:</b> ${session.address}
<b>Время:</b> ${session.deliveryTime}
─────────────────────
<i>Проверьте данные. Если все верно — переходите к оплате!</i>`;

        ctx.replyWithHTML(
            summary,
            Markup.inlineKeyboard([
                [Markup.button.url('💳 Оплатить заказ (через карту)', 'https://example.com/payment_mock')],
                [Markup.button.callback('❌ Отменить', 'cancel_order')]
            ])
        );

        // Бот "засыпает" для этого юзера или ждет оплаты
        // В реальности тут данные летят в БД
    }
});

bot.action('cancel_order', (ctx) => {
    resetSession(ctx.from.id);
    ctx.editMessageText('Заказ отменен 🗑');
});

bot.hears('🍓 Посмотреть меню', (ctx) => {
    let menu = "🛍 <b>Наше меню:</b>\n\n";
    Object.values(products).forEach(p => {
        menu += `• ${p.name} — ${p.price} ₽\n`;
    });
    ctx.replyWithHTML(menu, Markup.keyboard([['🚀 Начать оформление'], ['❌ Отмена']]).resize());
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Бот обновлен и готов к автоматическим заказам!');
