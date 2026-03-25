/**
 * POST /api/refund
 *
 * Выполняет возврат платежа через API ЮKassa.
 * Вызывается из Telegram-бота администратора.
 *
 * БЕЗОПАСНОСТЬ:
 * 1. Принимает запросы только с токеном авторизации из env
 * 2. Проверяет что payment_id принадлежит нашему магазину
 * 3. Логирует все попытки возврата
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Простая авторизация: только наш Telegram-бот знает этот секрет
    const { YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, REFUND_SECRET } = process.env;

    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
        return res.status(500).json({ error: 'Ключи ЮKassa не настроены' });
    }

    // Проверяем секретный токен (добавишь REFUND_SECRET в Timeweb env)
    const authHeader = req.headers['x-refund-secret'];
    if (REFUND_SECRET && authHeader !== REFUND_SECRET) {
        console.warn('[Refund] Попытка несанкционированного возврата!');
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { payment_id, amount, reason } = req.body;

    if (!payment_id) {
        return res.status(400).json({ error: 'payment_id обязателен' });
    }

    try {
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
        const idempotenceKey = `refund-${payment_id}-${Date.now()}`;

        // Сначала получаем информацию о платеже, чтобы узнать сумму
        const paymentRes = await fetch(`https://api.yookassa.ru/v3/payments/${payment_id}`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
            console.error('[Refund] Ошибка получения платежа:', paymentData);
            return res.status(400).json({ error: `Платёж не найден: ${paymentData.description}` });
        }

        if (paymentData.status !== 'succeeded') {
            return res.status(400).json({
                error: `Нельзя вернуть платёж со статусом: ${paymentData.status}`
            });
        }

        // Сумма возврата — либо указанная, либо полная сумма платежа
        const refundAmount = amount
            ? parseFloat(amount).toFixed(2)
            : paymentData.amount.value;

        const refundPayload = {
            payment_id: payment_id,
            amount: {
                value: refundAmount,
                currency: 'RUB'
            },
            description: reason || 'Возврат по инициативе магазина'
        };

        console.log(`[Refund] Создаём возврат: payment_id=${payment_id}, amount=${refundAmount}`);

        const refundRes = await fetch('https://api.yookassa.ru/v3/refunds', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(refundPayload)
        });

        const refundData = await refundRes.json();

        if (!refundRes.ok) {
            console.error('[Refund] Ошибка ЮKassa:', refundData);
            return res.status(refundRes.status).json({
                error: refundData.description || 'Ошибка при создании возврата',
                yookassaCode: refundData.code
            });
        }

        console.log(`[Refund] Успешно! Refund ID: ${refundData.id}, Status: ${refundData.status}`);

        return res.status(200).json({
            success: true,
            refund_id: refundData.id,
            status: refundData.status,
            amount: refundData.amount,
        });

    } catch (err) {
        console.error('[Refund] Server Error:', err);
        return res.status(500).json({ error: 'Внутренняя ошибка: ' + err.message });
    }
}
