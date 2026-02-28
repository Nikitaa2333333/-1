export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const event = req.body;

    // Нас интересует только успешный платеж
    if (event.event !== 'payment.succeeded') {
        return res.status(200).json({ ok: true });
    }

    const { BOT_TOKEN, ADMIN_CHAT_IDS } = process.env;
    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        console.error('Webhook Error: Telegram config missing');
        return res.status(500).end();
    }

    const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());

    try {
        // Достаем данные заказа, которые мы засунули в metadata при создании платежа
        const order = JSON.parse(event.object.metadata.orderData);

        const itemsText = order.items
            .map(item => `• ${item.name} × ${item.quantity} — ${item.price * item.quantity} ₽`)
            .join('\n');

        const totalText = `
─────────────────────
💰 <b>ОПЛАЧЕНО: ${order.total} ₽</b>
${order.discount ? `🏷 Скидка: ${order.discount} ₽` : ''}
🚚 Доставка: ${order.deliveryCost} ₽
─────────────────────
`;

        const userText = `
👤 <b>КЛИЕНТ:</b>
Имя: ${order.name}
Телефон: ${order.phone}
Тип: ${order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
${order.address ? `Адрес: ${order.address}` : ''}
${order.comment ? `💬 Коммент: ${order.comment}` : ''}
`;

        const message = `✅ <b>ЗАКАЗ ОПЛАЧЕН (ЮKASSA)!</b>\n${itemsText}${totalText}${userText}\n\n<i>ID транзакции: ${event.object.id}</i>`;

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

        return res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('Webhook Processing Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
