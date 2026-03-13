/**
 * POST /api/webhook
 *
 * Принимает уведомления от ЮKassa и отправляет сообщение в Telegram.
 *
 * БЕЗОПАСНОСТЬ:
 * 1. Проверка IP — принимаем запросы ТОЛЬКО с серверов ЮKassa
 * 2. Обрабатываем ТОЛЬКО событие payment.succeeded
 * 3. Данные заказа берём из metadata (засунули туда при создании платежа)
 *    и не доверяем данным из тела вебхука напрямую
 */

// Официальные IP-адреса серверов ЮKassa:
// https://yookassa.ru/developers/using-api/webhooks#ip
const YOOKASSA_IP_RANGES = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11/32',
    '77.75.156.35/32',
    '77.75.154.128/25',
];

/**
 * Проверяет, входит ли IP-адрес в CIDR-диапазон
 */
function ipInCidr(ip, cidr) {
    try {
        // Если это одиночный IP (с /32 или без маски)
        const [range, bits] = cidr.split('/');
        const mask = bits ? parseInt(bits) : 32;

        const ipNum = ip.split('.').reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0;
        const rangeNum = range.split('.').reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0;
        const maskNum = mask === 0 ? 0 : (0xFFFFFFFF << (32 - mask)) >>> 0;

        return (ipNum & maskNum) === (rangeNum & maskNum);
    } catch {
        return false;
    }
}

/**
 * Проверяет, что IP является официальным IP ЮKassa
 */
function isYooKassaIP(ip) {
    // В dev-режиме (localhost) пропускаем проверку
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return true;
    }
    return YOOKASSA_IP_RANGES.some(cidr => ipInCidr(ip, cidr));
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // =========================================================
    // ПРОВЕРКА IP (КРИТИЧНО ДЛЯ БЕЗОПАСНОСТИ)
    // Принимаем запросы ТОЛЬКО с официальных серверов ЮKassa
    // =========================================================
    const rawIp = (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.socket?.remoteAddress ||
        ''
    ).replace(/^::ffff:/, ''); // убираем IPv4-mapped IPv6 префикс

    if (!isYooKassaIP(rawIp)) {
        console.warn(`[Webhook] Заблокирован запрос с чужого IP: ${rawIp}`);
        // Возвращаем 200 чтобы не раскрывать информацию о системе защиты
        return res.status(200).json({ ok: true });
    }

    console.log(`[Webhook] Запрос с IP: ${rawIp} — ОК`);

    const event = req.body;

    // Логируем все входящие события (для отладки)
    console.log(`[Webhook] Событие: ${event.event}, ID платежа: ${event.object?.id}`);

    // Нас интересует только успешный платеж
    if (event.event !== 'payment.succeeded') {
        return res.status(200).json({ ok: true });
    }

    const { BOT_TOKEN, ADMIN_CHAT_IDS } = process.env;
    if (!BOT_TOKEN || !ADMIN_CHAT_IDS) {
        console.error('[Webhook] КРИТИЧНО: Telegram config missing');
        return res.status(500).end();
    }

    const adminIds = ADMIN_CHAT_IDS.split(',').map(id => id.trim());

    try {
        // =========================================================
        // Данные заказа берём из metadata — они были записаны при
        // создании платежа на НАШЕМ сервере, а не переданы клиентом
        // =========================================================
        const paymentObj = event.object;
        
        // Сборка данных из чанков (od0, od1...) или из прямого поля orderData
        const metadata = paymentObj.metadata || {};
        let orderStr = '';
        if (metadata.orderData) {
            orderStr = metadata.orderData;
        } else {
            const keys = Object.keys(metadata)
                .filter(k => k.startsWith('od'))
                .sort((a, b) => parseInt(a.replace('od', '')) - parseInt(b.replace('od', '')));
            keys.forEach(k => { orderStr += metadata[k]; });
        }

        const order = JSON.parse(orderStr || '{}');

        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'https';

        const itemsText = (order.items || [])
            .map(item => {
                const productUrl = item.id ? `${protocol}://${host}/product/${item.id}` : null;
                const nameText = productUrl ? `<a href="${productUrl}">${item.name}</a>` : `<b>${item.name}</b>`;
                return `• ${nameText} × ${item.quantity} — ${item.price * item.quantity} ₽`;
            })
            .join('\n');

        const totalText = [
            '─────────────────────',
            `💰 <b>ОПЛАЧЕНО: ${paymentObj.amount?.value} ₽</b>`,
            order.appliedPromo ? `🏷 Промокод: ${order.appliedPromo}` : '',
            order.discount > 0 ? `🎁 Общая скидка: ${order.discount} ₽` : '',
            `🚚 Доставка: ${order.deliveryCost || 0} ₽`,
            '─────────────────────',
        ].filter(Boolean).join('\n');

        const addressLines = [
            order.address ? `Адрес: ${order.address}` : '',
            order.apartment ? `Кв./офис: ${order.apartment}` : '',
            order.intercom ? `Домофон: ${order.intercom}` : '',
            order.entrance ? `Подъезд: ${order.entrance}` : '',
            order.floor ? `Этаж: ${order.floor}` : '',
            order.comment ? `💬 Коммент: ${order.comment}` : '',
        ].filter(Boolean).join('\n');

        const userText = [
            '👤 <b>КЛИЕНТ:</b>',
            `Имя: ${order.name || '—'}`,
            `Телефон: ${order.phone || '—'}`,
            `Тип: ${order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}`,
            `Время: ${order.deliveryTime === 'later' ? `На другой день (${order.targetDate || '?'}) [-10%]` : 'Сегодня'}`,
            addressLines,
        ].filter(Boolean).join('\n');

        const message = [
            '✅ <b>ЗАКАЗ ОПЛАЧЕН (ЮKASSA)!</b>',
            '',
            itemsText,
            totalText,
            userText,
            '',
            `<i>ID транзакции: ${paymentObj.id}</i>`,
        ].join('\n');

        // Отправляем всем администраторам
        await Promise.all(
            adminIds.map(chatId =>
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                })
            )
        );

        console.log(`[Webhook] Уведомление отправлено в Telegram. Payment ID: ${paymentObj.id}`);
        return res.status(200).json({ status: 'ok' });

    } catch (err) {
        console.error('[Webhook] Ошибка обработки:', err);
        return res.status(500).json({ error: err.message });
    }
}
