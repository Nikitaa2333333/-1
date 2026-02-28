export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { BOT_TOKEN, ADMIN_CHAT_IDS } = process.env;
    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        return res.status(500).json({ error: 'ОШИБКА: Настройки Telegram (BOT_TOKEN или ADMIN_CHAT_IDS) не найдены' });
    }

    const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());
    const order = req.body;

    // Формируем текст сообщения
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
👤 <b>КЛИЕНТ:</b>
Имя: ${order.name}
Телефон: ${order.phone}
Тип: ${order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
${order.address ? `Адрес: ${order.address}` : ''}
${order.comment ? `💬 Коммент: ${order.comment}` : ''}
`;

    const message = `🛍 <b>НОВЫЙ ЗАКАЗ С САЙТА!</b>\n${itemsText}${totalText}${userText}`;

    try {
        // Отправляем каждому админу
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

        const results = await Promise.all(promises);
        const allOk = results.every(r => r.ok);

        if (allOk) {
            return res.status(200).json({ success: true });
        } else {
            const errorText = await results[0].text();
            throw new Error(`Ошибка Telegram API: ${errorText}`);
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
