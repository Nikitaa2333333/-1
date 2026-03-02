export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let {
        BOT_TOKEN,
        ADMIN_CHAT_IDS,
        YOOKASSA_SHOP_ID,
        YOOKASSA_SECRET_KEY,
        VERCEL_URL // Автоматическая переменная Vercel для формирования URL вебхука
    } = process.env;

    // 🔥 ТЕСТОВЫЕ КЛЮЧИ ЮKASSA (Твои личные из Sandbox!)
    if (!YOOKASSA_SHOP_ID) {
        YOOKASSA_SHOP_ID = '1288702';
        YOOKASSA_SECRET_KEY = 'test_E3TyzQ80H1z7e2XOvU_VZbdHqGqpsyEX7ESUXUe8FjQ';
    }

    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        return res.status(500).json({ error: 'ОШИБКА: Настройки Telegram (BOT_TOKEN или ADMIN_CHAT_IDS) не найдены' });
    }

    const order = req.body;
    console.log('[API] New order request:', {
        name: order.name,
        total: order.total,
        type: order.type
    });

    const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());

    // Если ключи ЮKassa есть, создаем платеж
    if (YOOKASSA_SHOP_ID && YOOKASSA_SECRET_KEY) {
        try {
            const idempotenceKey = Date.now().toString() + Math.random().toString(36).substring(7);
            const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

            const { type = 'embedded' } = order;

            // Формируем return_url динамически на основе хоста
            const host = req.headers.host;
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const returnUrl = `${protocol}://${host}/checkout?success=true`;

            const paymentData = {
                amount: {
                    value: String(order.total),
                    currency: 'RUB'
                },
                confirmation: type === 'redirect'
                    ? { type: 'redirect', return_url: returnUrl }
                    : { type: 'embedded' },
                capture: true,
                description: `Заказ: ${order.name} (${order.phone})`,
                metadata: {
                    orderData: JSON.stringify(order)
                }
            };

            console.log(`[API] Creating YooKassa payment (${type})...`);
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
                console.error('[API] YooKassa Error Response:', payment);
                return res.status(response.status).json({
                    error: payment.description || 'Ошибка ЮKassa: ' + (payment.code || 'unknown')
                });
            }

            console.log('[API] YooKassa Payment Created:', payment.id);

            // Возвращаем данные для фронтенда
            return res.status(200).json({
                success: true,
                confirmationToken: payment.confirmation?.confirmation_token,
                paymentUrl: payment.confirmation?.confirmation_url
            });

        } catch (err) {
            console.error('[API] Server Error:', err);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + err.message });
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
${order.apartment ? `Кв./офис: ${order.apartment}` : ''}
${order.intercom ? `Домофон: ${order.intercom}` : ''}
${order.entrance ? `Подъезд: ${order.entrance}` : ''}
${order.floor ? `Этаж: ${order.floor}` : ''}
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
