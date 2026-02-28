export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        BOT_TOKEN,
        ADMIN_CHAT_IDS,
        YOOKASSA_SHOP_ID,
        YOOKASSA_SECRET_KEY,
        VERCEL_URL // Автоматическая переменная Vercel для формирования URL вебхука
    } = process.env;

    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        return res.status(500).json({ error: 'ОШИБКА: Настройки Telegram (BOT_TOKEN или ADMIN_CHAT_IDS) не найдены' });
    }

    const order = req.body;
    const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());

    // Если ключи ЮKassa есть, создаем платеж
    if (YOOKASSA_SHOP_ID && YOOKASSA_SECRET_KEY) {
        try {
            const idempotenceKey = Date.now().toString() + Math.random().toString(36).substring(7);
            const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

            const paymentData = {
                amount: {
                    value: order.total.toString(),
                    currency: 'RUB'
                },
                confirmation: {
                    type: 'redirect',
                    return_url: `https://${req.headers.host}/checkout?success=true`
                },
                capture: true,
                description: `Заказ для ${order.name} (${order.phone})`,
                metadata: {
                    // Запихиваем весь заказ в метаданные, чтобы вытащить их в вебхуке
                    orderData: JSON.stringify(order)
                }
            };

            const response = await fetch('https://api.yookassa.ru/v3/payments', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Idempotence-Key': idempotenceKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            const payment = await response.json();

            if (!response.ok) {
                console.error('YooKassa Error:', payment);
                throw new Error(payment.description || 'Ошибка создания платежа в ЮKassa');
            }

            // Возвращаем ссылку на оплату фронтенду
            return res.status(200).json({
                success: true,
                paymentUrl: payment.confirmation.confirmation_url
            });

        } catch (err) {
            console.error('YooKassa generic error:', err);
            return res.status(500).json({ error: 'Ошибка при создании платежа: ' + err.message });
        }
    }

    // Если ключей ЮKassa НЕТ — работаем по старинке (сразу шлем в телеграм)
    // Это наш "запасной аэродром" для тестов без ИП

    const itemsText = order.items
        .map(item => `• ${item.name} × ${item.quantity} — ${item.price * item.quantity} ₽`)
        .join('\n');

    const totalText = `
─────────────────────
💰 <b>ИТОГО: ${order.total} ₽</b>
${order.discount ? `🏷 Скидка: ${order.discount} ₽` : ''}
🚚 Доставка: ${order.deliveryCost} ₽
─────────────────────
`;

    const userText = `
👤 <b>КЛИЕНТ (БЕЗ ОПЛАТЫ):</b>
Имя: ${order.name}
Телефон: ${order.phone}
Тип: ${order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
${order.address ? `Адрес: ${order.address}` : ''}
${order.comment ? `💬 Коммент: ${order.comment}` : ''}
`;

    const message = `🛍 <b>НОВЫЙ ЗАКАЗ (ПРЯМАЯ КНОПКА)!</b>\n${itemsText}${totalText}${userText}`;

    try {
        const promises = adminIds.map(chatId =>
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            })
        );

        await Promise.all(promises);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
